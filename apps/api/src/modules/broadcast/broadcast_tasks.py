import re

import markdown
from loguru import logger
from sqlmodel import Session

from src.core.celery_app import celery_app
from src.database.engine import engine
from src.database.models import BroadcastRecipientStatus, BroadcastStatus
from src.modules.broadcast.broadcast_methods import (
    get_broadcast,
    get_pending_recipients,
    update_broadcast_recipient_status,
    update_broadcast_status,
)
from src.modules.email.email_service import email_service

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def markdown_to_html(content: str) -> str:
    """Convert markdown content to HTML with email-friendly wrapper."""
    html_body = markdown.markdown(
        content,
        extensions=["extra", "nl2br", "sane_lists"],
    )
    return f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        {html_body}
    </div>
    """


def is_valid_email(email: str) -> bool:
    """Validate email format."""
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


@celery_app.task
def send_broadcast_task(broadcast_id: str, is_test: bool = False):
    """Send broadcast emails as a background task."""
    with Session(engine) as db:
        try:
            broadcast = get_broadcast(db, broadcast_id)
            if not broadcast:
                logger.error(f"Broadcast {broadcast_id} not found")
                return {"success": False, "error": "Broadcast not found"}

            pending_recipients = get_pending_recipients(db, broadcast_id)
            if not pending_recipients:
                logger.info(f"No pending recipients for broadcast {broadcast_id}")
                return {"success": True, "message": "No pending recipients"}

            sent_count = 0
            failed_count = 0

            for recipient in pending_recipients:
                try:
                    if not is_valid_email(recipient.email):
                        logger.warning(f"Skipping invalid email: {recipient.email}")
                        update_broadcast_recipient_status(
                            db,
                            recipient.id,
                            BroadcastRecipientStatus.FAILED,
                            "Invalid email format",
                        )
                        failed_count += 1
                        continue

                    html_content = markdown_to_html(broadcast.content)
                    success = email_service.send_broadcast_email(
                        to_email=recipient.email.strip(),
                        subject=broadcast.subject,
                        html_content=html_content,
                    )

                    if success:
                        update_broadcast_recipient_status(
                            db, recipient.id, BroadcastRecipientStatus.SENT
                        )
                        sent_count += 1
                    else:
                        update_broadcast_recipient_status(
                            db,
                            recipient.id,
                            BroadcastRecipientStatus.FAILED,
                            "Failed to send email",
                        )
                        failed_count += 1

                except Exception as e:
                    logger.error(f"Failed to send to {recipient.email}: {str(e)}")
                    update_broadcast_recipient_status(
                        db,
                        recipient.id,
                        BroadcastRecipientStatus.FAILED,
                        str(e),
                    )
                    failed_count += 1

            if not is_test:
                final_status = (
                    BroadcastStatus.SENT if sent_count > 0 else BroadcastStatus.FAILED
                )
                update_broadcast_status(
                    db, broadcast_id, final_status, sent_count, failed_count
                )

            return {
                "success": True,
                "sent_count": sent_count,
                "failed_count": failed_count,
                "message": f"Broadcast completed: {sent_count} sent, {failed_count} failed",
            }

        except Exception as e:
            logger.error(f"Failed to process broadcast {broadcast_id}: {str(e)}")
            if not is_test:
                update_broadcast_status(db, broadcast_id, BroadcastStatus.FAILED, 0, 0)
            return {"success": False, "error": str(e)}
