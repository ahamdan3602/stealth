from fastapi import APIRouter, Depends, HTTPException

from app.core.audit import log_event
from app.core.rbac import Role, has_permission
from app.db.models import User
from app.deps import get_current_user
from app.models.schemas import ChatRequest, ChatResponse

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

    # Milestone 1: stub response. RAG chain wired in milestone 3.
    return ChatResponse(
        answer=f"[stub:{payload.scope}] received: {payload.message}",
        citations=[],
    )
