# -*- coding: utf-8 -*-
from pydantic import BaseModel
import datetime
from app.modules.users.schemas import User
from app.modules.teams.schemas import Team
from app.modules.games.schemas import Game

# --- 分数相关的 Schemas ---

# 分数的基础属性
class ScoreBase(BaseModel):
    points: int
    user_id: int

# 创建分数记录时需要接收的属性
class ScoreCreate(ScoreBase):
    pass

# 从 API 返回给客户端的分数信息
class Score(ScoreBase):
    id: int
    user: User # 关联返回用户信息

    class Config:
        orm_mode = True

# --- 比赛相关的 Schemas ---

# 比赛的基础属性
class MatchBase(BaseModel):
    match_type: str
    game_id: int
    start_time: datetime.datetime | None = None
    end_time: datetime.datetime | None = None
    winning_team_id: int | None = None

# 创建比赛时需要接收的属性
class MatchCreate(MatchBase):
    participant_team_ids: list[int] = [] # 接收一个参赛队伍ID的列表

# 从 API 返回给客户端的比赛信息
class Match(MatchBase):
    id: int
    game: Game # 关联返回比赛项目信息
    participants: list[Team] = [] # 关联返回参赛队伍列表
    scores: list[Score] = [] # 关联返回得分记录列表

    class Config:
        orm_mode = True