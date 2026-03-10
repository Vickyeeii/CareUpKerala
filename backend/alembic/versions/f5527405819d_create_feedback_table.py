"""create_feedback_table

Revision ID: f5527405819d
Revises: 0a9c917eb77d
Create Date: 2026-01-01 09:27:17.988386

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f5527405819d'
down_revision: Union[str, None] = '0a9c917eb77d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tbl_feedback',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('booking_id', sa.UUID(), nullable=False),
    sa.Column('nri_user_id', sa.UUID(), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('comment', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
    sa.ForeignKeyConstraint(['booking_id'], ['tbl_booking.id']),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('booking_id')
    )


def downgrade() -> None:
    op.drop_table('tbl_feedback')

