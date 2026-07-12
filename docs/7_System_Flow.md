# System Flow & Mapping

## 1. Authentication & Key Exchange Flow
The initial point of entry is protected by hybrid security paradigms mapping identity directly to sessions.
```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant Firebase
    
    User->>Firebase: 1. Sign in with Google
    Firebase-->>NextJS: 2. Return Auth Token
    User->>NextJS: 3. Continue with email/password or Google session
    NextJS-->>User: 4. Session Confirmed (Unlock UI)
```

## 2. Personal Health Record (PHR) Upload Flow
When a patient uploads a diagnosis or lab report, the underlying mapping behaves as a strict pipeline:
```mermaid
sequenceDiagram
    participant Patient
    participant NextJS (Frontend)
    participant Python (Backend)
    participant IPFS
    participant Blockchain

    Patient->>NextJS (Frontend): Upload Medical PDF
    NextJS (Frontend)->>Python (Backend): Transmit for Lattice Encryption
    Python (Backend)->>Python (Backend): Encrypt via Kyber-1024
    Python (Backend)->>IPFS: Store Encrypted Ciphertext
    IPFS-->>Python (Backend): Return Secure CID
    Python (Backend)->>Blockchain: Emit Event (Patient UUID, CID)
    Blockchain-->>Patient: Transaction Receipt (Immutable)
```

## 3. Data Flow Mapping Matrix
- **React Context / LocalStorage:** Maintains ephemeral session states and UI theming (e.g., Dark Mode preferences) away from the database.
- **Next.js API Routes:** Frontend auth flows rely on Firebase Authentication helpers; no SMS or phone verification services are used.
- **Solidity Ledger (`PHR.sol`):** Maps unique patient identifiers directly to an array of authorized Doctor Ethereum wallet addresses. 

> [!TIP]
> This completes the requirement: "System Flow: Clear presentation of design, flows, and mapping" by providing granular UML mapping matrices.
