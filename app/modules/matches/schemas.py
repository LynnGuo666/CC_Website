# -*- coding: utf-8 -*-
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime
import enum

if TYPE_CHECKING:
    from app.modules.users.schemas import User

# 比赛状态枚举
class MatchStatus(str, enum.Enum):
    PREPARING = "preparing"
    ONGOING = "ongoing"
    FINISHED = "finished"
    CANCELLED = "cancelled"

# 队员角色枚举
class MemberRole(str, enum.Enum):
    MAIN = "main"
    SUBSTITUTE = "substitute"
    CAPTAIN = "captain"

# --- 基础Schema ---

class ScoreBase(BaseModel):
    points: int
    user_id: int
    team_id: int  # 对应数据库中的match_team_id字段
    event_data: Optional[Dict[str, Any]] = None

class ScoreCreate(ScoreBase):
    pass

class Score(ScoreBase):
    id: int
    match_game_id: int
    standard_score: Optional[float] = None
    recorded_at: datetime
    
    class Config:
        from_attributes = True

# --- 队员相关Schema ---

class TeamMemberBase(BaseModel):
    user_id: int
    role: Optional[str] = "main"

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMember(TeamMemberBase):
    id: int
    joined_at: datetime
    
    class Config:
        from_attributes = True

# --- 比赛队伍成员Schema ---

class MatchTeamMembershipBase(BaseModel):
    user_id: int
    role: Optional[str] = "main"

class MatchTeamMembershipCreate(MatchTeamMembershipBase):
    pass

class MatchTeamMembershipSchema(MatchTeamMembershipBase):
    id: int
    match_team_id: int
    joined_at: datetime
    
    class Config:
        from_attributes = True

# --- 比赛队伍Schema ---

class MatchTeamBase(BaseModel):
    name: str
    color: Optional[str] = None

class MatchTeamCreate(MatchTeamBase):
    members: Optional[List[TeamMemberCreate]] = None

class MatchTeamUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class MatchTeam(MatchTeamBase):
    id: int
    match_id: int
    total_score: int = 0
    games_played: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

# 包含比赛信息的队伍详情Schema
class MatchTeamWithMatch(MatchTeam):
    match_name: str
    match_status: MatchStatus
    
    class Config:
        from_attributes = True

# --- 游戏阵容Schema ---

class GameLineupBase(BaseModel):
    user_id: int
    is_starting: bool = True
    substitute_reason: Optional[str] = None

class GameLineupCreate(GameLineupBase):
    pass

class GameLineup(GameLineupBase):
    id: int
    match_game_id: int
    match_team_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- 赛程Schema ---

class MatchGameBase(BaseModel):
    game_id: int
    game_order: Optional[int] = 1
    structure_type: Optional[str] = None
    structure_details: Optional[Dict[str, Any]] = None

class MatchGameCreate(MatchGameBase):
    pass

class MatchGameUpdate(BaseModel):
    structure_type: Optional[str] = None
    structure_details: Optional[Dict[str, Any]] = None
    is_live: Optional[bool] = None

class MatchGame(MatchGameBase):
    id: int
    match_id: int
    is_live: bool = False
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- 比赛Schema ---

class MatchBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[MatchStatus] = MatchStatus.PREPARING
    prize_pool: Optional[str] = None
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = 4
    allow_substitutes: Optional[bool] = True
    winning_team_id: Optional[int] = None

class MatchCreate(MatchBase):
    match_games: Optional[List[MatchGameCreate]] = None

class MatchUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[MatchStatus] = None
    prize_pool: Optional[str] = None
    max_teams: Optional[int] = None
    max_players_per_team: Optional[int] = None
    allow_substitutes: Optional[bool] = None
    winning_team_id: Optional[int] = None

class Match(MatchBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MatchList(MatchBase):
    """Simple match schema for list endpoints without relationships"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- 特殊操作Schema ---

class LineupSetting(BaseModel):
    """设置阵容的Schema"""
    team_lineups: Dict[int, List[int]]  # team_id -> [user_id, user_id, ...]
    substitute_info: Optional[Dict[str, str]] = None  # user_id -> reason

class BatchTeamCreate(BaseModel):
    """批量创建队伍的Schema"""
    teams: List[MatchTeamCreate]

class MemberRoleUpdate(BaseModel):
    """更新队员角色的Schema"""
    role: str  # "main" | "substitute" | "captain"

# --- 兼容性Schema ---

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