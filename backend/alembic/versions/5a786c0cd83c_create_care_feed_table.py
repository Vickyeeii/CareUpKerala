"""Create care feed table

Revision ID: 5a786c0cd83c
Revises: ecde2bf94a13
Create Date: 2025-12-31 23:02:03.179886

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5a786c0cd83c'
down_revision: Union[str, None] = 'ecde2bf94a13'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tbl_care_feed',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('booking_id', sa.UUID(), nullable=False),
    sa.Column('companion_id', sa.UUID(), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['booking_id'], ['tbl_booking.id'], ),
    sa.ForeignKeyConstraint(['companion_id'], ['companions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('tbl_care_feed')

