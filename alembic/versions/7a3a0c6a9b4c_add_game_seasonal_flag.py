"""add seasonal flag to games

Revision ID: 7a3a0c6a9b4c
Revises: 6c4d5c5d5f12
Create Date: 2025-11-16 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a3a0c6a9b4c'
down_revision: Union[str, None] = '6c4d5c5d5f12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('games', sa.Column('seasonal', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column('games', 'seasonal')
