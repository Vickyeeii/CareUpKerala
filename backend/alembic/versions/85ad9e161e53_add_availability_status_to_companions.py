"""add_availability_status_to_companions

Revision ID: 85ad9e161e53
Revises: f5527405819d
Create Date: 2026-01-01 11:12:22.031882

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '85ad9e161e53'
down_revision: Union[str, None] = 'f5527405819d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('companions', sa.Column('availability_status', sa.String(), nullable=False, server_default='available'))


def downgrade() -> None:
    op.drop_column('companions', 'availability_status')

