from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, auth, chat, ingest
from app.core.config import settings
from app.db.session import init_db
from app.observability.langsmith import setup_langsmith


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    setup_langsmith()
    yield


app = FastAPI(
    title="Stealth — Secure RAG Medical Assistant",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.env}


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(ingest.router)
app.include_router(admin.router)
