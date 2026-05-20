from langchain_text_splitters import RecursiveCharacterTextSplitter

# RecursiveCharacterTextSplitter tries to split on paragraph breaks first (\n\n),
# then line breaks, then sentences, then words — preserving semantic boundaries.
_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,       # target character length per chunk
    chunk_overlap=50,     # overlap keeps boundary sentences in both chunks
    separators=["\n\n", "\n", ". ", " ", ""],
)


def split(text: str) -> list[str]:
    """Split raw document text into chunks ready for embedding."""
    return _splitter.split_text(text)
