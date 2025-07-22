# -*- coding: utf-8 -*-
from pydantic import BaseModel

# 比赛项目的基础属性
class GameBase(BaseModel):
    name: str
    description: str | None = None

# 创建比赛项目时需要接收的属性
class GameCreate(GameBase):
    pass

# 从 API 返回给客户端的比赛项目信息
class Game(GameBase):
    id: int

    class Config:
        from_attributes = True  # 替换过时的orm_mode