# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.db import Base

# 比赛项目数据模型
class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True, comment="项目ID")
    name = Column(String, index=True, comment="项目名称")
    description = Column(Text, comment="项目介绍")

    # 建立与 Match 模型的关联 (一对多)
    matches = relationship("Match", back_populates="game")