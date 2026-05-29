from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: str = "dev"
    database_url: str = "postgresql+psycopg://stealth:stealth@localhost:5432/stealth"
    jwt_secret: str = "change-me-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # OpenAI — used for embeddings (text-embedding-3-small)
    openai_api_key: str = "sk-placeholder"

    # Pinecone — serverless index for vector storage
    pinecone_api_key: str = "pc-placeholder"
    pinecone_index: str = "stealth-medical"

    # LLM — model used by the RAG chain
    chat_model: str = "gpt-4o"

    # LangSmith — tracing and observability (optional; skipped if placeholder)
    langsmith_api_key: str = "ls-placeholder"
    langsmith_project: str = "medguard-ai"

    # Guardrails (milestone 4)
    guardrail_groundedness_threshold: float = 0.7   # below this → self-correct
    guardrail_model: str = "gpt-4o-mini"            # cheap model for groundedness scoring


settings = Settings()
