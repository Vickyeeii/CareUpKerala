"""create_admin_action_log_table

Revision ID: 5e16780d705f
Revises: 85ad9e161e53
Create Date: 2026-01-01 11:29:55.932914

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5e16780d705f'
down_revision: Union[str, None] = '85ad9e161e53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('tbl_admin_action_log',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('admin_id', sa.UUID(), nullable=False),
    sa.Column('action_type', sa.String(), nullable=False),
    sa.Column('entity_type', sa.String(), nullable=False),
    sa.Column('entity_id', sa.UUID(), nullable=True),
    sa.Column('description', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('tbl_admin_action_log')

