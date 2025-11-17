"""add_performance_indexes_for_tournament_scoring

Revision ID: 97aa04b4c7b7
Revises: 8c441b137e37
Create Date: 2025-11-17 17:42:53.639251
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '97aa04b4c7b7'
down_revision: Union[str, None] = '8c441b137e37'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 为 scores 表添加复合索引，优化排行榜查询
    op.create_index(
        'idx_scores_match_game_user',
        'scores',
        ['match_game_id', 'user_id'],
        unique=False
    )

    op.create_index(
        'idx_scores_user_standard',
        'scores',
        ['user_id', 'standard_score'],
        unique=False
    )

    op.create_index(
        'idx_scores_match_team',
        'scores',
        ['match_team_id', 'points'],
        unique=False
    )

    # 为 match_games 表添加索引，优化关联查询
    op.create_index(
        'idx_match_games_match_id',
        'match_games',
        ['match_id'],
        unique=False
    )

    # 为 match_team_memberships 表添加索引，优化队伍成员查询
    op.create_index(
        'idx_match_team_memberships_user',
        'match_team_memberships',
        ['user_id', 'match_team_id'],
        unique=False
    )


def downgrade() -> None:
    # 删除索引
    op.drop_index('idx_match_team_memberships_user', table_name='match_team_memberships')
    op.drop_index('idx_match_games_match_id', table_name='match_games')
    op.drop_index('idx_scores_match_team', table_name='scores')
    op.drop_index('idx_scores_user_standard', table_name='scores')
    op.drop_index('idx_scores_match_game_user', table_name='scores')
