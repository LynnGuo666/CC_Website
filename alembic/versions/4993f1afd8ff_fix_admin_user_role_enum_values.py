"""fix_admin_user_role_enum_values

Revision ID: 4993f1afd8ff
Revises: 3a94a9b57ea1
Create Date: 2025-11-23 15:16:22.037536
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4993f1afd8ff'
down_revision: Union[str, None] = '3a94a9b57ea1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    修复 admin_users 表中的 role 枚举值
    将大写的枚举名称（ADMIN, EDITOR, VIEWER）转换为小写的枚举值（admin, editor, viewer）
    """
    # 使用原始 SQL 更新枚举值
    op.execute("""
        UPDATE admin_users
        SET role = 'admin'
        WHERE role = 'ADMIN'
    """)

    op.execute("""
        UPDATE admin_users
        SET role = 'editor'
        WHERE role = 'EDITOR'
    """)

    op.execute("""
        UPDATE admin_users
        SET role = 'viewer'
        WHERE role = 'VIEWER'
    """)


def downgrade() -> None:
    """
    回滚：将小写的枚举值转换回大写的枚举名称
    """
    op.execute("""
        UPDATE admin_users
        SET role = 'ADMIN'
        WHERE role = 'admin'
    """)

    op.execute("""
        UPDATE admin_users
        SET role = 'EDITOR'
        WHERE role = 'editor'
    """)

    op.execute("""
        UPDATE admin_users
        SET role = 'VIEWER'
        WHERE role = 'viewer'
    """)
