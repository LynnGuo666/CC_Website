# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.db import Base

# 比赛项目数据模型
class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True, comment="项目ID")
    name = Column(String, index=True, comment="项目名称")
    code = Column(String, unique=True, index=True, comment="项目英文代码，用于统一识别相同游戏")
    description = Column(Text, comment="项目介绍")

    # 建立与 MatchGame 模型的关联，表示一个项目可以出现在多个赛程中
    match_games = relationship("MatchGame", back_populates="game")