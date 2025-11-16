"""add match_game standard score totals

Revision ID: 6c4d5c5d5f12
Revises: 4e5c829ddded
Create Date: 2025-11-16 05:06:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6c4d5c5d5f12'
down_revision: Union[str, None] = '4e5c829ddded'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('match_games', sa.Column('total_standard_score', sa.Float(), nullable=False, server_default='0'))
    op.add_column('match_games', sa.Column('average_standard_score', sa.Float(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('match_games', 'average_standard_score')
    op.drop_column('match_games', 'total_standard_score')
