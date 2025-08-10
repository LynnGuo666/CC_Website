from pydantic import BaseModel
from typing import List, Optional
import datetime


# Shared properties
class UserBase(BaseModel):
    nickname: str
    display_name: Optional[str] = None
    source: Optional[str] = None


# Properties to receive on user creation
class UserCreate(UserBase):
    pass


# Properties to return to client
class User(UserBase):
    id: int
    total_matches: int = 0
    total_wins: int = 0
    total_points: int = 0
    total_standard_score: float = 0.0
    average_standard_score: float = 0.0
    created_at: datetime.datetime
    last_active: datetime.datetime
    
    # 计算属性
    win_rate: float = 0.0
    average_score: float = 0.0
    game_level: str = 'D'
    level_progress: float = 0.0

    class Config:
        from_attributes = True


# Extended user info with team relationships
class UserWithTeams(User):
    current_team: Optional[str] = None
    historical_teams: List[str] = []


# User statistics for detailed view
class UserStats(BaseModel):
    user: User
    current_team: Optional[dict] = None
    historical_teams: List[dict] = []
    match_history: List[dict] = []
    recent_scores: List[dict] = []
    # 标准分时间线（用于折线图/变化展示）
    score_timeline: List[dict] = []
    # 按游戏的标准分时间线
    score_timeline_by_game: dict = {}
    game_scores: dict = {}  # 按游戏类型统计得分