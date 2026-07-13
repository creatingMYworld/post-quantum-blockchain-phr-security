import math
from fastapi import FastAPI, Depends, HTTPException, Request, Response, status, Body
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from typing import Optional
import psycopg
from psycopg.rows import dict_row

from app.schemas import (
    RegistrationRequest, LoginRequest, RegistrationResponse, LoginResponse, 
    PendingRegistration, AdminActionRequest, AdminActionResponse,
    RejectRequest, DashboardStats, UserDetail, AuditLogEntry, SecurityStats
)
from app.database import get_db, init_db
from app.security import (
    hash_password, verify_password, encrypt_data, decrypt_data,
    create_session_token, get_current_session, require_role, require_permission
)
from app.crypto_service import generate_mlkem_keypair, generate_mldsa_keypair
from app.email_service import send_and_log_email, retry_failed_email, send_admin_notification
from app.user_id_service import generate_user_id
from app.rbac import get_permissions_for_role, normalize_role
from app.audit_service import log_admin_action

app = FastAPI(title="PQC Hospital IAM API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/register", response_model=RegistrationResponse)
def register(request: RegistrationRequest):
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    with get_db() as conn:
        with conn.cursor() as cur:
            # Check if email exists
            cur.execute("SELECT id FROM Users WHERE email = %s", (request.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Hash password and encrypt sensitive fields
            pwd_hash = hash_password(request.password)
            dob_enc = encrypt_data(request.date_of_birth)
            blood_group_enc = encrypt_data(request.blood_group) if request.blood_group else None
            
            # Insert into Users
            cur.execute("""
                INSERT INTO Users (full_name, email, password_hash, role, gender, date_of_birth_encrypted, blood_group_encrypted, specialization, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Pending')
                RETURNING id
            """, (
                request.full_name, request.email, pwd_hash, request.role, request.gender,
                dob_enc, blood_group_enc, request.specialization
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
            
    # Notify admin
    send_admin_notification({
        "full_name": request.full_name,
        "email": request.email,
        "role": request.role
    })
            
    return {"message": "Registration submitted successfully. Pending admin approval."}

@app.post("/api/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM Users WHERE user_id = %s", (request.user_id,))
            user = cur.fetchone()
            
            if not user:
                raise HTTPException(status_code=401, detail="Invalid User ID or Password.")
            
            if user["status"] == "Pending":
                raise HTTPException(status_code=403, detail="Your registration is currently under administrator verification.")
            if user["status"] == "Rejected":
                raise HTTPException(status_code=403, detail="Your registration request was not approved.")
            if user["status"] == "Disabled":
                raise HTTPException(status_code=403, detail="Your account has been disabled. Contact administrator.")
                
            if not verify_password(request.password, user["password_hash"]):
                # Log failed attempt
                cur.execute("INSERT INTO AuthLogs (user_id, public_user_id, action) VALUES (%s, %s, %s)", 
                            (user["id"], user["user_id"], "LOGIN_FAILED"))
                conn.commit()
                raise HTTPException(status_code=401, detail="Invalid User ID or Password.")
            
            # Create session token
            token_payload = {
                "user_id": str(user["id"]),
                "public_user_id": user["user_id"],
                "role": user["role"],
                "email": user["email"],
                "full_name": user["full_name"]
            }
            token, expires_at = create_session_token(token_payload)
            
            # Store session
            cur.execute("""
                INSERT INTO Sessions (user_id, token_hash, role, expires_at)
                VALUES (%s, %s, %s, %s)
            """, (user["id"], hash_password(token), user["role"], expires_at))
            
            # Log successful login
            cur.execute("INSERT INTO AuthLogs (user_id, public_user_id, action) VALUES (%s, %s, %s)", 
                        (user["id"], user["user_id"], "LOGIN_SUCCESS"))
            conn.commit()
            
    response.set_cookie("aegis_access_token", token, httponly=True, secure=False, samesite="lax", path="/")
    
    permissions = list(get_permissions_for_role(user["role"]))
    
    return {
        "access_token": token,
        "user_id": str(user["id"]),
        "public_user_id": user["user_id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "permissions": permissions
    }

@app.post("/api/logout")
def logout(response: Response, session: dict = Depends(get_current_session)):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO AuthLogs (user_id, action) VALUES (%s, %s)", (session["user_id"], "LOGOUT"))
            conn.commit()
            
    response.delete_cookie("aegis_access_token", path="/")
    return {"status": "success"}

@app.get("/api/auth/me")
def get_me(session: dict = Depends(get_current_session)):
    return session

@app.get("/api/admin/registrations/pending")
def get_pending_registrations(session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM Users WHERE status = 'Pending' ORDER BY created_at DESC")
            rows = cur.fetchall()
            
    results = []
    for row in rows:
        results.append({
            "id": str(row["id"]),
            "full_name": row["full_name"],
            "email": row["email"],
            "role": row["role"],
            "gender": row["gender"],
            "date_of_birth": decrypt_data(row["date_of_birth_encrypted"]),
            "blood_group": decrypt_data(row["blood_group_encrypted"]) if row["blood_group_encrypted"] else None,
            "specialization": row["specialization"],
            "created_at": row["created_at"],
            "status": row["status"]
        })
    return results

@app.get("/api/admin/registrations")
def get_all_registrations(session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM Users ORDER BY created_at DESC")
            rows = cur.fetchall()
            
    results = []
    for row in rows:
        results.append({
            "id": str(row["id"]),
            "full_name": row["full_name"],
            "email": row["email"],
            "role": row["role"],
            "gender": row["gender"],
            "date_of_birth": decrypt_data(row["date_of_birth_encrypted"]),
            "blood_group": decrypt_data(row["blood_group_encrypted"]) if row["blood_group_encrypted"] else None,
            "specialization": row["specialization"],
            "created_at": row["created_at"],
            "status": row["status"]
        })
    return results

@app.post("/api/admin/registrations/{user_uuid}/approve", response_model=AdminActionResponse)
def approve_registration(user_uuid: str, request: Request, session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM Users WHERE id = %s", (user_uuid,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Registration not found")
            
            if user["status"] != "Pending":
                raise HTTPException(status_code=400, detail="Registration is not pending")
                
            new_user_id = generate_user_id(user["role"])
            
            kem_pub, kem_priv = generate_mlkem_keypair()
            dsa_pub, dsa_priv = generate_mldsa_keypair()
            
            cur.execute("""
                UPDATE Users 
                SET status = 'Approved', user_id = %s, approved_at = CURRENT_TIMESTAMP, approved_by = %s,
                    mlkem_public_key = %s, mlkem_private_key_encrypted = %s,
                    mldsa_public_key = %s, mldsa_private_key_encrypted = %s
                WHERE id = %s
            """, (
                new_user_id, session["user_id"],
                kem_pub, kem_priv, dsa_pub, dsa_priv,
                user_uuid
            ))
            conn.commit()
            
        # Log admin action
        log_admin_action(
            conn, session["user_id"], session.get("public_user_id"),
            "REGISTRATION_APPROVED", user_uuid, new_user_id,
            request.client.host if request else None,
            {"role": user["role"]}
        )

        # Send and log approval email
        email_res = send_and_log_email(
            conn,
            user_uuid,
            user["email"],
            user["full_name"],
            "APPROVAL",
            user_id_gen=new_user_id
        )
            
    if email_res["sent_status"] == "FAILED":
        return {
            "message": "Account approved successfully, but email delivery failed. Please retry sending the notification.",
            "user_id": new_user_id,
            "email_sent": False
        }
    
    return {
        "message": f"Registration Approved Successfully\nUser ID Generated: {new_user_id}\nApproval email sent successfully.",
        "user_id": new_user_id,
        "email_sent": True
    }

@app.post("/api/admin/registrations/{user_uuid}/reject", response_model=AdminActionResponse)
def reject_registration(
    user_uuid: str,
    request: Request,
    body: RejectRequest = Body(default=RejectRequest()),
    session: dict = Depends(require_role("Administrator"))
):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM Users WHERE id = %s", (user_uuid,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Registration not found")
            
            if user["status"] != "Pending":
                raise HTTPException(status_code=400, detail="Registration is not pending")
                
            cur.execute(
                "UPDATE Users SET status = 'Rejected', rejection_reason = %s WHERE id = %s",
                (body.reason, user_uuid)
            )
            conn.commit()

        # Log admin action
        details = {"role": user["role"]}
        if body.reason:
            details["reason"] = body.reason
        log_admin_action(
            conn, session["user_id"], session.get("public_user_id"),
            "REGISTRATION_REJECTED", user_uuid, user.get("user_id"),
            request.client.host if request else None,
            details
        )

        # Send and log rejection email
        email_res = send_and_log_email(
            conn,
            user_uuid,
            user["email"],
            user["full_name"],
            "REJECTION",
            reason=body.reason
        )
            
    if email_res["sent_status"] == "FAILED":
        return {
            "message": "Registration Rejected Successfully, but email delivery failed. Please retry sending the notification.",
            "email_sent": False
        }
    
    return {
        "message": "Registration Rejected Successfully\nRejection notification sent to registered email.",
        "email_sent": True
    }

@app.get("/api/dashboard/{dashboard_role}")
def dashboard_gate(dashboard_role: str, session: dict = Depends(get_current_session)):
    allowed_role = normalize_role(session["role"])
    if dashboard_role.lower() not in {allowed_role.lower().replace(" ", ""), allowed_role.lower().replace(" ", "-")}:
        raise HTTPException(status_code=403, detail="Forbidden.")
    return {"status": "success", "dashboard_role": dashboard_role, "session": session}


# ─── Admin Dashboard Endpoints ───────────────────────────────────────────────

@app.get("/api/admin/dashboard/stats")
def get_dashboard_stats(session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # User counts by role and status
            cur.execute("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE role = 'Patient') as patients,
                    COUNT(*) FILTER (WHERE role = 'Doctor') as doctors,
                    COUNT(*) FILTER (WHERE role = 'Nurse') as nurses,
                    COUNT(*) FILTER (WHERE role = 'Lab Technician') as lab_techs,
                    COUNT(*) FILTER (WHERE status = 'Pending') as pending,
                    COUNT(*) FILTER (WHERE status = 'Approved') as approved,
                    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
                    COUNT(*) FILTER (WHERE status = 'Disabled') as disabled
                FROM Users
            """)
            user_stats = cur.fetchone()

            # Active sessions
            cur.execute("SELECT COUNT(*) as cnt FROM Sessions WHERE expires_at > NOW() AND is_active = TRUE")
            active_sessions = cur.fetchone()["cnt"]

            # PQC keys generated
            cur.execute("SELECT COUNT(*) as cnt FROM Users WHERE mlkem_public_key IS NOT NULL")
            pqc_keys = cur.fetchone()["cnt"]

    return DashboardStats(
        total_users=user_stats["total"],
        total_patients=user_stats["patients"],
        total_doctors=user_stats["doctors"],
        total_nurses=user_stats["nurses"],
        total_lab_technicians=user_stats["lab_techs"],
        pending_requests=user_stats["pending"],
        approved_users=user_stats["approved"],
        rejected_users=user_stats["rejected"],
        disabled_users=user_stats["disabled"],
        active_sessions=active_sessions,
        pqc_keys_generated=pqc_keys
    )


@app.get("/api/admin/dashboard/recent-activity")
def get_recent_activity(session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("""
                SELECT id, admin_user_id, action, target_public_user_id, details, created_at
                FROM AdminAuditLogs
                ORDER BY created_at DESC
                LIMIT 20
            """)
            rows = cur.fetchall()

    return [
        AuditLogEntry(
            id=str(row["id"]),
            admin_user_id=row["admin_user_id"],
            action=row["action"],
            target_public_user_id=row["target_public_user_id"],
            details=row["details"],
            created_at=row["created_at"]
        )
        for row in rows
    ]


@app.get("/api/admin/users")
def list_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    per_page: int = 10,
    session: dict = Depends(require_role("Administrator"))
):
    conditions = []
    params = []

    if role:
        conditions.append("role = %s")
        params.append(role)
    if status:
        conditions.append("status = %s")
        params.append(status)
    if search:
        conditions.append("(user_id ILIKE %s OR full_name ILIKE %s OR email ILIKE %s)")
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # Total count
            cur.execute(f"SELECT COUNT(*) as cnt FROM Users {where_clause}", params)
            total = cur.fetchone()["cnt"]

            # Paginated results
            offset = (page - 1) * per_page
            cur.execute(
                f"""SELECT id, user_id, full_name, email, role, gender, status, created_at
                    FROM Users {where_clause}
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset]
            )
            rows = cur.fetchall()

    total_pages = math.ceil(total / per_page) if per_page > 0 else 0

    users = [
        {
            "id": str(row["id"]),
            "user_id": row["user_id"],
            "full_name": row["full_name"],
            "email": row["email"],
            "role": row["role"],
            "gender": row["gender"],
            "status": row["status"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }
        for row in rows
    ]

    return {
        "users": users,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }


@app.get("/api/admin/users/{user_uuid}")
def get_user_detail(user_uuid: str, session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM Users WHERE id = %s", (user_uuid,))
            user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserDetail(
        id=str(user["id"]),
        user_id=user["user_id"],
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
        gender=user["gender"],
        date_of_birth=decrypt_data(user["date_of_birth_encrypted"]) if user["date_of_birth_encrypted"] else None,
        blood_group=decrypt_data(user["blood_group_encrypted"]) if user["blood_group_encrypted"] else None,
        specialization=user["specialization"],
        status=user["status"],
        rejection_reason=user.get("rejection_reason"),
        has_mlkem_keys=user["mlkem_public_key"] is not None,
        has_mldsa_keys=user["mldsa_public_key"] is not None,
        created_at=user["created_at"],
        approved_at=user["approved_at"]
    )


@app.post("/api/admin/users/{user_uuid}/disable")
def disable_user(user_uuid: str, request: Request, session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT id, user_id, status, role FROM Users WHERE id = %s", (user_uuid,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            if user["status"] != "Approved":
                raise HTTPException(status_code=400, detail="Only approved users can be disabled")

            cur.execute("UPDATE Users SET status = 'Disabled' WHERE id = %s", (user_uuid,))
            conn.commit()

        log_admin_action(
            conn, session["user_id"], session.get("public_user_id"),
            "USER_DISABLED", user_uuid, user["user_id"],
            request.client.host if request else None,
            {"role": user["role"]}
        )

    return {"message": "User account has been disabled"}


@app.post("/api/admin/users/{user_uuid}/enable")
def enable_user(user_uuid: str, request: Request, session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT id, user_id, status, role FROM Users WHERE id = %s", (user_uuid,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            if user["status"] != "Disabled":
                raise HTTPException(status_code=400, detail="Only disabled users can be re-enabled")

            cur.execute("UPDATE Users SET status = 'Approved' WHERE id = %s", (user_uuid,))
            conn.commit()

        log_admin_action(
            conn, session["user_id"], session.get("public_user_id"),
            "USER_ENABLED", user_uuid, user["user_id"],
            request.client.host if request else None,
            {"role": user["role"]}
        )

    return {"message": "User account has been re-enabled"}


@app.get("/api/admin/audit-logs")
def get_audit_logs(
    action: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    session: dict = Depends(require_role("Administrator"))
):
    conditions = []
    params = []

    if action:
        conditions.append("action = %s")
        params.append(action)

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(f"SELECT COUNT(*) as cnt FROM AdminAuditLogs {where_clause}", params)
            total = cur.fetchone()["cnt"]

            offset = (page - 1) * per_page
            cur.execute(
                f"""SELECT id, admin_user_id, action, target_public_user_id, details, created_at
                    FROM AdminAuditLogs {where_clause}
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset]
            )
            rows = cur.fetchall()

    total_pages = math.ceil(total / per_page) if per_page > 0 else 0

    logs = [
        AuditLogEntry(
            id=str(row["id"]),
            admin_user_id=row["admin_user_id"],
            action=row["action"],
            target_public_user_id=row["target_public_user_id"],
            details=row["details"],
            created_at=row["created_at"]
        )
        for row in rows
    ]

    return {
        "logs": [log.model_dump() for log in logs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }


@app.get("/api/admin/security/stats")
def get_security_stats(session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # Failed login attempts in last 24 hours
            cur.execute("""
                SELECT COUNT(*) as cnt FROM AuthLogs 
                WHERE action = 'LOGIN_FAILED' AND created_at > NOW() - INTERVAL '24 hours'
            """)
            failed_logins = cur.fetchone()["cnt"]

            # Disabled accounts
            cur.execute("SELECT COUNT(*) as cnt FROM Users WHERE status = 'Disabled'")
            disabled = cur.fetchone()["cnt"]

            # Active sessions
            cur.execute("SELECT COUNT(*) as cnt FROM Sessions WHERE expires_at > NOW() AND is_active = TRUE")
            active_sessions = cur.fetchone()["cnt"]

            # Total PQC keypairs
            cur.execute("SELECT COUNT(*) as cnt FROM Users WHERE mlkem_public_key IS NOT NULL")
            total_pqc = cur.fetchone()["cnt"]

            # Active crypto identities
            cur.execute("SELECT COUNT(*) as cnt FROM Users WHERE mlkem_public_key IS NOT NULL AND status = 'Approved'")
            active_crypto = cur.fetchone()["cnt"]

    return SecurityStats(
        failed_login_attempts_24h=failed_logins,
        disabled_accounts=disabled,
        active_sessions=active_sessions,
        total_pqc_keypairs=total_pqc,
        active_crypto_identities=active_crypto
    )


@app.get("/api/admin/users/{user_uuid}/emails")
def get_user_emails(user_uuid: str, session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("""
                SELECT id, user_id, email_address, notification_type, email_subject, email_content, sent_status, sent_timestamp, error_message, created_at
                FROM EmailNotifications
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_uuid,))
            rows = cur.fetchall()
            
    return [
        {
            "id": str(row["id"]),
            "user_id": str(row["user_id"]) if row["user_id"] else None,
            "email_address": row["email_address"],
            "notification_type": row["notification_type"],
            "email_subject": row["email_subject"],
            "email_content": row["email_content"],
            "sent_status": row["sent_status"],
            "sent_timestamp": row["sent_timestamp"].isoformat() if row["sent_timestamp"] else None,
            "error_message": row["error_message"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }
        for row in rows
    ]


@app.post("/api/admin/emails/{notification_id}/resend")
def resend_failed_email_endpoint(notification_id: str, session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        res = retry_failed_email(conn, notification_id)
        
    if res["sent_status"] == "FAILED":
        raise HTTPException(status_code=400, detail=f"Failed to resend email: {res['error_message']}")
        
    return {"message": "Email resent successfully", "status": res["sent_status"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)