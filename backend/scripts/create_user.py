"""
Seed script — creates a user directly in the database.
Run from the backend/ directory:

    python scripts/create_user.py

Reads DATABASE_URL from .env (or environment). Defaults to the dev Postgres URL.
"""
import sys
import os

# Allow running from backend/ without installing the package
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.models import User
from app.db.session import engine, SessionLocal

# ── Users to seed ─────────────────────────────────────────────────────────────
SEED_USERS = [
    {"email": "test@example.com",  "password": "password123", "role": "clinician"},
    {"email": "admin@example.com", "password": "password123", "role": "admin"},
]


def main() -> None:
    print(f"Connecting to: {settings.database_url[:40]}…")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        created = []
        skipped = []
        for u in SEED_USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                skipped.append(u["email"])
                continue
            user = User(
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
            )
            db.add(user)
            created.append(f"{u['email']} ({u['role']})")
        db.commit()
    finally:
        db.close()

    if created:
        print("Created:", ", ".join(created))
    if skipped:
        print("– Skipped (already exist):", ", ".join(skipped))
    print("Done.")


if __name__ == "__main__":
    main()
