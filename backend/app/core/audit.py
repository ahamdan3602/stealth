import logging
from datetime import datetime, timezone

logger = logging.getLogger("stealth.audit")


def log_event(
    *,
    user_id: str | None,
    action: str,
    resource: str,
    allowed: bool,
    detail: str = "",
) -> None:
    logger.info(
        "audit user=%s action=%s resource=%s allowed=%s detail=%s ts=%s",
        user_id,
        action,
        resource,
        allowed,
        detail,
        datetime.now(timezone.utc).isoformat(),
    )
