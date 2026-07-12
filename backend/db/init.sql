-- Database: phr_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('Active', 'Suspended', 'Invited', 'Locked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE key_status AS ENUM ('Active', 'Rotated', 'Revoked', 'Compromised');
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

CREATE TABLE IF NOT EXISTS Roles (
    Role_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Role_Name VARCHAR(80) UNIQUE NOT NULL,
    Description TEXT,
    Is_System_Role BOOLEAN NOT NULL DEFAULT TRUE,
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Permissions (
    Permission_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Permission_Key VARCHAR(120) UNIQUE NOT NULL,
    Description TEXT,
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Users (
    User_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Firebase_UID VARCHAR(255) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Full_Name VARCHAR(255) NOT NULL,
    Role_ID UUID NOT NULL REFERENCES Roles(Role_ID),
    Status user_status NOT NULL DEFAULT 'Active',
    Department VARCHAR(120),
    Organization VARCHAR(160),
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Last_Login_At TIMESTAMP WITH TIME ZONE,
    Must_Reset_Keys BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS RolePermissions (
    Role_Permission_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Role_ID UUID NOT NULL REFERENCES Roles(Role_ID) ON DELETE CASCADE,
    Permission_ID UUID NOT NULL REFERENCES Permissions(Permission_ID) ON DELETE CASCADE,
    Granted_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(Role_ID, Permission_ID)
);

CREATE TABLE IF NOT EXISTS UserKeys (
    User_Key_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    User_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
    Algorithm VARCHAR(80) NOT NULL DEFAULT 'ML-KEM-768',
    Key_Version INTEGER NOT NULL DEFAULT 1,
    Public_Key TEXT NOT NULL,
    Encrypted_Private_Key TEXT NOT NULL,
    Key_Status key_status NOT NULL DEFAULT 'Active',
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Rotated_At TIMESTAMP WITH TIME ZONE,
    Revoked_At TIMESTAMP WITH TIME ZONE,
    UNIQUE(User_ID, Key_Version)
);

CREATE TABLE IF NOT EXISTS Sessions (
    Session_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    User_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
    Session_JTI VARCHAR(255) UNIQUE NOT NULL,
    Refresh_Token_Hash TEXT NOT NULL,
    Risk_Score NUMERIC(5,2) NOT NULL DEFAULT 0,
    Ip_Address INET,
    User_Agent TEXT,
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Expires_At TIMESTAMP WITH TIME ZONE NOT NULL,
    Revoked_At TIMESTAMP WITH TIME ZONE,
    Last_Activity_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS AuditLogs (
    Audit_Log_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    User_ID UUID REFERENCES Users(User_ID) ON DELETE SET NULL,
    Actor_Role VARCHAR(80) NOT NULL,
    Action_Key VARCHAR(120) NOT NULL,
    Resource_Type VARCHAR(120),
    Resource_ID VARCHAR(255),
    Consent_Status consent_status,
    Blockchain_Reference VARCHAR(255),
    Risk_Score NUMERIC(5,2) NOT NULL DEFAULT 0,
    Success BOOLEAN NOT NULL DEFAULT TRUE,
    Metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS MedicalRecords (
    Medical_Record_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Patient_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
    Uploaded_By UUID REFERENCES Users(User_ID) ON DELETE SET NULL,
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
    Patient_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
    Subject_User_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
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
    Requester_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
    Patient_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
    Reason TEXT NOT NULL,
    Status consent_status NOT NULL DEFAULT 'Emergency',
    Approved_By UUID REFERENCES Users(User_ID) ON DELETE SET NULL,
    Blockchain_Tx_Hash VARCHAR(255),
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Expires_At TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS Notifications (
    Notification_ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    User_ID UUID NOT NULL REFERENCES Users(User_ID) ON DELETE CASCADE,
    Channel notification_channel NOT NULL DEFAULT 'InApp',
    Notification_Type VARCHAR(120) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Body TEXT NOT NULL,
    Read_At TIMESTAMP WITH TIME ZONE,
    Created_At TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON Users(Firebase_UID);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON Users(Role_ID);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON Sessions(User_ID);
CREATE INDEX IF NOT EXISTS idx_auditlogs_user_id ON AuditLogs(User_ID);
CREATE INDEX IF NOT EXISTS idx_records_patient_id ON MedicalRecords(Patient_ID);
CREATE INDEX IF NOT EXISTS idx_consent_patient_subject ON Consent(Patient_ID, Subject_User_ID);
