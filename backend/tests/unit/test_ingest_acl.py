"""
Ingest ACL unit tests.

We mock _index() and _embed() so no real Pinecone or OpenAI calls are made.
We're testing that the *right metadata is constructed and passed* — specifically
that allowed_roles matches the ROLE_MAP for each doc_type.
"""
from unittest.mock import MagicMock, patch

import pytest

from app.rag.ingest import ROLE_MAP, ingest_text

# A fake 1536-dim embedding vector
_FAKE_VECTOR = [0.0] * 1536


def _patch_rag():
    """Context manager that patches both external calls in app.rag.ingest."""
    patch_index = patch("app.rag.ingest._index")
    patch_embed = patch("app.rag.ingest._embed")
    return patch_index, patch_embed


def _upserted_vectors(mock_index: MagicMock) -> list[dict]:
    """Pull the vectors list from the upsert call."""
    return mock_index.upsert.call_args.kwargs.get("vectors") or \
           mock_index.upsert.call_args.args[0]


# ── ROLE_MAP coverage ─────────────────────────────────────────────────────────

def test_clinical_chunks_allow_clinical_roles():
    patch_index, patch_embed = _patch_rag()
    with patch_index as mock_idx_factory, patch_embed as mock_embed:
        index = MagicMock()
        mock_idx_factory.return_value = index
        mock_embed.return_value = [_FAKE_VECTOR]

        ingest_text("Paracetamol 500mg. Take twice daily.", "clinical", "drug.txt")

        for v in _upserted_vectors(index):
            m = v["metadata"]
            assert set(m["allowed_roles"]) == set(ROLE_MAP["clinical"])
            assert "clinician" in m["allowed_roles"]
            assert "admin" in m["allowed_roles"]
            assert "nurse" in m["allowed_roles"]
            assert "patient" not in m["allowed_roles"]


def test_admin_chunks_allow_only_admin():
    patch_index, patch_embed = _patch_rag()
    with patch_index as mock_idx_factory, patch_embed as mock_embed:
        index = MagicMock()
        mock_idx_factory.return_value = index
        mock_embed.return_value = [_FAKE_VECTOR]

        ingest_text("Billing policy section 1.", "admin", "policy.txt")

        for v in _upserted_vectors(index):
            assert v["metadata"]["allowed_roles"] == ["admin"]


def test_patient_chunks_allow_patient_and_admin():
    patch_index, patch_embed = _patch_rag()
    with patch_index as mock_idx_factory, patch_embed as mock_embed:
        index = MagicMock()
        mock_idx_factory.return_value = index
        mock_embed.return_value = [_FAKE_VECTOR]

        ingest_text("Your discharge summary.", "patient", "discharge.txt")

        for v in _upserted_vectors(index):
            assert "patient" in v["metadata"]["allowed_roles"]
            assert "admin" in v["metadata"]["allowed_roles"]
            assert "clinician" not in v["metadata"]["allowed_roles"]


# ── Metadata fields ───────────────────────────────────────────────────────────

def test_metadata_contains_required_fields():
    patch_index, patch_embed = _patch_rag()
    with patch_index as mock_idx_factory, patch_embed as mock_embed:
        index = MagicMock()
        mock_idx_factory.return_value = index
        mock_embed.return_value = [_FAKE_VECTOR]

        ingest_text("Some content.", "clinical", "my_doc.txt")

        for v in _upserted_vectors(index):
            m = v["metadata"]
            assert m["source"] == "my_doc.txt"
            assert m["doc_type"] == "clinical"
            assert "chunk_index" in m
            assert "text" in m   # stored so retriever can return it without a second fetch


# ── Stable IDs prevent duplicate upserts ─────────────────────────────────────

def test_same_source_produces_same_ids():
    patch_index, patch_embed = _patch_rag()
    with patch_index as mock_idx_factory, patch_embed as mock_embed:
        index = MagicMock()
        mock_idx_factory.return_value = index
        mock_embed.return_value = [_FAKE_VECTOR]

        ingest_text("Content A.", "clinical", "stable.txt")
        ids_first = [v["id"] for v in _upserted_vectors(index)]

        index.reset_mock()
        ingest_text("Content A.", "clinical", "stable.txt")
        ids_second = [v["id"] for v in _upserted_vectors(index)]

        assert ids_first == ids_second


# ── Error handling ────────────────────────────────────────────────────────────

def test_unknown_doc_type_raises():
    with pytest.raises(ValueError, match="unknown doc_type"):
        ingest_text("content", "unknown_type", "file.txt")


def test_empty_content_returns_zero():
    patch_index, patch_embed = _patch_rag()
    with patch_index as mock_idx_factory, patch_embed as mock_embed:
        index = MagicMock()
        mock_idx_factory.return_value = index

        count = ingest_text("", "clinical", "empty.txt")

        assert count == 0
        index.upsert.assert_not_called()
        mock_embed.assert_not_called()
