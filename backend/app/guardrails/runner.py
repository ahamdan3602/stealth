"""
Guardrail runner — orchestrates the full guarded pipeline.

Mirrors the NeMo Guardrails execution model (config.yml + Colang flows) in pure
Python, implementing the same input → chain → output rail sequence.

Pipeline:
  1. Input rail: prompt injection check (regex, no LLM cost)
  2. Input rail: off-topic check (regex, no LLM cost)
  3. RAG chain (retrieve + LLM answer)
  4. Output rail: groundedness score via LLM (gpt-4o-mini)
  5. Self-correction: if score < threshold, re-run with stricter grounding instruction
"""
import logging

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.guardrails.actions import check_groundedness, has_prompt_injection, is_off_topic
from app.rag.chain import run_chain
from app.rag.prompts import get_prompt

logger = logging.getLogger("stealth.guardrails")

_INJECTION_REPLY = "I'm unable to process that request."
_OFF_TOPIC_REPLY = (
    "I'm a medical information assistant. I can only help with questions about "
    "clinical care, medications, administrative policies, or patient health information."
)
_CORRECTION_INSTRUCTION = (
    "\n\nIMPORTANT: Your previous answer may have included information not fully supported "
    "by the provided context. Please revise your answer to use ONLY information explicitly "
    "stated in the context above. If the context does not contain enough information to "
    "answer fully, clearly say so rather than inferring beyond what is provided."
)


def _self_correct(question: str, role: str, prev_answer: str, context: str) -> str:
    """
    Re-run the LLM with the same retrieved context but an explicit correction
    instruction that forces it to stay within the evidence.

    This is the self-correction loop that reduces hallucination rates — the
    model is shown its prior answer and told explicitly where it overreached.
    """
    llm = ChatOpenAI(
        model=settings.chat_model,
        temperature=0,
        api_key=settings.openai_api_key,
    )
    corrected_question = (
        f"{question}"
        f"\n\n[Previous answer for review: {prev_answer[:500]}]"
        f"{_CORRECTION_INSTRUCTION}"
    )
    chain = get_prompt(role) | llm | StrOutputParser()
    return chain.invoke(
        {"context": context, "question": corrected_question},
        config={
            "run_name": "medguard-self-correct",
            "tags": [role, "self_correction"],
            "metadata": {"role": role, "guardrail": "groundedness_correction"},
        },
    )


def guarded_run(question: str, role: str) -> dict:
    """
    Run the full guarded RAG pipeline.

    Returns:
        {
          "answer":    str,
          "citations": list[str],
          "guardrail": str | None   # set when a rail triggered
        }

    guardrail values:
      "prompt_injection"       — input blocked, no chain call made
      "off_topic"              — input blocked, no chain call made
      "groundedness_corrected" — output replaced by self-corrected answer
      None                     — pipeline ran cleanly, no rails triggered
    """
    # ── Input rail 1: prompt injection ────────────────────────────────────────
    if has_prompt_injection(question):
        logger.warning("guardrail=prompt_injection role=%s", role)
        return {"answer": _INJECTION_REPLY, "citations": [], "guardrail": "prompt_injection"}

    # ── Input rail 2: off-topic ───────────────────────────────────────────────
    if is_off_topic(question):
        logger.info("guardrail=off_topic role=%s", role)
        return {"answer": _OFF_TOPIC_REPLY, "citations": [], "guardrail": "off_topic"}

    # ── RAG chain ─────────────────────────────────────────────────────────────
    result = run_chain(question, role)
    context = result.pop("_context", "")   # consume internal field before returning

    # ── Output rail: groundedness ─────────────────────────────────────────────
    if context and result["citations"]:
        score = check_groundedness(
            answer=result["answer"],
            context=context,
            question=question,
        )
        logger.info(
            "groundedness_score=%.2f threshold=%.2f role=%s",
            score,
            settings.guardrail_groundedness_threshold,
            role,
        )

        if score < settings.guardrail_groundedness_threshold:
            logger.warning(
                "guardrail=groundedness_correction score=%.2f role=%s", score, role
            )
            corrected_answer = _self_correct(question, role, result["answer"], context)
            return {
                "answer": corrected_answer,
                "citations": result["citations"],
                "guardrail": "groundedness_corrected",
            }

    return {**result, "guardrail": None}
