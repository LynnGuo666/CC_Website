# -*- coding: utf-8 -*-
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.modules.matches.schemas import MatchStatus

# 比赛项目的基础属性
class GameBase(BaseModel):
    name: str
    code: str
    description: str | None = None
    seasonal: bool = False
    season_label: str | None = None
    tagline: str | None = None
    rule: str | None = None
    image_url: str | None = None

# 创建比赛项目时需要接收的属性
class GameCreate(GameBase):
    pass

# 从 API 返回给客户端的比赛项目信息
class Game(GameBase):
    id: int

    class Config:
        from_attributes = True  # 替换过时的orm_mode


class GameMatchBrief(BaseModel):
    """简单的赛事信息，用于标记该游戏被哪些赛事选中"""

    id: int
    name: str
    status: Optional[MatchStatus] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True


class GameDetail(Game):
    selected_matches: List[GameMatchBrief] = []

    class Config:
        from_attributes = True
