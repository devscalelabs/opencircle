from typing import List, Optional

import resend
from loguru import logger

from src.core.settings import settings


class EmailService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.RESEND_API_KEY
        if self.api_key:
            resend.api_key = self.api_key

    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Generic email sending method."""
        if not self.api_key:
            logger.error("Resend API key missing.")
            return False

        try:
            from_email = "hello@devscale.id"
            params: resend.Emails.SendParams = {
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

            params: resend.Emails.SendParams = {
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

            params: resend.Emails.SendParams = {
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

    def send_notification_email(
        self,
        to_email: str,
        notification_type: str,
        sender_username: str,
        content: Optional[str] = None,
        post_link: Optional[str] = None,
    ) -> bool:
        """Send immediate notification email."""
        type_messages = {
            "mention": f"{sender_username} mentioned you",
            "like": f"{sender_username} liked your post",
            "reply": f"{sender_username} replied to your post",
        }

        subject = (
            f"OpenCircle: {type_messages.get(notification_type, 'New notification')}"
        )

        content_section = ""
        if content:
            content_section = f"""
            <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; color: #333;">{content}</p>
            </div>
            """

        view_button = ""
        if post_link:
            view_button = f"""
            <p style="margin-top: 20px;">
                <a href="{post_link}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Post</a>
            </p>
            """

        html_content = f"""
        <h2>{type_messages.get(notification_type, "New notification")}</h2>
        <p>Hi there,</p>
        <p>You have a new notification on OpenCircle.</p>
        {content_section}
        {view_button}
        <p>Thanks,<br>The OpenCircle Team</p>
        """

        return self._send_email(to_email, subject, html_content)

    def send_notification_digest_email(
        self,
        to_email: str,
        notifications: List[dict],
        digest_type: str,
    ) -> bool:
        """Send digest email with multiple notifications."""
        period = "daily" if digest_type == "daily" else "weekly"
        subject = f"OpenCircle: Your {period} notification digest"

        notification_items = ""
        for notif in notifications:
            type_msg = {
                "mention": "mentioned you",
                "like": "liked your post",
                "reply": "replied to your post",
            }.get(notif.get("type", ""), "sent you a notification")

            notification_items += f"""
            <div style="border-bottom: 1px solid #eee; padding: 12px 0;">
                <p style="margin: 0;"><strong>{notif.get("sender_username", "Someone")}</strong> {type_msg}</p>
                {f'<p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">{notif.get("content", "")[:100]}...</p>' if notif.get("content") else ""}
            </div>
            """

        html_content = f"""
        <h2>Your {period.capitalize()} Notification Digest</h2>
        <p>Hi there,</p>
        <p>Here's a summary of your notifications from the past {period.replace("daily", "day").replace("weekly", "week")}:</p>
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            {notification_items if notification_items else "<p>No new notifications.</p>"}
        </div>
        <p style="margin-top: 20px;">
            <a href="{settings.PLATFORM_URL}/notifications" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View All Notifications</a>
        </p>
        <p>Thanks,<br>The OpenCircle Team</p>
        """

        return self._send_email(to_email, subject, html_content)


# Create a singleton instance
email_service = EmailService()
