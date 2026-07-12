from fastapi.testclient import TestClient

from app import main as app_main
from app.security import create_backend_jwt


client = TestClient(app_main.app)


def make_token(role: str = "Patient", permissions: list[str] | None = None, email: str = "patient@aegis-phr.io") -> str:
    token, _ = create_backend_jwt(
        {
            "user_id": "user-1",
            "firebase_uid": "firebase-1",
            "email": email,
            "full_name": "Patient Demo",
            "role": role,
            "permissions": permissions or [],
            "key_version": 1,
            "key_status": "Active",
            "session_jti": "session-1",
        }
    )
    return token


def test_me_requires_authentication():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_patient_cannot_rotate_keys():
    token = make_token(role="Patient", permissions=["records:upload:own"])
    response = client.post("/api/keys/rotate", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_admin_can_rotate_keys_when_session_exists():
    app_main.USER_KEYS["user-1"] = app_main.key_service.generate_or_retrieve_keypair("user-1")
    token = make_token(role="Administrator", permissions=["keys:rotate"])
    response = client.post("/api/keys/rotate", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_doctor_dashboard_forbidden_for_patient():
    token = make_token(role="Patient")
    response = client.get("/api/dashboard/doctor", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
