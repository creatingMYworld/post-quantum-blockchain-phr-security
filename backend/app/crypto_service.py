import logging
import base64
from app.security import encrypt_data

logger = logging.getLogger(__name__)

try:
    import oqs
    OQS_AVAILABLE = True
except ImportError:
    OQS_AVAILABLE = False
    logger.warning("liboqs-python not available. Falling back to mock PQC keys.")

def generate_mlkem_keypair() -> tuple[str, str]:
    """Generates ML-KEM (Kyber-768) keypair. Returns (public_key, encrypted_private_key)"""
    if OQS_AVAILABLE:
        try:
            with oqs.KeyEncapsulation("Kyber768") as kem:
                public_key_bytes = kem.generate_keypair()
                private_key_bytes = kem.export_secret_key()
                public_key = base64.b64encode(public_key_bytes).decode('utf-8')
                private_key = base64.b64encode(private_key_bytes).decode('utf-8')
                return public_key, encrypt_data(private_key)
        except Exception as e:
            logger.error(f"Error generating ML-KEM key: {e}")
            
    # Mock fallback
    import secrets
    public_key = f"mock_mlkem_pub_{secrets.token_hex(32)}"
    private_key = f"mock_mlkem_priv_{secrets.token_hex(64)}"
    return public_key, encrypt_data(private_key)

def generate_mldsa_keypair() -> tuple[str, str]:
    """Generates ML-DSA (Dilithium3) keypair. Returns (public_key, encrypted_private_key)"""
    if OQS_AVAILABLE:
        try:
            with oqs.Signature("Dilithium3") as sig:
                public_key_bytes = sig.generate_keypair()
                private_key_bytes = sig.export_secret_key()
                public_key = base64.b64encode(public_key_bytes).decode('utf-8')
                private_key = base64.b64encode(private_key_bytes).decode('utf-8')
                return public_key, encrypt_data(private_key)
        except Exception as e:
            logger.error(f"Error generating ML-DSA key: {e}")
            
    # Mock fallback
    import secrets
    public_key = f"mock_mldsa_pub_{secrets.token_hex(32)}"
    private_key = f"mock_mldsa_priv_{secrets.token_hex(64)}"
    return public_key, encrypt_data(private_key)
