from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field

class RegistrationRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str
    role: str
    gender: str
    date_of_birth: str # Format: YYYY-MM-DD
    blood_group: Optional[str] = None
    specialization: Optional[str] = None

class LoginRequest(BaseModel):
    user_id: str
    password: str

class RegistrationResponse(BaseModel):
    message: str

class LoginResponse(BaseModel):
    access_token: str
    user_id: str
    public_user_id: str
    email: str
    full_name: str
    role: str
    permissions: list[str]

class PendingRegistration(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    gender: str
    date_of_birth: str # Needs to be decrypted for admin to view
    blood_group: Optional[str] = None
    specialization: Optional[str] = None
    created_at: datetime
    status: str

class AdminActionRequest(BaseModel):
    action: str # "approve" or "reject"

class AdminActionResponse(BaseModel):
    message: str
    user_id: Optional[str] = None
    email_sent: Optional[bool] = None

# Kept from previous schema for existing integrations
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

class RejectRequest(BaseModel):
    reason: Optional[str] = None

class DashboardStats(BaseModel):
    total_users: int
    total_patients: int
    total_doctors: int
    total_nurses: int
    total_lab_technicians: int
    pending_requests: int
    approved_users: int
    rejected_users: int
    disabled_users: int
    active_sessions: int
    pqc_keys_generated: int

class UserDetail(BaseModel):
    id: str
    user_id: Optional[str] = None
    full_name: str
    email: str
    role: str
    gender: str
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    specialization: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    has_mlkem_keys: bool = False
    has_mldsa_keys: bool = False
    created_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

class AuditLogEntry(BaseModel):
    id: str
    admin_user_id: Optional[str] = None
    action: str
    target_public_user_id: Optional[str] = None
    details: Optional[dict] = None
    created_at: Optional[datetime] = None

class SecurityStats(BaseModel):
    failed_login_attempts_24h: int
    disabled_accounts: int
    active_sessions: int
    total_pqc_keypairs: int
    active_crypto_identities: int
