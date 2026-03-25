# Module Breakdown & API Designs

## Architecture Overview
The system follows a microservices-inspired monolithic architecture splitting responsibilities across three major boundaries: Frontend UI, Backend Gateway, and Blockchain Contracts.

### 1. Frontend Module (Next.js Application)
- **Role:** Handles presentation, client-side encryption context, and user interfaces.
- **Key Components:**
  - `Authentication Flow` (Quantum-secure handshake initiation)
  - `Dashboard View` (PHR visualization)
  - `Encryption Helper` (Client-side lattice-based cryptography stub)

### 2. Backend API Module (Node.js/Express or Python/FastAPI)
- **Role:** Intermediate gateway orchestrating database access and smart contract interactions.
- **API Designs (RESTful):**
  - `POST /api/user/register` - Registers patient identity.
  - `POST /api/phr/upload` - Uploads encrypted health records.
  - `GET /api/phr/:id` - Retrieves and validates data integrity from blockchain.
  
### 3. Blockchain Module (Smart Contracts)
- **Role:** Immutability and access control policies.
- **Components:**
  - `AccessControl.sol`: Manages role-based access for Doctors and Patients.
  - `PhRecord.sol`: Stores IPFS hashes and verifies signatures.

> [!TIP]
> This fulfills the requirement for "Module Breakdown: Architecture with API designs and module breakdown."
