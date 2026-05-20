"""
/ingest — admin-only document upload.

POST /ingest  multipart form:
  doc_type: "clinical" | "admin" | "patient"
  file:     text file to ingest

Returns 202 immediately; chunking + embedding + Pinecone upsert runs in the background.
"""
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile

from app.db.models import User
from app.deps import require_permission
from app.rag.ingest import ROLE_MAP, ingest_text

logger = logging.getLogger("stealth.ingest")

router = APIRouter(prefix="/ingest", tags=["ingest"])


def _run_ingest(content: str, doc_type: str, filename: str, user_id: str) -> None:
    """Background task — errors are logged, not raised (nothing to return to the client)."""
    try:
        count = ingest_text(content, doc_type, source=filename)
        logger.info("ingest complete file=%s chunks=%d by=%s", filename, count, user_id)
    except Exception:
        logger.exception("ingest failed file=%s", filename)


@router.post("", status_code=202)
async def ingest(
    background_tasks: BackgroundTasks,
    doc_type: str = Form(..., description="clinical | admin | patient"),
    file: UploadFile = File(..., description="Plain-text document to ingest"),
    user: User = Depends(require_permission("ingest:write")),
) -> dict:
    """
    Upload a document for ingestion into the vector store.

    The file is read synchronously (small files only — add streaming for large docs).
    Chunking + embedding + Pinecone upsert run as a background task.
    """
    if doc_type not in ROLE_MAP:
        raise HTTPException(400, f"doc_type must be one of: {list(ROLE_MAP)}")

    content = (await file.read()).decode("utf-8")
    if not content.strip():
        raise HTTPException(400, "file is empty")

    background_tasks.add_task(_run_ingest, content, doc_type, file.filename, user.id)

    return {
        "status": "queued",
        "doc_type": doc_type,
        "file": file.filename,
        "allowed_roles": ROLE_MAP[doc_type],
    }
