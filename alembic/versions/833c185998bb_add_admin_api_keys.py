"""add admin api keys

Revision ID: 833c185998bb
Revises: 32ee2c7082fc
Create Date: 2025-11-17 11:48:14.147126
"""
from typing import Sequence, Union
import secrets

from alembic import op
import sqlalchemy as sa
from sqlalchemy import select


# revision identifiers, used by Alembic.
revision: str = '833c185998bb'
down_revision: Union[str, None] = '32ee2c7082fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('admin_users', sa.Column('api_key', sa.String(), nullable=True))
    op.create_index('ix_admin_users_api_key', 'admin_users', ['api_key'], unique=True)

    connection = op.get_bind()
    admin_users = sa.table(
        'admin_users',
        sa.column('id', sa.Integer),
        sa.column('api_key', sa.String),
    )

    result = connection.execute(select(admin_users.c.id)).fetchall()
    for row in result:
        connection.execute(
            sa.update(admin_users)
            .where(admin_users.c.id == row.id)
            .values(api_key=secrets.token_urlsafe(32))
        )

    op.alter_column('admin_users', 'api_key', existing_type=sa.String(), nullable=False)


def downgrade() -> None:
    op.drop_index('ix_admin_users_api_key', table_name='admin_users')
    op.drop_column('admin_users', 'api_key')
