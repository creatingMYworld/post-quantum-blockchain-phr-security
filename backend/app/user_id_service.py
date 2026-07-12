from datetime import datetime
import psycopg
from app.database import get_db

ROLE_PREFIXES = {
    "Patient": "PAT",
    "Doctor": "DOC",
    "Nurse": "NUR",
    "Lab Technician": "LAB",
    "Administrator": "ADM"
}

def generate_user_id(role: str) -> str:
    """Generates a unique User ID formatted as ROLE-YYYY-XXXXXX."""
    prefix = ROLE_PREFIXES.get(role)
    if not prefix:
        raise ValueError(f"Invalid role for User ID generation: {role}")
        
    year = datetime.now().year
    
    with get_db() as conn:
        with conn.cursor() as cur:
            # Try to update existing sequence or insert a new one
            # Use RETURNING to get the updated sequence number
            cur.execute("""
                INSERT INTO UserIdSequences (role_prefix, year, last_sequence)
                VALUES (%s, %s, 1)
                ON CONFLICT (role_prefix, year) 
                DO UPDATE SET last_sequence = UserIdSequences.last_sequence + 1
                RETURNING last_sequence;
            """, (prefix, year))
            
            result = cur.fetchone()
            if not result:
                raise Exception("Failed to generate sequence number")
                
            sequence = result[0]
            conn.commit()
            
    # Format: PREFIX-YYYY-XXXXXX
    return f"{prefix}-{year}-{sequence:06d}"
