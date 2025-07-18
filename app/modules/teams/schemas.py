# -*- coding: utf-8 -*-
from pydantic import BaseModel, Field
import datetime
from app.modules.users.schemas import User

# --- 用于嵌套显示的简化模型 ---

class UserInfo(User):
    """一个简化的User模型，用于在其他模型中嵌套显示"""
    pass

class TeamInfo(BaseModel):
    """一个简化的Team模型，不包含成员列表以避免循环引用或序列化问题"""
    id: int
    name: str
    color: str | None = None
    team_number: int

    class Config:
        orm_mode = True

# --- 队伍相关的完整模型 ---

class TeamBase(BaseModel):
    name: str
    color: str | None = None
    team_number: int

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int
    # members: list[UserInfo] = []  # 移除此字段以避免序列化问题

    class Config:
        orm_mode = True

# --- 队伍成员关系相关的模型 ---

class TeamMembershipBase(BaseModel):
    user_id: int
    team_id: int
    join_date: datetime.datetime | None = None
    leave_date: datetime.datetime | None = None

class TeamMembershipCreate(TeamMembershipBase):
    pass

class TeamMembership(TeamMembershipBase):
    user: UserInfo # 嵌套返回用户信息

    class Config:
        orm_mode = True