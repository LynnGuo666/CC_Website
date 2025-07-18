# -*- coding: utf-8 -*-
from pydantic import BaseModel, Field
import datetime
from typing import List, Any, Dict, Optional
from app.modules.users.schemas import User
from app.modules.teams.schemas import Team, TeamInfo # 导入新的 TeamInfo
from app.modules.games.schemas import Game as GameSchema

# --- 分数相关的 Schemas ---

class ScoreBase(BaseModel):
    points: int
    user_id: int
    team_id: int

class ScoreCreate(ScoreBase):
    pass

class Score(ScoreBase):
    id: int
    user: User
    team: TeamInfo # <--- 使用简化的 TeamInfo

    class Config:
        orm_mode = True

# --- 赛程相关的 Schemas ---

class MatchGameBase(BaseModel):
    game_id: int
    structure_type: str
    structure_details: Dict[str, Any]

class MatchGameCreate(MatchGameBase):
    pass

class MatchGame(MatchGameBase):
    id: int
    game: GameSchema
    scores: List[Score] = []

    class Config:
        orm_mode = True

# --- 比赛相关的 Schemas ---

class MatchBase(BaseModel):
    name: str
    start_time: datetime.datetime | None = None
    end_time: datetime.datetime | None = None
    winning_team_id: int | None = None

class MatchCreate(MatchBase):
    """用于创建一场新比赛，支持一次性定义所有赛程，方便历史数据导入"""
    participant_team_ids: list[int] = []
    match_games: Optional[List[MatchGameCreate]] = None

class Match(MatchBase):
    id: int
    participants: list[Team] = []
    match_games: List[MatchGame] = []

    class Config:
        orm_mode = True