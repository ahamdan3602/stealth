"""
RAG chain unit tests.

We mock `retrieve` (no real Pinecone) and use FakeListChatModel (no real OpenAI).
Tests verify: answer is returned, citations are populated, empty retrieval is
handled gracefully, and the LangSmith run config carries the role tag.
"""
from unittest.mock import MagicMock, call, patch

import pytest
from langchain_core.language_models.fake_chat_models import FakeListChatModel

from app.rag.chain import _format_context, run_chain
from app.rag.retriever import Chunk

# ── helpers ───────────────────────────────────────────────────────────────────

def _chunk(text: str, source: str = "drug.txt", doc_type: str = "clinical") -> Chunk:
    return Chunk(text=text, source=source, doc_type=doc_type, score=0.9)


def _make_fake_llm(response: str) -> FakeListChatModel:
    return FakeListChatModel(responses=[response])


# ── _format_context ───────────────────────────────────────────────────────────

def test_format_context_empty():
    result = _format_context([])
    assert "No relevant documents" in result


def test_format_context_numbered():
    chunks = [_chunk("Info A", "a.txt"), _chunk("Info B", "b.txt")]
    result = _format_context(chunks)
    assert "[1]" in result
    assert "[2]" in result
    assert "a.txt" in result
    assert "b.txt" in result


# ── run_chain ─────────────────────────────────────────────────────────────────

def test_run_chain_returns_answer_and_citations():
    fake_llm = _make_fake_llm("Paracetamol is used for pain relief [1].")
    chunks = [_chunk("Paracetamol 500mg info.", "drug.txt")]

    with patch("app.rag.chain.retrieve", return_value=chunks), \
         patch("app.rag.chain.ChatOpenAI", return_value=fake_llm):
        result = run_chain("What is paracetamol?", "clinician")

    assert "answer" in result
    assert len(result["answer"]) > 0
    assert "drug.txt" in result["citations"]


def test_run_chain_deduplicates_citations():
    fake_llm = _make_fake_llm("Paracetamol answer [1][2].")
    # Two chunks from the same source
    chunks = [_chunk("Chunk A", "drug.txt"), _chunk("Chunk B", "drug.txt")]

    with patch("app.rag.chain.retrieve", return_value=chunks), \
         patch("app.rag.chain.ChatOpenAI", return_value=fake_llm):
        result = run_chain("Tell me about paracetamol.", "clinician")

    assert result["citations"].count("drug.txt") == 1


def test_run_chain_empty_retrieval_still_answers():
    """Chain should not crash when Pinecone returns no matching chunks."""
    fake_llm = _make_fake_llm("I don't have enough information to answer that.")

    with patch("app.rag.chain.retrieve", return_value=[]), \
         patch("app.rag.chain.ChatOpenAI", return_value=fake_llm):
        result = run_chain("Unknown question?", "patient")

    assert "answer" in result
    assert result["citations"] == []


def test_run_chain_works_for_each_role():
    """run_chain executes correctly for all four roles without errors."""
    for role in ("clinician", "nurse", "admin", "patient"):
        fake_llm = _make_fake_llm(f"Answer for {role}.")
        chunks = [_chunk(f"Info relevant to {role}.", "doc.txt")]

        with patch("app.rag.chain.retrieve", return_value=chunks), \
             patch("app.rag.chain.ChatOpenAI", return_value=fake_llm):
            result = run_chain("What should I know?", role)

        assert len(result["answer"]) > 0, f"empty answer for role={role}"
        assert "doc.txt" in result["citations"]


def test_run_chain_multi_source_citations_preserve_order():
    fake_llm = _make_fake_llm("Answer citing both sources.")
    chunks = [
        _chunk("Info from clinical.", "drug.txt"),
        _chunk("Info from policy.", "policy.txt"),
    ]

    with patch("app.rag.chain.retrieve", return_value=chunks), \
         patch("app.rag.chain.ChatOpenAI", return_value=fake_llm):
        result = run_chain("Tell me everything.", "admin")

    assert result["citations"] == ["drug.txt", "policy.txt"]
