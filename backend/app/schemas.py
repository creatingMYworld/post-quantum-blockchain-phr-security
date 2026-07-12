from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class FirebaseLoginRequest(BaseModel):
    id_token: str = Field(min_length=10)


class SessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    user_id: str
    firebase_uid: str
    email: str
    full_name: str
    role: str
    permissions: list[str]
    key_version: int
    key_status: str


class KeyRecord(BaseModel):
    public_key: str
    encrypted_private_key: str
    key_version: int
    key_status: str
    algorithm: str = "ML-KEM-768"
    created_at: datetime


class ConsentActionRequest(BaseModel):
    patient_id: str
    subject_user_id: str
    subject_role: str
    status: str
    scope: dict[str, Any] = Field(default_factory=dict)


class UploadRecordRequest(BaseModel):
    patient_id: str
    record_type: str
    storage_reference: str
    encrypted_key_reference: str
    key_version: int
    blockchain_tx_hash: str | None = None


class AuditLogRequest(BaseModel):
    action_key: str
    resource_type: str | None = None
    resource_id: str | None = None
    success: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)
