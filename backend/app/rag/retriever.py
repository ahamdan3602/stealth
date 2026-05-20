"""
Role-aware retriever: queries Pinecone with an ACL metadata filter so each
user role only sees chunks their role is listed in.
"""
from dataclasses import dataclass

from openai import OpenAI
from pinecone import Pinecone

from app.core.config import settings

_EMBED_MODEL = "text-embedding-3-small"


@dataclass
class Chunk:
    """A retrieved chunk returned to the RAG chain."""
    text: str
    source: str
    doc_type: str
    score: float


def _embed_query(query: str) -> list[float]:
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(input=[query], model=_EMBED_MODEL)
    return response.data[0].embedding


def retrieve(query: str, role: str, k: int = 4) -> list[Chunk]:
    """
    Return up to `k` chunks whose allowed_roles list contains `role`.

    The filter runs inside Pinecone — chunks the role cannot see are never
    ranked or returned, not hidden after the fact.

    Each Chunk has .text (for the LLM prompt) and .source (for citations).
    """
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index)

    results = index.query(
        vector=_embed_query(query),
        top_k=k,
        filter={"allowed_roles": {"$in": [role]}},
        include_metadata=True,
    )

    return [
        Chunk(
            text=match.metadata.get("text", ""),
            source=match.metadata.get("source", "unknown"),
            doc_type=match.metadata.get("doc_type", ""),
            score=match.score,
        )
        for match in results.matches
    ]
