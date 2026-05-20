from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_session
from app.deps import require_permission
from app.models.schemas import UserRead

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserRead])
def list_users(
    _: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_session),
) -> list[UserRead]:
    users = db.query(User).all()
    return [UserRead.model_validate({"id": u.id, "email": u.email, "role": u.role}) for u in users]
