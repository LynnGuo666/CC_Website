"""add_site_config_table

Revision ID: 8c441b137e37
Revises: 833c185998bb
Create Date: 2025-11-17 15:59:57.780359
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c441b137e37'
down_revision: Union[str, None] = '833c185998bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'site_config',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('notification_text', sa.String(), nullable=True),
        sa.Column('notification_link', sa.String(), nullable=True),
        sa.Column('handbook_text', sa.String(), nullable=True),
        sa.Column('handbook_url', sa.String(), nullable=True),
        sa.Column('logo_filename', sa.String(), nullable=True),
        sa.Column('site_name', sa.String(), nullable=True),
        sa.Column('site_abbr', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    # 插入默认配置
    op.execute("""
        INSERT INTO site_config (id, notification_text, notification_link, handbook_text, handbook_url, logo_filename, site_name, site_abbr)
        VALUES (1, '欢迎来到W3CC 联合锦标赛！', '/matches', '查看赛事', '/matches', 'scc.png', 'W3CC', 'W3')
    """)


def downgrade() -> None:
    op.drop_table('site_config')
