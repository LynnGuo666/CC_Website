"""extend games with rich details

Revision ID: 9d9c3d8f6c1a
Revises: 8b4e9f0a1c2d
Create Date: 2025-01-09 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d9c3d8f6c1a'
down_revision: Union[str, None] = '8b4e9f0a1c2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('games', sa.Column('tagline', sa.String(length=255), nullable=True, comment="短介绍/一句话概述"))
    op.add_column('games', sa.Column('rule', sa.Text(), nullable=True, comment="规则说明，支持 Markdown"))
    op.add_column('games', sa.Column('image_url', sa.String(length=512), nullable=True, comment="封面图 URL"))
    op.add_column('games', sa.Column('season_label', sa.String(length=50), nullable=True, comment="季节标签，例如夏日限定"))


def downgrade() -> None:
    op.drop_column('games', 'season_label')
    op.drop_column('games', 'image_url')
    op.drop_column('games', 'rule')
    op.drop_column('games', 'tagline')
