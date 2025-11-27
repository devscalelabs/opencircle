"""add notification preferences and pending email tables

Revision ID: f52cc8e8d6ee
Revises: d307b309adfc
Create Date: 2025-11-27 10:20:29.812790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'f52cc8e8d6ee'
down_revision: Union[str, Sequence[str], None] = 'd307b309adfc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add REPLY to existing notificationtype enum
    op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'REPLY'")
    
    # Create new notificationfrequency enum
    notificationfrequency = postgresql.ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'NONE', name='notificationfrequency', create_type=False)
    notificationfrequency.create(op.get_bind(), checkfirst=True)
    
    # Create notification_preferences table
    op.create_table('notification_preferences',
    sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('mention_email', postgresql.ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'NONE', name='notificationfrequency', create_type=False), nullable=False),
    sa.Column('like_email', postgresql.ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'NONE', name='notificationfrequency', create_type=False), nullable=False),
    sa.Column('reply_email', postgresql.ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'NONE', name='notificationfrequency', create_type=False), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notification_preferences_user_id'), 'notification_preferences', ['user_id'], unique=True)
    
    # Create pending_notification_email table
    op.create_table('pending_notification_email',
    sa.Column('id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('notification_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('notification_type', postgresql.ENUM('MENTION', 'LIKE', 'REPLY', name='notificationtype', create_type=False), nullable=False),
    sa.Column('frequency', postgresql.ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'NONE', name='notificationfrequency', create_type=False), nullable=False),
    sa.Column('scheduled_for', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('is_sent', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['notification_id'], ['notification.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pending_notification_email_is_sent'), 'pending_notification_email', ['is_sent'], unique=False)
    op.create_index(op.f('ix_pending_notification_email_notification_id'), 'pending_notification_email', ['notification_id'], unique=False)
    op.create_index(op.f('ix_pending_notification_email_scheduled_for'), 'pending_notification_email', ['scheduled_for'], unique=False)
    op.create_index(op.f('ix_pending_notification_email_user_id'), 'pending_notification_email', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_pending_notification_email_user_id'), table_name='pending_notification_email')
    op.drop_index(op.f('ix_pending_notification_email_scheduled_for'), table_name='pending_notification_email')
    op.drop_index(op.f('ix_pending_notification_email_notification_id'), table_name='pending_notification_email')
    op.drop_index(op.f('ix_pending_notification_email_is_sent'), table_name='pending_notification_email')
    op.drop_table('pending_notification_email')
    op.drop_index(op.f('ix_notification_preferences_user_id'), table_name='notification_preferences')
    op.drop_table('notification_preferences')
    
    # Drop the notificationfrequency enum type
    op.execute("DROP TYPE IF EXISTS notificationfrequency")
