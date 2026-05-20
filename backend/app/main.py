from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import admin, auth, chat, ingest
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Stealth — Secure RAG Medical Assistant",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.env}


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(ingest.router)
app.include_router(admin.router)
