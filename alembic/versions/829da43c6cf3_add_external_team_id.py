"""add external team id

Revision ID: 829da43c6cf3
Revises: 9d9c3d8f6c1a
Create Date: 2025-11-17 10:56:33.800099
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '829da43c6cf3'
down_revision: Union[str, None] = '9d9c3d8f6c1a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('match_teams', sa.Column('external_team_id', sa.String(length=64), nullable=True, comment='外部系统队伍ID'))
    op.create_index('ix_match_teams_external_team_id', 'match_teams', ['external_team_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_match_teams_external_team_id', table_name='match_teams')
    op.drop_column('match_teams', 'external_team_id')
