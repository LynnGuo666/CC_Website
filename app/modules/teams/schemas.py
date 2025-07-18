# -*- coding: utf-8 -*-
from pydantic import BaseModel
import datetime
from app.modules.users.schemas import User  # 复用 User schema

# 队伍的基础属性
class TeamBase(BaseModel):
    name: str
    color: str | None = None
    team_number: int

# 创建队伍时需要接收的属性
class TeamCreate(TeamBase):
    pass

# 从 API 返回给客户端的队伍信息
class Team(TeamBase):
    id: int
    members: list[User] = []  # 返回队伍信息时，也一并返回成员列表

    class Config:
        orm_mode = True # 允许从 ORM 模型直接转换

# 队伍成员关系的基础属性
class TeamMembershipBase(BaseModel):
    user_id: int
    team_id: int
    join_date: datetime.datetime | None = None
    leave_date: datetime.datetime | None = None

# 创建成员关系时需要的数据
class TeamMembershipCreate(TeamMembershipBase):
    pass

# 从 API 返回的成员关系信息
class TeamMembership(TeamMembershipBase):
    class Config:
        orm_mode = True