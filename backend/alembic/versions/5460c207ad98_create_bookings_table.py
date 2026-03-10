"""Create bookings table

Revision ID: 5460c207ad98
Revises: ed2c0785dec5
Create Date: 2025-12-31 21:18:35.362036

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5460c207ad98'
down_revision: Union[str, None] = 'ed2c0785dec5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tbl_booking',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('nri_id', sa.UUID(), nullable=False),
    sa.Column('hospital_id', sa.UUID(), nullable=False),
    sa.Column('service_id', sa.UUID(), nullable=False),
    sa.Column('pricing_id', sa.UUID(), nullable=False),
    sa.Column('companion_id', sa.UUID(), nullable=True),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('scheduled_date', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['companion_id'], ['companions.id'], ),
    sa.ForeignKeyConstraint(['hospital_id'], ['tbl_hospital.id'], ),
    sa.ForeignKeyConstraint(['nri_id'], ['nri_users.id'], ),
    sa.ForeignKeyConstraint(['pricing_id'], ['tbl_service_pricing.id'], ),
    sa.ForeignKeyConstraint(['service_id'], ['tbl_service.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('tbl_booking')

