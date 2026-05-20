from fastapi import APIRouter, Depends

from app.db.models import User
from app.deps import require_permission

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("", status_code=202)
def ingest(user: User = Depends(require_permission("ingest:write"))) -> dict[str, str]:
    # next milestone/step: chunk → embed → Pinecone upsert with ACL metadata.
    return {"status": "accepted", "by": user.email}
