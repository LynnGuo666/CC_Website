"""add score events table

Revision ID: 32ee2c7082fc
Revises: 829da43c6cf3
Create Date: 2025-11-17 11:04:59.454839
"""
"""add score events table

Revision ID: 32ee2c7082fc
Revises: 829da43c6cf3
Create Date: 2025-11-17 11:07:30.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '32ee2c7082fc'
down_revision: Union[str, None] = '829da43c6cf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'score_events',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False, comment='小分事件ID'),
        sa.Column('match_id', sa.Integer(), sa.ForeignKey('matches.id', ondelete='CASCADE'), nullable=True, comment='关联的比赛ID'),
        sa.Column('match_game_id', sa.Integer(), sa.ForeignKey('match_games.id', ondelete='CASCADE'), nullable=False, comment='关联的赛程ID'),
        sa.Column('match_team_id', sa.Integer(), sa.ForeignKey('match_teams.id', ondelete='CASCADE'), nullable=False, comment='得分队伍ID'),
        sa.Column('opponent_team_id', sa.Integer(), sa.ForeignKey('match_teams.id', ondelete='SET NULL'), nullable=True, comment='对阵队伍ID'),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, comment='得分玩家ID'),
        sa.Column('score_id', sa.Integer(), sa.ForeignKey('scores.id', ondelete='SET NULL'), nullable=True, comment='汇总分记录ID'),
        sa.Column('event_type', sa.String(length=50), nullable=False, comment='事件类型'),
        sa.Column('points', sa.Integer(), nullable=False, comment='事件计分'),
        sa.Column('raw_points', sa.Integer(), nullable=True, comment='倍率前的分数'),
        sa.Column('multiplier_used', sa.Float(), nullable=True, comment='倍率'),
        sa.Column('tournament_stage', sa.String(length=50), nullable=True, comment='锦标赛阶段/轮次标签'),
        sa.Column('tournament_round_index', sa.Integer(), nullable=True, comment='锦标赛轮次序号'),
        sa.Column('game_round_label', sa.String(length=50), nullable=True, comment='小游戏回合标签'),
        sa.Column('game_round_index', sa.Integer(), nullable=True, comment='小游戏回合序号'),
        sa.Column('area', sa.String(length=50), nullable=True, comment='分区/地图/赛道'),
        sa.Column('event_time', sa.DateTime(), nullable=True, comment='事件时间'),
        sa.Column('meta', sa.JSON(), nullable=True, comment='扩展数据'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False, comment='创建时间'),
    )
    op.create_index('ix_score_events_match_game', 'score_events', ['match_game_id'])
    op.create_index('ix_score_events_match_team', 'score_events', ['match_team_id'])
    op.create_index('ix_score_events_opponent_team', 'score_events', ['opponent_team_id'])
    op.create_index('ix_score_events_user', 'score_events', ['user_id'])
    op.create_index('ix_score_events_event_type', 'score_events', ['event_type'])


def downgrade() -> None:
    op.drop_index('ix_score_events_event_type', table_name='score_events')
    op.drop_index('ix_score_events_user', table_name='score_events')
    op.drop_index('ix_score_events_opponent_team', table_name='score_events')
    op.drop_index('ix_score_events_match_team', table_name='score_events')
    op.drop_index('ix_score_events_match_game', table_name='score_events')
    op.drop_table('score_events')
