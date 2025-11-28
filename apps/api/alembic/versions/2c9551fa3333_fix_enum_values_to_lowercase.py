"""fix_enum_values_to_lowercase

Revision ID: 2c9551fa3333
Revises: 1053d8244b76
Create Date: 2025-11-28 23:16:34.733476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel



# revision identifiers, used by Alembic.
revision: str = '2c9551fa3333'
down_revision: Union[str, Sequence[str], None] = '1053d8244b76'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix broadcastrecipienttype enum - rename UPPERCASE values to lowercase
    # Note: 'channel_members' was already added in lowercase by previous migration
    op.execute("ALTER TYPE broadcastrecipienttype RENAME VALUE 'ALL_USERS' TO 'all_users'")
    op.execute("ALTER TYPE broadcastrecipienttype RENAME VALUE 'TEST_EMAIL' TO 'test_email'")
    
    # Fix broadcaststatus enum - rename values to lowercase
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'DRAFT' TO 'draft'")
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'SENDING' TO 'sending'")
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'SENT' TO 'sent'")
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'FAILED' TO 'failed'")
    
    # Fix broadcastrecipientstatus enum - rename values to lowercase
    op.execute("ALTER TYPE broadcastrecipientstatus RENAME VALUE 'PENDING' TO 'pending'")
    op.execute("ALTER TYPE broadcastrecipientstatus RENAME VALUE 'SENT' TO 'sent'")
    op.execute("ALTER TYPE broadcastrecipientstatus RENAME VALUE 'FAILED' TO 'failed'")


def downgrade() -> None:
    """Downgrade schema."""
    # Revert to uppercase values
    op.execute("ALTER TYPE broadcastrecipienttype RENAME VALUE 'all_users' TO 'ALL_USERS'")
    op.execute("ALTER TYPE broadcastrecipienttype RENAME VALUE 'test_email' TO 'TEST_EMAIL'")
    
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'draft' TO 'DRAFT'")
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'sending' TO 'SENDING'")
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'sent' TO 'SENT'")
    op.execute("ALTER TYPE broadcaststatus RENAME VALUE 'failed' TO 'FAILED'")
    
    op.execute("ALTER TYPE broadcastrecipientstatus RENAME VALUE 'pending' TO 'PENDING'")
    op.execute("ALTER TYPE broadcastrecipientstatus RENAME VALUE 'sent' TO 'SENT'")
    op.execute("ALTER TYPE broadcastrecipientstatus RENAME VALUE 'failed' TO 'FAILED'")
