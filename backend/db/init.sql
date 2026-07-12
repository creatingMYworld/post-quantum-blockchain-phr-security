-- Database: phr_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('Pending', 'Approved', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Patient', 'Doctor', 'Nurse', 'Lab Technician', 'Administrator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consent_status AS ENUM ('Authorized', 'Revoked', 'Emergency', 'Expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('InApp', 'Email', 'Push');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Redesigned Users table
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),           -- Internal UUID (never exposed)
    user_id VARCHAR(20) UNIQUE,                                -- Public User ID (PAT-2026-000001), NULL until approved
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,                                -- Argon2 hash
    role user_role NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth_encrypted TEXT NOT NULL,                      -- AES-256 encrypted
    blood_group_encrypted TEXT,                                 -- AES-256 encrypted (patients only)
    specialization VARCHAR(255),                                -- Doctors only
    status registration_status NOT NULL DEFAULT 'Pending',
    mlkem_public_key TEXT,                                      -- Set on approval
    mlkem_private_key_encrypted TEXT,                           -- Set on approval
    mldsa_public_key TEXT,                                      -- Set on approval
    mldsa_private_key_encrypted TEXT,                           -- Set on approval
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES Users(id)
);

-- User ID sequence counters (per role, per year)
CREATE TABLE IF NOT EXISTS UserIdSequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_prefix VARCHAR(3) NOT NULL,      -- PAT, DOC, NUR, LAB
    year INTEGER NOT NULL,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    UNIQUE(role_prefix, year)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS Sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    role user_role NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Authentication audit logs
CREATE TABLE IF NOT EXISTS AuthLogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES Users(id),
    public_user_id VARCHAR(20),
    action VARCHAR(50) NOT NULL,           -- LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, etc.
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS MedicalRecords (
    Medical_Record_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Patient_ID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    Uploaded_By UUID REFERENCES Users(id) ON DELETE SET NULL,
    Record_Type VARCHAR(120) NOT NULL,
    Storage_Provider VARCHAR(40) NOT NULL DEFAULT 'Firestore',
    Storage_Reference TEXT NOT NULL,
    Encrypted_Key_Reference TEXT NOT NULL,
    Key_Version INTEGER NOT NULL DEFAULT 1,
    Blockchain_Tx_Hash VARCHAR(255),
    Consent_Required BOOLEAN NOT NULL DEFAULT TRUE,
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Consent (
    Consent_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Patient_ID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    Subject_User_ID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    Subject_Role VARCHAR(80) NOT NULL,
    Status consent_status NOT NULL DEFAULT 'Authorized',
    Scope JSONB NOT NULL DEFAULT '{}'::jsonb,
    Granted_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Expires_At TIMESTAMP WITH TIME ZONE,
    Revoked_At TIMESTAMP WITH TIME ZONE,
    UNIQUE(Patient_ID, Subject_User_ID, Subject_Role)
);

CREATE TABLE IF NOT EXISTS EmergencyAccess (
    Emergency_Access_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Requester_ID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    Patient_ID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    Reason TEXT NOT NULL,
    Status consent_status NOT NULL DEFAULT 'Emergency',
    Approved_By UUID REFERENCES Users(id) ON DELETE SET NULL,
    Blockchain_Tx_Hash VARCHAR(255),
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Expires_At TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS Notifications (
    Notification_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    User_ID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    Channel notification_channel NOT NULL DEFAULT 'InApp',
    Notification_Type VARCHAR(120) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Body TEXT NOT NULL,
    Read_At TIMESTAMP WITH TIME ZONE,
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON Users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON Sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auditlogs_user_id ON AuthLogs(user_id);
CREATE INDEX IF NOT EXISTS idx_records_patient_id ON MedicalRecords(Patient_ID);
CREATE INDEX IF NOT EXISTS idx_consent_patient_subject ON Consent(Patient_ID, Subject_User_ID);
