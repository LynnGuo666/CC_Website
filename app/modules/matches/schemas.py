# -*- coding: utf-8 -*-
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime
import enum

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
    match_points: int = 0
    
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
    match_points: int = 0
    
    class Config:
        from_attributes = True

# --- 比赛队伍Schema ---

class MatchTeamBase(BaseModel):
    name: str
    color: Optional[str] = None
    external_team_id: Optional[str] = None

class MatchTeamCreate(MatchTeamBase):
    members: Optional[List[TeamMemberCreate]] = None

class MatchTeamUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    external_team_id: Optional[str] = None

class MatchTeam(MatchTeamBase):
    id: int
    match_id: int
    total_score: int = 0
    games_played: int = 0
    team_rank: Optional[int] = None
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
    multiplier: Optional[float] = 1.0

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
    multiplier: float = 1.0
    total_standard_score: float = 0.0
    average_standard_score: float = 0.0
    created_at: datetime
    score_events: Optional[List["ScoreEvent"]] = None
    
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

# --- 细粒度小分事件 ---

class ScoreEventBase(BaseModel):
    match_game_id: int
    match_team_id: int
    event_type: str
    points: int
    match_id: Optional[int] = None
    opponent_team_id: Optional[int] = None
    user_id: Optional[int] = None
    score_id: Optional[int] = None
    raw_points: Optional[int] = None
    multiplier_used: Optional[float] = None
    tournament_stage: Optional[str] = None
    tournament_round_index: Optional[int] = None
    game_round_label: Optional[str] = None
    game_round_index: Optional[int] = None
    area: Optional[str] = None
    event_time: Optional[datetime] = None
    meta: Optional[Dict[str, Any]] = None

class ScoreEventCreate(ScoreEventBase):
    pass

class ScoreEvent(ScoreEventBase):
    id: int
    created_at: datetime
    match_game: Optional["MatchGame"] = None
    team: Optional[MatchTeam] = None
    opponent_team: Optional[MatchTeam] = None
    user: Optional["User"] = None

    class Config:
        from_attributes = True

class MatchGameEventGroup(BaseModel):
    match_game_id: int
    game_id: int
    game_name: str
    game_code: Optional[str] = None
    events: List[ScoreEvent] = []

class MatchEventsResponse(BaseModel):
    match_id: int
    games: List[MatchGameEventGroup] = []

# 处理前向引用
Score.model_rebuild()
MatchGame.model_rebuild()
ScoreEvent.model_rebuild()

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

# --- 视频相关Schema ---

class VideoPlatform(str, enum.Enum):
    BILIBILI = "bilibili"
    YOUTUBE = "youtube"
    TWITCH = "twitch"
    DOUYU = "douyu"
    HUYA = "huya"
    OTHER = "other"

class VideoType(str, enum.Enum):
    LIVESTREAM = "livestream"
    REPLAY = "replay"
    HIGHLIGHT = "highlight"

class MatchVideoBase(BaseModel):
    title: str
    url: str
    platform: VideoPlatform
    video_type: VideoType = VideoType.REPLAY
    is_official: bool = False
    uploader_name: Optional[str] = None
    match_game_id: Optional[int] = None
    user_id: Optional[int] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None
    view_count: Optional[int] = None

class MatchVideoCreate(MatchVideoBase):
    pass

class MatchVideoUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    platform: Optional[VideoPlatform] = None
    video_type: Optional[VideoType] = None
    is_official: Optional[bool] = None
    uploader_name: Optional[str] = None
    match_game_id: Optional[int] = None
    user_id: Optional[int] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    thumbnail_url: Optional[str] = None
    view_count: Optional[int] = None

class MatchVideo(MatchVideoBase):
    id: int
    match_id: int
    view_count: int = 0
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # 关联对象简略信息
    user: Optional[User] = None
    
    class Config:
        from_attributes = True
