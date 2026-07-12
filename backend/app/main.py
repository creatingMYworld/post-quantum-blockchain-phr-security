from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.crypto_service import KeyMaterial, key_service
from app.rbac import get_permissions_for_role, normalize_role, ROLE_DEFINITIONS
from app.schemas import AuditLogRequest, ConsentActionRequest, FirebaseLoginRequest, SessionResponse, UploadRecordRequest
from app.security import AuthContext, create_backend_jwt, get_current_session, require_permission, require_role, verify_firebase_id_token

app = FastAPI(title="Enhanced PHR IAM API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


USER_DIRECTORY = {
    "patient@aegis-phr.io": {"role": "Patient", "full_name": "Patient Demo"},
    "doctor@aegis-phr.io": {"role": "Doctor", "full_name": "Doctor Demo"},
    "lab@aegis-phr.io": {"role": "Laboratory Staff", "full_name": "Laboratory Demo"},
    "admin@aegis-phr.io": {"role": "Administrator", "full_name": "Administrator Demo"},
    "security@aegis-phr.io": {"role": "AI Security Analyst", "full_name": "Security Analyst Demo"},
}

USER_KEYS: dict[str, KeyMaterial] = {}
SESSIONS: dict[str, dict[str, str]] = {}
AUDIT_LOGS: list[dict[str, object]] = []
CONSENTS: dict[tuple[str, str, str], dict[str, object]] = {}
MEDICAL_RECORDS: list[dict[str, object]] = []
USER_IDS_BY_EMAIL: dict[str, str] = {}


def _lookup_user(email: str, firebase_uid: str) -> dict[str, str]:
    profile = USER_DIRECTORY.get(email.lower())
    if profile is None:
        inferred_role = "Patient"
        profile = {"role": inferred_role, "full_name": email.split("@")[0].replace(".", " ").title()}
        USER_DIRECTORY[email.lower()] = profile
    user_id = USER_IDS_BY_EMAIL.get(email.lower())
    if user_id is None:
        user_id = str(uuid4())
        USER_IDS_BY_EMAIL[email.lower()] = user_id
    return {"firebase_uid": firebase_uid, "email": email, "user_id": user_id, **profile}


def _build_session_response(user: dict[str, str], key_material: KeyMaterial, session_jti: str) -> SessionResponse:
    permissions = sorted(get_permissions_for_role(user["role"]))
    access_token, expires_at = create_backend_jwt(
        {
            "user_id": user["user_id"],
            "firebase_uid": user["firebase_uid"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "permissions": permissions,
            "key_version": key_material.key_version,
            "key_status": key_material.key_status,
            "session_jti": session_jti,
        }
    )
    refresh_token, _ = create_backend_jwt({"session_jti": session_jti, "user_id": user["user_id"]}, minutes=60 * 24 * 14)
    return SessionResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int((expires_at - datetime.now(timezone.utc)).total_seconds()),
        user_id=user["user_id"],
        firebase_uid=user["firebase_uid"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        permissions=permissions,
        key_version=key_material.key_version,
        key_status=key_material.key_status,
    )


@app.post("/api/auth/firebase/session", response_model=SessionResponse)
async def firebase_session(request: FirebaseLoginRequest):
    firebase_claims = verify_firebase_id_token(request.id_token)
    email = (firebase_claims.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firebase token does not include an email address.")

    user_record = _lookup_user(email=email, firebase_uid=str(firebase_claims["uid"]))
    user_id = user_record["user_id"]
    existing_key = USER_KEYS.get(user_id)
    key_material = key_service.generate_or_retrieve_keypair(user_id=user_id, existing=existing_key)
    USER_KEYS[user_id] = key_material
    session_jti = str(uuid4())
    SESSIONS[session_jti] = {"user_id": user_id, "firebase_uid": user_record["firebase_uid"]}

    response = _build_session_response(user_record, key_material, session_jti)
    AUDIT_LOGS.append({"user_id": user_id, "action": "LOGIN", "role": user_record["role"], "success": True, "created_at": datetime.now(timezone.utc).isoformat()})
    http_response = Response(content=response.model_dump_json(), media_type="application/json")
    http_response.set_cookie("aegis_access_token", response.access_token, httponly=True, samesite="lax", secure=False, max_age=response.expires_in, path="/")
    http_response.set_cookie("aegis_refresh_token", response.refresh_token, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 14, path="/")
    http_response.set_cookie("aegis_role", response.role, httponly=False, samesite="lax", secure=False, max_age=response.expires_in, path="/")
    http_response.set_cookie("aegis_user_email", response.email, httponly=False, samesite="lax", secure=False, max_age=response.expires_in, path="/")
    return http_response


@app.get("/api/auth/me")
async def me(session: AuthContext = Depends(get_current_session)):
    return session.to_dict()


@app.post("/api/auth/logout")
async def logout(session: AuthContext = Depends(get_current_session)):
    SESSIONS.pop(session.session_jti, None)
    USER_KEYS.pop(session.user_id, None)
    AUDIT_LOGS.append({"user_id": session.user_id, "action": "LOGOUT", "role": session.role, "success": True, "created_at": datetime.now(timezone.utc).isoformat()})
    response = Response(content='{"status":"success"}', media_type="application/json")
    response.delete_cookie("aegis_access_token", path="/")
    response.delete_cookie("aegis_refresh_token", path="/")
    response.delete_cookie("aegis_role", path="/")
    response.delete_cookie("aegis_user_email", path="/")
    return response


@app.get("/api/dashboard/{dashboard_role}")
async def dashboard_gate(dashboard_role: str, session: AuthContext = Depends(get_current_session)):
    allowed_role = normalize_role(session.role)
    if dashboard_role.lower() not in {allowed_role.lower().replace(" ", ""), allowed_role.lower().replace(" ", "-") }:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")
    return {"status": "success", "dashboard_role": dashboard_role, "session": session.to_dict()}


@app.post("/api/records/upload")
async def upload_record(request: UploadRecordRequest, session: AuthContext = Depends(require_permission("records:upload:own"))):
    MEDICAL_RECORDS.append(request.model_dump() | {"uploaded_by": session.user_id, "created_at": datetime.now(timezone.utc).isoformat()})
    AUDIT_LOGS.append({"user_id": session.user_id, "action": "MEDICAL_RECORD_UPLOAD", "resource_id": request.storage_reference, "success": True, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"status": "success", "record": request.model_dump()}


@app.post("/api/consent/grant")
async def grant_consent(request: ConsentActionRequest, session: AuthContext = Depends(require_permission("consent:grant"))):
    CONSENTS[(request.patient_id, request.subject_user_id, request.subject_role)] = request.model_dump() | {"granted_by": session.user_id}
    AUDIT_LOGS.append({"user_id": session.user_id, "action": "CONSENT_GRANTED", "resource_id": request.subject_user_id, "success": True, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"status": "success", "consent": request.model_dump()}


@app.post("/api/consent/revoke")
async def revoke_consent(request: ConsentActionRequest, session: AuthContext = Depends(require_permission("consent:revoke"))):
    key = (request.patient_id, request.subject_user_id, request.subject_role)
    if key in CONSENTS:
        CONSENTS[key]["status"] = "Revoked"
    AUDIT_LOGS.append({"user_id": session.user_id, "action": "CONSENT_REVOKED", "resource_id": request.subject_user_id, "success": True, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"status": "success"}


@app.post("/api/audit/log")
async def audit_log(request: AuditLogRequest, session: AuthContext = Depends(get_current_session)):
    AUDIT_LOGS.append(request.model_dump() | {"user_id": session.user_id, "role": session.role, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"status": "success"}


@app.post("/api/keys/rotate")
async def rotate_keys(session: AuthContext = Depends(require_permission("keys:rotate"))):
    existing = USER_KEYS.get(session.user_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No key pair found for user.")
    rotated = key_service.rotate_keypair(existing)
    USER_KEYS[session.user_id] = rotated
    AUDIT_LOGS.append({"user_id": session.user_id, "action": "KEY_ROTATION", "role": session.role, "success": True, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"status": "success", "key_version": rotated.key_version, "key_status": rotated.key_status}


@app.get("/api/roles")
async def list_roles():
    return {"roles": list(ROLE_DEFINITIONS.keys()), "future_roles": ["Insurance Provider", "Pharmacist", "Hospital Receptionist", "Researcher"]}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)