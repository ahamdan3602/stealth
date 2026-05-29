"""
RAG chain — milestone 3.

Pipeline: retrieve (role-filtered) → format context → role prompt | LLM → answer + citations.

LangSmith tracing is automatic when setup_langsmith() has been called at startup.
Each run is tagged with the user's role so traces can be filtered in the dashboard.
"""
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.rag.prompts import get_prompt
from app.rag.retriever import Chunk, retrieve


def _format_context(chunks: list[Chunk]) -> str:
    """Render retrieved chunks as a numbered reference block for the LLM prompt."""
    if not chunks:
        return "No relevant documents found in the knowledge base."
    return "\n\n".join(
        f"[{i + 1}] (source: {c.source})\n{c.text}"
        for i, c in enumerate(chunks)
    )


def run_chain(question: str, role: str) -> dict:
    """
    Run the full RAG chain for a given question and user role.

    Steps:
      1. Retrieve role-filtered chunks from Pinecone (ACL enforced in vector DB).
      2. Format chunks as numbered context for the LLM.
      3. Apply role-specific system prompt.
      4. Call the LLM and parse the response.
      5. Return answer + deduplicated citation sources.

    Returns:
        {"answer": str, "citations": list[str], "_context": str}
        _context is the raw formatted context string used for groundedness checking.
    """
    chunks = retrieve(question, role)
    context = _format_context(chunks)

    llm = ChatOpenAI(
        model=settings.chat_model,
        temperature=0,        # deterministic for clinical use
        api_key=settings.openai_api_key,
    )

    chain = get_prompt(role) | llm | StrOutputParser()

    answer = chain.invoke(
        {"context": context, "question": question},
        config={
            "run_name": "medguard-chat",
            "tags": [role, settings.chat_model],
            "metadata": {"role": role, "num_chunks": len(chunks)},
        },
    )

    # Deduplicate sources while preserving order for citation display
    seen: set[str] = set()
    citations: list[str] = []
    for chunk in chunks:
        if chunk.source not in seen:
            seen.add(chunk.source)
            citations.append(chunk.source)

    return {"answer": answer, "citations": citations, "_context": context}
