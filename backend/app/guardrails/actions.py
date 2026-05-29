"""
Guardrail action implementations — pure functions, no side effects.

These mirror NeMo Guardrails' custom action pattern:
  - Input actions: fast regex checks (no LLM cost) run before the RAG chain.
  - Output action: LLM-based groundedness scoring run after the chain answers.

All three are called from runner.py, which orchestrates the full guarded pipeline.
"""
import re

from openai import OpenAI

from app.core.config import settings

# ── Input rail: prompt injection ──────────────────────────────────────────────

_INJECTION_RE = re.compile(
    r"(ignore\s+(previous|all|above|prior)\s+instructions?"
    r"|forget\s+(everything|all(\s+your)?\s+rules?|your\s+instructions?)"
    r"|you\s+are\s+now\s+"
    r"|pretend\s+(you\s+are|to\s+be)\s+"
    r"|act\s+as\s+(if\s+you\s+are\s+|a\s+)?(?!a\s+(?:medical|clinical|health))"
    r"|jailbreak"
    r"|DAN\s+mode"
    r"|reveal\s+(your\s+)?(system\s+)?prompt"
    r"|override\s+(your\s+)?rules?)",
    re.IGNORECASE,
)


def has_prompt_injection(text: str) -> bool:
    """Return True if the input contains a prompt injection attempt."""
    return bool(_INJECTION_RE.search(text))


# ── Input rail: off-topic ─────────────────────────────────────────────────────

# Topics clearly outside the medical domain
_OFF_TOPIC_RE = re.compile(
    r"\b(weather|forecast|temperature|sports|score|recipe|cook|movie|film|"
    r"music|song|joke|meme|crypto|bitcoin|stocks?|stock\s+market|invest|politics|"
    r"election|celebrity|dating|travel|vacation|restaurant|"
    r"won\s+the\s+(game|match)|who\s+won)\b",
    re.IGNORECASE,
)

# Medical anchors — if present, likely a medical question even if off-topic words appear
_MEDICAL_RE = re.compile(
    r"\b(medication|drug|dose|dosage|diagnosis|symptom|treatment|patient|"
    r"clinical|prescription|allerg|infect|disease|condition|therapy|surgery|"
    r"hospital|billing|insurance|claim|appointment|referral|health|medical|"
    r"nurse|doctor|physician|clinic|pharmacy|side.?effect|contraindic)\b",
    re.IGNORECASE,
)


def is_off_topic(text: str) -> bool:
    """Return True if the question is clearly outside the medical/admin domain."""
    has_off_topic_signal = bool(_OFF_TOPIC_RE.search(text))
    has_medical_anchor = bool(_MEDICAL_RE.search(text))
    # Off-topic only if it has off-topic signals AND no medical anchors
    return has_off_topic_signal and not has_medical_anchor


# ── Output rail: groundedness scoring ────────────────────────────────────────

_GROUNDEDNESS_PROMPT = """\
You are evaluating whether an AI-generated answer is grounded in the provided context.

Context (retrieved documents):
{context}

Question: {question}

Answer to evaluate: {answer}

Score how well the answer is supported by the context on a scale from 0.0 to 1.0:
- 1.0 = every claim in the answer is directly supported by the context
- 0.7 = most claims are supported; minor inferences are reasonable
- 0.5 = roughly half the claims are supported; some appear fabricated
- 0.0 = the answer contradicts or ignores the context entirely

Respond with ONLY a single decimal number between 0.0 and 1.0. No explanation."""


def check_groundedness(answer: str, context: str, question: str = "") -> float:
    """
    Score how well `answer` is grounded in `context` using a fast LLM call.

    Returns 0.0–1.0. Values below settings.guardrail_groundedness_threshold
    trigger the self-correction loop in runner.py.

    Falls back to 1.0 (assume grounded) if the LLM response can't be parsed,
    so a transient API error doesn't block every response.
    """
    if not context or not answer:
        return 1.0

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.guardrail_model,
        messages=[
            {
                "role": "user",
                "content": _GROUNDEDNESS_PROMPT.format(
                    context=context[:3000],  # cap to keep tokens low
                    question=question,
                    answer=answer,
                ),
            }
        ],
        temperature=0,
        max_tokens=10,
    )

    raw = response.choices[0].message.content.strip()
    try:
        score = float(raw)
        return max(0.0, min(1.0, score))
    except ValueError:
        return 1.0  # parse failure → assume grounded, don't block
