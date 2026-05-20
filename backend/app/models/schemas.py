from pydantic import BaseModel, EmailStr

from app.core.rbac import Role


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Role


class UserRead(BaseModel):
    id: str
    email: EmailStr
    role: Role


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChatRequest(BaseModel):
    message: str
    scope: str  # "clinical" | "admin" | "patient"


class ChatResponse(BaseModel):
    answer: str
    citations: list[str] = []
