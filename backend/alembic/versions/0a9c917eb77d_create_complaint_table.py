"""create_complaint_table

Revision ID: 0a9c917eb77d
Revises: e9eba61c8073
Create Date: 2026-01-01 09:10:52.537456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0a9c917eb77d'
down_revision: Union[str, None] = 'e9eba61c8073'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tbl_complaint',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('booking_id', sa.UUID(), nullable=False),
    sa.Column('nri_user_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('status', sa.String(), nullable=False, server_default='open'),
    sa.Column('admin_response', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
    sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
    sa.ForeignKeyConstraint(['booking_id'], ['tbl_booking.id']),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('tbl_complaint')

