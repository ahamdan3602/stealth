"""
Ingestion pipeline: raw text → chunks → embeddings → Pinecone with ACL metadata.

Uses the native openai + pinecone clients directly (no langchain-pinecone wrapper)
so the pipeline works on Python 3.14+.

Each chunk is stored with an `allowed_roles` list. The retriever filters on this
list at query time so users only ever get back chunks their role can see.
"""
import hashlib

from openai import OpenAI
from pinecone import Pinecone

from app.core.config import settings
from app.rag.chunker import split

# Maps doc_type (set at upload time) → which roles can retrieve those chunks.
ROLE_MAP: dict[str, list[str]] = {
    "clinical": ["clinician", "admin", "nurse"],
    "admin":    ["admin"],
    "patient":  ["patient", "admin"],
}

_EMBED_MODEL = "text-embedding-3-small"  # 1536-dim, cheap, fast


def _embed(texts: list[str]) -> list[list[float]]:
    """Batch-embed a list of texts. Returns one vector per text."""
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(input=texts, model=_EMBED_MODEL)
    return [item.embedding for item in response.data]


def _index():
    """Return the Pinecone index handle."""
    pc = Pinecone(api_key=settings.pinecone_api_key)
    return pc.Index(settings.pinecone_index)


def ingest_text(content: str, doc_type: str, source: str) -> int:
    """
    Chunk `content`, embed each chunk, upsert to Pinecone with ACL metadata.

    - doc_type: "clinical" | "admin" | "patient"
    - source:   filename or identifier shown in citations later
    - returns:  number of chunks upserted (0 if content is empty)
    """
    if doc_type not in ROLE_MAP:
        raise ValueError(f"unknown doc_type '{doc_type}'. Must be one of: {list(ROLE_MAP)}")

    chunks = split(content)
    if not chunks:
        return 0

    allowed_roles = ROLE_MAP[doc_type]
    embeddings = _embed(chunks)

    # Stable IDs mean re-ingesting the same file overwrites existing chunks
    # rather than creating duplicates.
    vectors = [
        {
            "id": hashlib.md5(f"{source}:{i}".encode()).hexdigest(),
            "values": embeddings[i],
            "metadata": {
                "text": chunks[i],          # stored so retriever can return the text
                "source": source,
                "doc_type": doc_type,
                "allowed_roles": allowed_roles,  # Pinecone filters on this at query time
                "chunk_index": i,
            },
        }
        for i in range(len(chunks))
    ]

    _index().upsert(vectors=vectors)
    return len(vectors)
