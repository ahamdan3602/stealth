"""
Pytest fixtures. Swaps Postgres for an isolated SQLite file per test session
so the suite runs without external services.
"""
import os
import tempfile

import pytest

# Set env BEFORE importing app — Settings() reads env at import time.
_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_db_file.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_db_file.name}"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["ENV"] = "test"


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c
