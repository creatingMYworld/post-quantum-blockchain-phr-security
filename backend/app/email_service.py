import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)

def _send_email(to_email: str, subject: str, body: str):
    settings = get_settings()
    
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"SMTP not configured. Mock sending email to {to_email}")
        logger.info(f"Subject: {subject}\nBody: {body}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")

def send_approval_email(email: str, full_name: str, user_id: str):
    subject = "PQC Hospital System - Registration Approved"
    body = f"Hello {full_name},\n\nYour registration has been approved.\nYour User ID is: {user_id}\n\nYou can now use this User ID to log in to the system.\n\nThank you."
    _send_email(email, subject, body)

def send_rejection_email(email: str, full_name: str):
    subject = "PQC Hospital System - Registration Rejected"
    body = f"Hello {full_name},\n\nUnfortunately, your registration to the PQC Hospital System has not been approved at this time.\n\nPlease contact administration for more details.\n\nThank you."
    _send_email(email, subject, body)

def send_admin_notification(registration_data: dict):
    settings = get_settings()
    subject = "PQC Hospital System - New Registration Pending Approval"
    full_name = registration_data.get('full_name')
    email = registration_data.get('email')
    role = registration_data.get('role')
    
    body = f"A new user has registered and is pending approval.\n\nName: {full_name}\nEmail: {email}\nRole: {role}\n\nPlease log in to the administrator dashboard to review."
    _send_email(settings.ADMIN_EMAIL, subject, body)
