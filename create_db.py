# This script initializes the database by creating all necessary tables.

from app.core.db import Base, engine
from app.modules.users.models import User  # Import all models here
from app.modules.games.models import Game
from app.modules.matches.models import (
    Match, MatchTeam, MatchTeamMembership, 
    MatchGame, GameLineup, Score
)

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")
print("\nNew team system is ready!")
print("- MatchTeam: 比赛专属队伍")
print("- MatchTeamMembership: 队员关系管理") 
print("- GameLineup: 每个游戏的出战阵容")
print("- 支持替补机制和多队伍参与")