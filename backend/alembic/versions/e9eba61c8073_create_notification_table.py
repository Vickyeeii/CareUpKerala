"""create_notification_table

Revision ID: e9eba61c8073
Revises: 5a786c0cd83c
Create Date: 2026-01-01 00:13:08.770532

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e9eba61c8073'
down_revision: Union[str, None] = '5a786c0cd83c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tbl_notification',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('role', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('related_entity', sa.String(), nullable=True),
    sa.Column('related_entity_id', sa.UUID(), nullable=True),
    sa.Column('is_read', sa.Boolean(), default=False),
    sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('tbl_notification')

