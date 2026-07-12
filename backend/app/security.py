from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings
from app.rbac import get_permissions_for_role

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    from firebase_admin import credentials
except Exception:  # pragma: no cover - optional during local setup
    firebase_admin = None
    firebase_auth = None
    credentials = None


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(slots=True)
class AuthContext:
    user_id: str
    firebase_uid: str
    email: str
    full_name: str
    role: str
    permissions: list[str]
    key_version: int
    key_status: str
    session_jti: str
    risk_score: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "user_id": self.user_id,
            "firebase_uid": self.firebase_uid,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "permissions": self.permissions,
            "key_version": self.key_version,
            "key_status": self.key_status,
            "session_jti": self.session_jti,
            "risk_score": self.risk_score,
        }


def _initialize_firebase_admin() -> None:
    if firebase_admin is None or firebase_auth is None:
        return
    if firebase_admin._apps:
        return
    service_account_path = None
    if service_account_path:
        firebase_admin.initialize_app(credentials.Certificate(service_account_path))
    else:
        firebase_admin.initialize_app()


def verify_firebase_id_token(id_token: str) -> dict[str, Any]:
    _initialize_firebase_admin()
    if firebase_auth is None:
        return {
            "uid": "mock-firebase-uid",
            "email": "patient@aegis-phr.io",
            "name": "Patient Demo",
            "email_verified": True,
        }
    try:
        return firebase_auth.verify_id_token(id_token, check_revoked=True)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or revoked Firebase token.") from exc


def create_backend_jwt(payload: dict[str, Any], minutes: int | None = None) -> tuple[str, datetime]:
    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=minutes or settings.access_token_minutes)
    token_payload = {
        **payload,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
        "iss": "enhanced-phr-backend",
    }
    return jwt.encode(token_payload, settings.jwt_secret, algorithm=settings.jwt_algorithm), expires_at


def decode_backend_jwt(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token.") from exc


def _extract_token(request: Request, credentials: HTTPAuthorizationCredentials | None) -> str | None:
    if credentials is not None:
        return credentials.credentials
    cookie_token = request.cookies.get("aegis_access_token")
    return cookie_token


def get_current_session(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthContext:
    token = _extract_token(request, credentials)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    payload = decode_backend_jwt(token)
    permissions = payload.get("permissions") or []
    if not permissions:
        permissions = list(get_permissions_for_role(payload["role"]))
    return AuthContext(
        user_id=payload["user_id"],
        firebase_uid=payload["firebase_uid"],
        email=payload["email"],
        full_name=payload["full_name"],
        role=payload["role"],
        permissions=permissions,
        key_version=int(payload.get("key_version", 1)),
        key_status=payload.get("key_status", "Active"),
        session_jti=payload["session_jti"],
        risk_score=float(payload.get("risk_score", 0.0)),
    )


def require_permission(permission: str):
    def _dependency(session: AuthContext = Depends(get_current_session)) -> AuthContext:
        if permission not in session.permissions:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: insufficient permission.")
        return session

    return _dependency


def require_role(*allowed_roles: str):
    normalized_roles = {role.strip().title() for role in allowed_roles}

    def _dependency(session: AuthContext = Depends(get_current_session)) -> AuthContext:
        if session.role.strip().title() not in normalized_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: role not allowed.")
        return session

    return _dependency


def require_owner_or_permission(permission: str, owner_id_getter):
    def _dependency(session: AuthContext = Depends(get_current_session), request: Request | None = None) -> AuthContext:
        if permission in session.permissions:
            return session
        if request is not None:
            owner_id = owner_id_getter(request)
            if owner_id and owner_id == session.user_id:
                return session
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: ownership or permission required.")

    return _dependency
