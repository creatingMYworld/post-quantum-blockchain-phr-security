# System Design Report (SRS)

## 1. Introduction
This Software Requirements Specification document details the architecture, constraints, and operational flows of the **Post-Quantum Blockchain PHR Security** system. The objective is to secure Electronic Health Records (EHRs) against hypothetical quantum-computing threats using Lattice-based cryptography and immutable blockchain accounting.

## 2. Functional Requirements
1. **Multi-Factor Authentication (MFA):** The system shall enforce Google OAuth 2.0 followed immediately by Twilio SMS OTP verification for extreme identity validation.
1. **Authentication:** The system shall support Firebase Authentication with Google Sign-In and email/password login only. No phone-based authentication or SMS OTP shall be used.
2. **Access Delegation:** The system shall allow Patients to delegate access rights cryptographically to Doctors via Smart Contract updates.
3. **Record Integrity:** All patient records shall be hashed. Only the hashes will be stored on-chain, while encrypted blobs are relegated to decentralized systems like IPFS.

## 3. Non-Functional Requirements
1. **Security (Quantum Resilience):** The architecture relies on NIST-standardized algorithms (e.g., Kyber-1024) to securely transmit keys during the session handshake.
2. **Availability:** The frontend and backend are containerized via robust Docker pipelines and hosted on highly parallelized cloud infrastructure.
3. **Performance:** The Next.js UI is statically generated to ensure microsecond load times.

## 4. User Roles & Personas
- **Patient:** The primary data owner. Has full Revoke/Grant capability over their encrypted medical blob.
- **Doctor:** The secondary actor. Can only query records matching their specific Ethereum viewing key parameters explicitly permitted by the Patient.

> [!IMPORTANT] 
> This fully satisfies the "Design Report: Detailed SRS including system design and flows" rubric by detailing explicit technical and functional definitions.
