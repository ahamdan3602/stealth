# MedGuard AI

A secure, role-based RAG medical assistant for clinical and administrative teams. Clinicians see clinical data. Admins see admin data. Patients see only their own. Access is enforced at the vector database level — not post-retrieval, not just at the API.

---

## Table of Contents

- [Solution Architecture](#solution-architecture)
- [RBAC Design](#rbac-design)
- [Pinecone ACL Design](#pinecone-acl-design)
- [Guardrails Pipeline](#guardrails-pipeline)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Seeding Test Data](#seeding-test-data)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Milestone Status](#milestone-status)

---

## Solution Architecture

MedGuard AI is a full-stack application. Every layer has exactly one job, and security is enforced at each boundary.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│         TypeScript · React 19 · Tailwind CSS v4         │
│     /  (landing)  /login  /signup  /chat  /admin        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS + JWT Bearer token
┌────────────────────────▼────────────────────────────────┐
│                 FastAPI Backend                         │
│              Python 3.14 · SQLAlchemy                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │  JWT Auth   │  │  RBAC Layer  │  │  Audit Logger │   │
│  │  bcrypt pw  │  │ 4-role matrix│  │ every request │   │
│  └─────────────┘  └──────────────┘  └───────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ Role verified, request proceeds
┌────────────────────────▼────────────────────────────────┐
│              NeMo Guardrails (Input Rails)              │
│                                                         │
│   Prompt injection check → Off-topic check              │
│         (regex-based, zero LLM cost)                    │
└────────────────────────┬────────────────────────────────┘
                         │ Input clean, chain runs
┌────────────────────────▼────────────────────────────────┐
│            LangChain RAG Chain (LCEL)                   │
│                                                         │
│  retrieve(query, role)  →  format_context               │
│    →  role-specific prompt  →  ChatOpenAI (GPT-4o)      │
│    →  LangSmith trace tagged by role                    │
└──────────┬───────────────────────┬──────────────────────┘
           │                       │
┌──────────▼──────────┐  ┌────────▼──────────────────────┐
│      Pinecone       │  │         OpenAI                │
│  Serverless index   │  │  text-embedding-3-small       │
│  1536-dim cosine    │  │  GPT-4o (chat)                │
│  ACL metadata filter│  │  GPT-4o-mini (groundedness )  │
└─────────────────────┘  └───────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│         NeMo Guardrails (Output Rail)                   │
│                                                         │
│  check_groundedness(answer, context) → score 0–1        │
│  score < 0.7  →  self_correct()  →  re-run LLM          │
│  score ≥ 0.7  →  return answer + citations              │
└─────────────────────────────────────────────────────────┘
```

### Data flow summary

1. User authenticates → receives a JWT containing their role.
2. Every request to `/chat` passes through RBAC middleware — wrong role gets `403` immediately.
3. The input is checked for prompt injection and off-topic content (no LLM needed).
4. The RAG chain retrieves vectors from Pinecone using a **role-aware metadata filter** — the wrong role returns zero vectors, not hidden vectors.
5. The LLM generates an answer grounded in the retrieved context.
6. A groundedness score (0–1) is computed. If below the threshold, a self-correction loop re-runs the LLM with an explicit grounding instruction.
7. The final answer, citations, and guardrail status are returned to the frontend.

---

## RBAC Design

Four roles with a strict permission matrix. The matrix lives in `backend/app/core/rbac.py`.

| Role | `chat:clinical` | `chat:admin` | `chat:patient` | `ingest:write` | `users:manage` |
|------|:-:|:-:|:-:|:-:|:-:|
| `admin` | ✓ | ✓ | — | ✓ | ✓ |
| `clinician` | ✓ | — | — | — | — |
| `nurse` | ✓ | — | — | — | — |
| `patient` | — | — | ✓ | — | — |

Role is embedded in the JWT at login and validated on every request via the `require_permission()` FastAPI dependency.

---

## Pinecone ACL Design

When a document is ingested, every chunk is upserted to Pinecone with an `allowed_roles` list in its metadata:

```python
ROLE_MAP = {
    "clinical": ["clinician", "admin", "nurse"],
    "admin":    ["admin"],
    "patient":  ["patient", "admin"],
}
```

At retrieval time, a metadata filter is applied **inside Pinecone** before any ranking occurs:

```python
filter = {"allowed_roles": {"$in": [user_role]}}
```

A patient querying the system cannot retrieve clinical vectors — they do not appear in the result set at all. This is enforced at the database level, not post-retrieval.

---

## Guardrails Pipeline

```
User query
    │
    ├── has_prompt_injection()  →  blocked: "I'm unable to process that request."
    │
    ├── is_off_topic()          →  blocked: "I'm a medical information assistant…"
    │
    └── run_chain(query, role)
            │
            └── check_groundedness(answer, context)
                    │
                    ├── score ≥ 0.7  →  return answer
                    │
                    └── score < 0.7  →  self_correct()  →  return corrected answer
                                            (guardrail: "groundedness_corrected")
```

Every `ChatResponse` includes a `guardrail` field:

| Value | Meaning |
|-------|---------|
| `null` | Clean pass — no rails triggered |
| `"prompt_injection"` | Input blocked before chain ran |
| `"off_topic"` | Input blocked before chain ran |
| `"groundedness_corrected"` | Output replaced by self-corrected answer |

---

## Project Structure

```
medguard-ai/
├── backend/
│   ├── app/
│   │   ├── api/              # Route handlers: auth, chat, ingest, admin
│   │   ├── core/             # Config, security (JWT+bcrypt), RBAC, audit
│   │   ├── db/               # SQLAlchemy models and session
│   │   ├── guardrails/       # NeMo config, Colang flows, actions, runner
│   │   ├── models/           # Pydantic request/response schemas
│   │   ├── observability/    # LangSmith tracer setup
│   │   └── rag/              # Chunker, embedder, retriever, chain, prompts
│   ├── scripts/
│   │   └── create_user.py    # Seed users directly into the database
│   ├── tests/
│   │   ├── test_rbac.py      # RBAC + endpoint integration tests
│   │   └── unit/             # Chunker, ACL metadata, chain, guardrail tests
│   ├── pyproject.toml
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router: /, /login, /signup, /chat, /admin
│   │   ├── components/
│   │   │   ├── landing/      # Navbar, HeroSection, FeatureGrid, ArchSection, CTA, Footer
│   │   │   ├── layout/       # AppLayout, Sidebar, Topbar
│   │   │   ├── chat/         # ChatWindow, MessageBubble, CitationList, GuardrailBadge
│   │   │   ├── auth/         # LoginForm, SignUpForm
│   │   │   ├── admin/        # UserTable, IngestForm
│   │   │   └── ui/           # Button, Input, Card, Badge, Textarea
│   │   ├── lib/              # api.ts, auth.ts, utils.ts
│   │   └── types/            # TypeScript types mirroring backend schemas
│   └── package.json
├── data/
│   ├── clinical/             # Seed clinical docs (drug references)
│   └── admin/                # Seed admin docs (billing policies)
├── infra/
│   └── docker-compose.yml    # Postgres + backend services
└── README.md
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | 3.14 used in development |
| Node.js | 18+ | 22 used in development |
| Docker | Any | Only needed for Postgres option |
| OpenAI API key | — | For embeddings + chat |
| Pinecone API key | — | Serverless index, 1536 dims, cosine |
| LangSmith API key | — | Optional — tracing only |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/ahamdan3602/stealth.git
cd stealth
```

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -e ".[dev]"
cp .env.example .env   # then fill in your API keys
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

### 4. Database — choose one option

**Option A — SQLite (no Docker, fastest for local dev)**

```powershell
# Windows PowerShell
$env:DATABASE_URL = "sqlite:///./dev.db"
python scripts/create_user.py   # seeds test@example.com + admin@example.com
uvicorn app.main:app --reload
```

**Option B — Postgres via Docker**

```bash
cd infra
docker compose up -d postgres

cd ../backend
python scripts/create_user.py   # reads DATABASE_URL from .env
uvicorn app.main:app --reload
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | Postgres URL | SQLAlchemy connection string |
| `JWT_SECRET` | Yes | `change-me-in-prod` | Secret for signing JWTs |
| `OPENAI_API_KEY` | Yes | — | Used for embeddings and chat |
| `PINECONE_API_KEY` | Yes | — | Pinecone serverless index |
| `PINECONE_INDEX` | Yes | `stealth-medical` | Index name (1536 dims, cosine) |
| `CHAT_MODEL` | No | `gpt-4o` | LLM used by the RAG chain |
| `GUARDRAIL_MODEL` | No | `gpt-4o-mini` | LLM used for groundedness scoring |
| `GUARDRAIL_GROUNDEDNESS_THRESHOLD` | No | `0.7` | Self-correction trigger threshold |
| `LANGSMITH_API_KEY` | No | — | Enables LangSmith tracing if set |
| `LANGSMITH_PROJECT` | No | `medguard-ai` | LangSmith project name |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Running the Project

### Backend

```powershell
# Windows — SQLite (quickest start)
cd backend
$env:DATABASE_URL = "sqlite:///./dev.db"
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`
Swagger UI at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm run dev
```

App available at `http://localhost:3000`

---

## Seeding Test Data

### Seed users

```bash
cd backend
python scripts/create_user.py
```

Default seed users:

| Email | Password | Role |
|-------|----------|------|
| `test@example.com` | `password123` | clinician |
| `admin@example.com` | `password123` | admin |

### Seed Pinecone (requires API keys)

```bash
# Get an admin JWT first
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -d "username=admin@example.com&password=password123" \
  -H "Content-Type: application/x-www-form-urlencoded" | jq -r .access_token)

# Ingest clinical reference
curl -X POST http://localhost:8000/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -F "doc_type=clinical" \
  -F "file=@data/clinical/drug_reference.txt"

# Ingest admin policy
curl -X POST http://localhost:8000/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -F "doc_type=admin" \
  -F "file=@data/admin/billing_policy.txt"
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | None | Create a new user account |
| `POST` | `/auth/login` | None | Login, returns JWT |
| `POST` | `/chat` | JWT | Send a message, get a RAG answer |
| `POST` | `/ingest` | Admin JWT | Upload a document for ingestion |
| `GET` | `/admin/users` | Admin JWT | List all users |
| `GET` | `/health` | None | Health check |

### Chat request/response

```json
// POST /chat
{
  "message": "What is the max daily dose of paracetamol?",
  "scope": "clinical"
}

// Response
{
  "answer": "The maximum adult dose of paracetamol is 4g/day [1].",
  "citations": ["drug_reference.txt"],
  "guardrail": null
}
```

---

## Running Tests

```bash
cd backend
pytest -v
```

The test suite (53 tests) runs fully offline — Pinecone and OpenAI calls are mocked.

| Test file | What it covers |
|-----------|----------------|
| `tests/test_rbac.py` | RBAC enforcement on `/chat` and `/ingest` |
| `tests/unit/test_chunker.py` | Text splitting logic |
| `tests/unit/test_ingest_acl.py` | ACL metadata construction per doc type |
| `tests/unit/test_chain.py` | RAG chain: citations, dedup, empty retrieval |
| `tests/unit/test_guardrails.py` | Injection/off-topic blocking, groundedness, self-correction |

---

## Milestone Status

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Auth + RBAC + Postgres | Done |
| 2 | Ingestion + Pinecone ACL | Done |
| 3 | LangChain RAG chain + LangSmith | Done |
| 4 | NeMo Guardrails (input/output rails, self-correction) | Done |
| 5 | Next.js frontend (landing, login, signup, chat, admin) | Done |
| 6 | Ragas eval harness + CI gate | Planned |
| 7 | Hardening (rate limits, threat model) | Planned |
