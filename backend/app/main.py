from fastapi import FastAPI, Depends, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import psycopg
from psycopg.rows import dict_row

from app.schemas import (
    RegistrationRequest, LoginRequest, RegistrationResponse, LoginResponse, 
    PendingRegistration, AdminActionRequest, AdminActionResponse
)
from app.database import get_db, init_db
from app.security import (
    hash_password, verify_password, encrypt_data, decrypt_data,
    create_session_token, get_current_session, require_role, require_permission
)
from app.crypto_service import generate_mlkem_keypair, generate_mldsa_keypair
from app.email_service import send_approval_email, send_rejection_email, send_admin_notification
from app.user_id_service import generate_user_id
from app.rbac import get_permissions_for_role, normalize_role

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
def approve_registration(user_uuid: str, session: dict = Depends(require_role("Administrator"))):
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
            
    send_approval_email(user["email"], user["full_name"], new_user_id)
    
    return {"message": "Registration approved successfully", "user_id": new_user_id}

@app.post("/api/admin/registrations/{user_uuid}/reject", response_model=AdminActionResponse)
def reject_registration(user_uuid: str, session: dict = Depends(require_role("Administrator"))):
    with get_db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM Users WHERE id = %s", (user_uuid,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Registration not found")
            
            if user["status"] != "Pending":
                raise HTTPException(status_code=400, detail="Registration is not pending")
                
            cur.execute("UPDATE Users SET status = 'Rejected' WHERE id = %s", (user_uuid,))
            conn.commit()
            
    send_rejection_email(user["email"], user["full_name"])
    
    return {"message": "Registration rejected"}

@app.get("/api/dashboard/{dashboard_role}")
def dashboard_gate(dashboard_role: str, session: dict = Depends(get_current_session)):
    allowed_role = normalize_role(session["role"])
    if dashboard_role.lower() not in {allowed_role.lower().replace(" ", ""), allowed_role.lower().replace(" ", "-")}:
        raise HTTPException(status_code=403, detail="Forbidden.")
    return {"status": "success", "dashboard_role": dashboard_role, "session": session}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)