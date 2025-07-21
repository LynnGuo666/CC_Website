# -*- coding: utf-8 -*-
from pydantic import BaseModel, Field
import datetime
from typing import List, Any, Dict, Optional
from enum import Enum
from app.modules.users.schemas import User
from app.modules.teams.schemas import Team, TeamInfo
from app.modules.games.schemas import Game as GameSchema

# 比赛状态枚举
class MatchStatus(str, Enum):
    PREPARING = "preparing"      # 筹办中
    ONGOING = "ongoing"          # 进行中
    FINISHED = "finished"        # 已结束
    CANCELLED = "cancelled"      # 已取消

# --- 分数相关的 Schemas ---

class ScoreBase(BaseModel):
    points: int
    user_id: int
    team_id: int

class ScoreCreate(ScoreBase):
    event_data: Optional[Dict[str, Any]] = None

class Score(ScoreBase):
    id: int
    user: User
    team: TeamInfo
    event_data: Optional[Dict[str, Any]] = None
    recorded_at: datetime.datetime

    class Config:
        orm_mode = True

# --- 赛程相关的 Schemas ---

class MatchGameBase(BaseModel):
    game_id: int
    structure_type: str
    structure_details: Dict[str, Any]

class MatchGameCreate(MatchGameBase):
    game_order: Optional[int] = 1

class MatchGame(MatchGameBase):
    id: int
    match_id: int
    game_order: int
    game: GameSchema
    scores: List[Score] = []
    is_live: bool = False
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# --- 比赛相关的 Schemas ---

class MatchBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    status: Optional[MatchStatus] = MatchStatus.PREPARING
    prize_pool: Optional[str] = None
    max_teams: Optional[int] = None

class MatchCreate(MatchBase):
    """用于创建一场新比赛，支持一次性定义所有赛程，方便历史数据导入"""
    participant_team_ids: List[int] = []
    match_games: Optional[List[MatchGameCreate]] = None

class MatchUpdate(BaseModel):
    """用于更新比赛信息"""
    name: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    status: Optional[MatchStatus] = None
    winning_team_id: Optional[int] = None
    prize_pool: Optional[str] = None
    max_teams: Optional[int] = None

class Match(MatchBase):
    id: int
    participants: List[Team] = []
    match_games: List[MatchGame] = []
    winning_team_id: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    # 计算属性
    can_start_live: bool = False
    is_archived: bool = False

    class Config:
        orm_mode = True

# --- 统计相关的 Schemas ---

class PlayerMatchStats(BaseModel):
    """玩家在特定比赛中的统计"""
    match_id: int
    match_name: str
    total_points: int
    games_played: int
    team_name: Optional[str] = None

class PlayerStats(BaseModel):
    """玩家总体统计"""
    user_id: int
    nickname: str
    total_matches: int
    total_wins: int
    total_points: int
    win_rate: float
    average_score: float
    current_team: Optional[str] = None
    match_history: List[PlayerMatchStats] = []