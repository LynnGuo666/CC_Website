"""add admin api keys

Revision ID: 833c185998bb
Revises: 32ee2c7082fc
Create Date: 2025-11-17 11:48:14.147126
"""
from typing import Sequence, Union
import secrets

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, select


# revision identifiers, used by Alembic.
revision: str = '833c185998bb'
down_revision: Union[str, None] = '32ee2c7082fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = inspect(connection)

    columns = {column['name']: column for column in inspector.get_columns('admin_users')}
    if 'api_key' not in columns:
        op.add_column('admin_users', sa.Column('api_key', sa.String(), nullable=True))
        # refresh column cache to reflect the newly added column
        inspector = inspect(connection)
        columns = {column['name']: column for column in inspector.get_columns('admin_users')}

    indexes = {index['name'] for index in inspector.get_indexes('admin_users')}
    if 'ix_admin_users_api_key' not in indexes:
        op.create_index('ix_admin_users_api_key', 'admin_users', ['api_key'], unique=True)

    admin_users = sa.table(
        'admin_users',
        sa.column('id', sa.Integer),
        sa.column('api_key', sa.String),
    )

    result = connection.execute(select(admin_users.c.id, admin_users.c.api_key)).fetchall()
    for row in result:
        if not row.api_key:
            connection.execute(
                sa.update(admin_users)
                .where(admin_users.c.id == row.id)
                .values(api_key=secrets.token_urlsafe(32))
            )

    api_key_nullable = columns.get('api_key', {}).get('nullable', True)
    if api_key_nullable:
        with op.batch_alter_table('admin_users') as batch_op:
            batch_op.alter_column('api_key', existing_type=sa.String(), nullable=False)


def downgrade() -> None:
    connection = op.get_bind()
    inspector = inspect(connection)

    indexes = {index['name'] for index in inspector.get_indexes('admin_users')}
    if 'ix_admin_users_api_key' in indexes:
        op.drop_index('ix_admin_users_api_key', table_name='admin_users')

    columns = {column['name'] for column in inspector.get_columns('admin_users')}
    if 'api_key' in columns:
        op.drop_column('admin_users', 'api_key')
