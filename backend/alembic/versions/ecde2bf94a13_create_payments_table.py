"""Create payments table

Revision ID: ecde2bf94a13
Revises: 5460c207ad98
Create Date: 2025-12-31 22:31:29.248139

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'ecde2bf94a13'
down_revision: Union[str, None] = '5460c207ad98'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tbl_payment',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('booking_id', sa.UUID(), nullable=False),
    sa.Column('amount', sa.Numeric(), nullable=False),
    sa.Column('currency', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('payment_method', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['booking_id'], ['tbl_booking.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('booking_id')
    )


def downgrade() -> None:
    op.drop_table('tbl_payment')

