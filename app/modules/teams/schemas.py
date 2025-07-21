# -*- coding: utf-8 -*-
from pydantic import BaseModel, Field
import datetime
from typing import List, Optional

# --- 用于嵌套显示的简化模型 ---

class UserInfo(BaseModel):
    """简化的User模型，用于在其他模型中嵌套显示"""
    id: int
    nickname: str
    display_name: Optional[str] = None
    total_points: int = 0
    win_rate: float = 0.0

    class Config:
        orm_mode = True

class TeamInfo(BaseModel):
    """一个简化的Team模型，不包含成员列表以避免循环引用或序列化问题"""
    id: int
    name: str
    color: Optional[str] = None

    class Config:
        orm_mode = True

# --- 队伍成员关系相关的模型 ---

class TeamMembershipBase(BaseModel):
    user_id: int
    team_id: int
    join_date: Optional[datetime.datetime] = None
    leave_date: Optional[datetime.datetime] = None

class TeamMembershipCreate(BaseModel):
    user_id: int
    team_id: int

class TeamMembership(TeamMembershipBase):
    user: UserInfo  # 嵌套返回用户信息

    class Config:
        orm_mode = True

# --- 队伍相关的完整模型 ---

class TeamBase(BaseModel):
    name: str
    color: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int

    class Config:
        orm_mode = True

# --- 带成员信息的队伍模型 ---

class TeamWithMembers(Team):
    """包含成员列表的队伍模型"""
    current_members: List[UserInfo] = []
    historical_members: List[UserInfo] = []
    total_members: int = 0

class TeamStats(BaseModel):
    """队伍统计信息"""
    team: Team
    total_matches: int = 0
    total_wins: int = 0
    total_points: int = 0
    win_rate: float = 0.0
    average_score_per_match: float = 0.0
    current_members: List[UserInfo] = []
    historical_members: List[UserInfo] = []
    recent_matches: List[dict] = []