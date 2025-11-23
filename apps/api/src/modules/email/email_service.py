from typing import Optional

import resend
from loguru import logger

from src.core.settings import settings


class EmailService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.RESEND_API_KEY
        if self.api_key:
            resend.api_key = self.api_key

    def send_password_reset_email(
        self, to_email: str, reset_code: str, reset_link: str
    ) -> bool:
        """Send password reset email using Resend."""
        if not self.api_key:
            logger.error("Resend API key missing.")
            return False

        try:
            subject = "Reset your OpenCircle password"
            from_email = (
                "hello@devscale.id"  # Default Resend domain, change to your domain
            )
            html_content = f"""
            <h2>Reset your OpenCircle password</h2>
            <p>Hi there,</p>
            <p>You requested to reset your password for your OpenCircle account.</p>
            <p>You can reset your password in two ways:</p>
            <h3>Option 1: Click the link below</h3>
            <p><a href="{reset_link}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
            <h3>Option 2: Use the verification code</h3>
            <p>Your verification code is: <strong>{reset_code}</strong></p>
            <p>This code will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Thanks,<br>The OpenCircle Team</p>
            """

            params = {
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            result = resend.Emails.send(params)
            logger.info(f"Email sent successfully: {result}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

    def send_verification_email(
        self, to_email: str, verification_code: str, verification_link: str
    ) -> bool:
        """Send email verification email using Resend."""
        if not self.api_key:
            logger.error("Resend API key missing.")
            return False

        try:
            subject = "Verify your OpenCircle email address"
            from_email = (
                "hello@devscale.id"  # Default Resend domain, change to your domain
            )
            html_content = f"""
            <h2>Verify your OpenCircle email address</h2>
            <p>Hi there,</p>
            <p>Thank you for registering with OpenCircle! To complete your registration, please verify your email address.</p>
            <p>You can verify your email in two ways:</p>
            <h3>Option 1: Click the link below</h3>
            <p><a href="{verification_link}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email Address</a></p>
            <h3>Option 2: Use the verification code</h3>
            <p>Your verification code is: <strong>{verification_code}</strong></p>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't create an OpenCircle account, please ignore this email.</p>
            <p>Thanks,<br>The OpenCircle Team</p>
            """

            params = {
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            result = resend.Emails.send(params)
            logger.info(f"Verification email sent successfully: {result}")
            return True

        except Exception as e:
            logger.error(f"Failed to send verification email: {str(e)}")
            return False


# Create a singleton instance
email_service = EmailService()
