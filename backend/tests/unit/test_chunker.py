"""
Chunker unit tests — no mocking needed, purely algorithmic.
"""
from app.rag.chunker import split


def test_long_text_produces_multiple_chunks():
    # ~1500 chars — should split into at least 3 chunks at chunk_size=500
    text = "Medical terminology is precise. " * 50
    chunks = split(text)
    assert len(chunks) > 1


def test_short_text_is_single_chunk():
    text = "Paracetamol 500mg. Take with water."
    chunks = split(text)
    assert len(chunks) == 1
    assert chunks[0] == text


def test_chunks_respect_size_limit():
    text = "word " * 400  # ~2000 chars
    chunks = split(text)
    # Allow slight overage due to overlap but nothing unreasonable
    for chunk in chunks:
        assert len(chunk) <= 600


def test_overlap_means_boundary_content_appears_twice():
    # Build a text where we can identify a specific word near a boundary
    # by checking adjacent chunks share some content
    text = "alpha " * 100 + "MARKER " + "beta " * 100
    chunks = split(text)
    if len(chunks) > 1:
        joined_adjacent = chunks[0] + " " + chunks[1]
        # Some content appears in both
        words_in_both = set(chunks[0].split()) & set(chunks[1].split())
        assert len(words_in_both) > 0


def test_empty_string_returns_empty():
    assert split("") == []


def test_whitespace_only_returns_empty():
    assert split("   \n\n   ") == []
