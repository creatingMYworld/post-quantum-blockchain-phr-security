import logging
import json

logger = logging.getLogger(__name__)


def log_admin_action(
    conn,
    admin_id,
    admin_user_id,
    action,
    target_user_id=None,
    target_public_user_id=None,
    ip_address=None,
    details=None
):
    """Insert a record into AdminAuditLogs for admin action tracking."""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO AdminAuditLogs
                    (admin_id, admin_user_id, action, target_user_id, target_public_user_id, ip_address, details)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                admin_id,
                admin_user_id,
                action,
                target_user_id,
                target_public_user_id,
                ip_address,
                json.dumps(details) if details else '{}'
            ))
            conn.commit()
    except Exception as e:
        logger.error(f"Failed to log admin action '{action}': {e}")
