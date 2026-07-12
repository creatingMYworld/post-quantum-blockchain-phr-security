from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from secrets import token_hex


@dataclass(slots=True)
class KeyMaterial:
    public_key: str
    encrypted_private_key: str
    key_version: int
    key_status: str
    algorithm: str = "ML-KEM-768"
    created_at: datetime = datetime.now(timezone.utc)


class KeyManagementService:
    def generate_or_retrieve_keypair(self, user_id: str, existing: KeyMaterial | None = None) -> KeyMaterial:
        if existing is not None:
            return existing
        return KeyMaterial(
            public_key=f"pub_{token_hex(32)}",
            encrypted_private_key=f"enc_{token_hex(64)}",
            key_version=1,
            key_status="Active",
        )

    def rotate_keypair(self, existing: KeyMaterial) -> KeyMaterial:
        return KeyMaterial(
            public_key=f"pub_{token_hex(32)}",
            encrypted_private_key=f"enc_{token_hex(64)}",
            key_version=existing.key_version + 1,
            key_status="Active",
        )


key_service = KeyManagementService()
