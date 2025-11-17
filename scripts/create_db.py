# Helper script to bootstrap the database using Alembic migrations.
from pathlib import Path

from alembic.config import Config
from alembic import command

from app.core.config import settings


def main():
    print("Running Alembic migrations...")
    alembic_cfg = Config(str(Path(__file__).parent / "alembic.ini"))
    # Ensure Alembic uses the same DB URL as the app config
    alembic_cfg.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)
    command.upgrade(alembic_cfg, "head")
    print("Database is up to date.")


if __name__ == "__main__":
    main()
