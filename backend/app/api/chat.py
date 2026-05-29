"""
/chat — role-scoped RAG endpoint.

Permission check (RBAC) happens first. If the role has the required permission
for the requested scope, the RAG chain runs and retrieves only vectors the
role is allowed to see (ACL enforced inside Pinecone).
"""
import logging

from fastapi import APIRouter, Depends, HTTPException

from app.core.audit import log_event
from app.core.rbac import Role, has_permission
from app.db.models import User
from app.deps import get_current_user
from app.guardrails.runner import guarded_run
from app.models.schemas import ChatRequest, ChatResponse

logger = logging.getLogger("stealth.chat")

router = APIRouter(prefix="/chat", tags=["chat"])

SCOPE_TO_PERMISSION = {
    "clinical": "chat:clinical",
    "admin": "chat:admin",
    "patient": "chat:patient",
}


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, user: User = Depends(get_current_user)) -> ChatResponse:
    permission = SCOPE_TO_PERMISSION.get(payload.scope)
    if permission is None:
        raise HTTPException(status_code=400, detail=f"unknown scope '{payload.scope}'")

    allowed = has_permission(Role(user.role), permission)
    log_event(
        user_id=user.id,
        action="chat",
        resource=payload.scope,
        allowed=allowed,
        detail=payload.message[:80],
    )
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail=f"role '{user.role}' cannot access scope '{payload.scope}'",
        )

    try:
        result = guarded_run(question=payload.message, role=user.role)
    except Exception:
        logger.exception("guarded chain failed user=%s scope=%s", user.id, payload.scope)
        raise HTTPException(status_code=502, detail="upstream error — RAG chain unavailable")

    return ChatResponse(
        answer=result["answer"],
        citations=result["citations"],
        guardrail=result.get("guardrail"),
    )
