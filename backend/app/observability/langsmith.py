"""
LangSmith tracing setup.

LangChain traces automatically to LangSmith when three env vars are set:
  LANGCHAIN_TRACING_V2=true
  LANGCHAIN_API_KEY=<your key>
  LANGCHAIN_PROJECT=<project name>

We set these at startup from our own config so the app controls tracing
centrally rather than requiring the user to export env vars manually.

Tracing is silently skipped if LANGSMITH_API_KEY is not configured —
safe for local dev and CI where the key isn't set.
"""
import logging
import os

from app.core.config import settings

logger = logging.getLogger("stealth.langsmith")

_PLACEHOLDER = "ls-placeholder"


def setup_langsmith() -> None:
    """
    Enable LangSmith tracing by setting LangChain env vars.
    Call once from the FastAPI lifespan before the first request.
    """
    if not settings.langsmith_api_key or settings.langsmith_api_key == _PLACEHOLDER:
        logger.info("LangSmith tracing disabled — LANGSMITH_API_KEY not configured")
        return

    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
    os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project

    logger.info(
        "LangSmith tracing enabled project=%s model=%s",
        settings.langsmith_project,
        settings.chat_model,
    )
