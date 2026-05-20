"""
Milestone 1 acceptance tests: /chat enforces role → scope mapping.
"""


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def _register_and_login(client, email: str, password: str, role: str) -> str:
    reg = client.post(
        "/auth/register",
        json={"email": email, "password": password, "role": role},
    )
    assert reg.status_code in (201, 400), reg.text  # 400 if rerun against same DB
    login = client.post(
        "/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login.status_code == 200, login.text
    return login.json()["access_token"]


def test_unauthenticated_chat_is_401(client):
    r = client.post("/chat", json={"message": "hi", "scope": "clinical"})
    assert r.status_code == 401


def test_clinician_can_access_clinical_scope(client):
    token = _register_and_login(client, "doc@example.com", "pw", "clinician")
    r = client.post(
        "/chat",
        json={"message": "hello", "scope": "clinical"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert "stub:clinical" in r.json()["answer"]


def test_clinician_cannot_access_admin_scope(client):
    token = _register_and_login(client, "doc2@example.com", "pw", "clinician")
    r = client.post(
        "/chat",
        json={"message": "hello", "scope": "admin"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


def test_admin_can_access_admin_scope(client):
    token = _register_and_login(client, "boss@example.com", "pw", "admin")
    r = client.post(
        "/chat",
        json={"message": "hello", "scope": "admin"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


def test_patient_cannot_access_clinical_scope(client):
    token = _register_and_login(client, "pt@example.com", "pw", "patient")
    r = client.post(
        "/chat",
        json={"message": "hello", "scope": "clinical"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


def test_ingest_requires_admin_role(client):
    _payload = {
        "data": {"doc_type": "clinical"},
        "files": {"file": ("test.txt", b"Sample content.", "text/plain")},
    }

    clinician_token = _register_and_login(client, "doc3@example.com", "pw", "clinician")
    r = client.post(
        "/ingest",
        data={"doc_type": "clinical"},
        files={"file": ("test.txt", b"Sample content.", "text/plain")},
        headers={"Authorization": f"Bearer {clinician_token}"},
    )
    assert r.status_code == 403

    admin_token = _register_and_login(client, "boss2@example.com", "pw", "admin")
    r = client.post(
        "/ingest",
        data={"doc_type": "clinical"},
        files={"file": ("test.txt", b"Sample content.", "text/plain")},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 202
