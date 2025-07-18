# This script initializes the database by creating all necessary tables.

from app.core.db import Base, engine
from app.modules.users.models import User  # Import all models here
from app.modules.teams.models import Team, TeamMembership
from app.modules.games.models import Game
from app.modules.matches.models import Match, Score

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")