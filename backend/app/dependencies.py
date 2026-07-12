from __future__ import annotations

from fastapi import Depends, HTTPException, Request, status

from app.security import AuthContext, get_current_session


def require_authentication(session: AuthContext = Depends(get_current_session)) -> AuthContext:
    return session


def require_permissions(*permissions: str):
    required = set(permissions)

    def _dependency(session: AuthContext = Depends(get_current_session)) -> AuthContext:
        if not required.issubset(set(session.permissions)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: missing permission.")
        return session

    return _dependency


def owner_or_self(owner_field: str):
    def _extractor(request: Request) -> str | None:
        value = request.path_params.get(owner_field)
        return str(value) if value is not None else None

    return _extractor
