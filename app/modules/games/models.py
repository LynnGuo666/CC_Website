# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship

from app.core.db import Base

# 比赛项目数据模型
class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True, comment="项目ID")
    name = Column(String, index=True, comment="项目名称")
    code = Column(String, unique=True, index=True, comment="项目英文代码，用于统一识别相同游戏")
    description = Column(Text, comment="项目介绍")
    seasonal = Column(Boolean, default=False, server_default="0", comment="是否季节/活动限定")
    season_label = Column(String(50), nullable=True, comment="季节标签，例如夏日/冬日限定")
    tagline = Column(String(255), nullable=True, comment="一句话简介")
    rule = Column(Text, nullable=True, comment="规则说明，支持 Markdown")
    image_url = Column(String(512), nullable=True, comment="封面图链接")

    # 建立与 MatchGame 模型的关联，表示一个项目可以出现在多个赛程中
    match_games = relationship("MatchGame", back_populates="game")
