# Stealth — Secure RAG Medical Assistant

A secure, RBAC-enforced RAG assistant for clinical and administrative support.

## Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Postgres
- **RAG:** LangChain, Pinecone (planned: milestone 2–3)
- **Safety:** NVIDIA NeMo Guardrails (planned: milestone 4)
- **Eval:** Ragas, LangSmith tracing (planned: milestone 5)
- **Frontend:** TypeScript / Next.js (planned: milestone 6)


JWT auth, RBAC dependency, role-scoped `/chat` stub, Postgres via docker-compose.

### Run locally

```bash
# 1. Start Postgres
cd infra
docker compose up -d postgres

# 2. Install backend deps
cd ../backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -e ".[dev]"
copy .env.example .env

# 3. Run API
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs.

### Smoke test the RBAC path

```bash
# Register a clinician
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@stealth.test","password":"pw","role":"clinician"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -d "username=doc@stealth.test&password=pw" | jq -r .access_token)

# 200 — clinical scope allowed
curl -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"message":"hello","scope":"clinical"}'

# 403 — admin scope forbidden for clinician role
curl -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"message":"hello","scope":"admin"}'
```

### Tests

```bash
cd backend
pytest
```

## Roadmap

1. Auth + RBAC + Postgres (completed)
2. Ingestion + Pinecone with ACL metadata (completed)
4. LangChain RAG chain + LangSmith tracing (in progress)
5. NeMo Guardrails (input/output rails, self-correction loop)
6. Ragas eval harness in CI
7. Next.js frontend
8. Hardening (audit log, rate limits, threat model)
