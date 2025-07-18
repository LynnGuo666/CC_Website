# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
import datetime

from app.core.db import Base

# 比赛与队伍的多对多关联表
match_participants = Table(
    "match_participants",
    Base.metadata,
    Column("match_id", Integer, ForeignKey("matches.id"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id"), primary_key=True),
)

# 比赛数据模型
class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True, comment="比赛ID")
    match_type = Column(String, comment="比赛类型（如锦标赛、挑战赛）")
    start_time = Column(DateTime, default=datetime.datetime.utcnow, comment="比赛开始时间")
    end_time = Column(DateTime, nullable=True, comment="比赛结束时间")
    
    game_id = Column(Integer, ForeignKey("games.id"), comment="关联的比赛项目ID")
    winning_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, comment="获胜队伍ID")

    # 关联到比赛项目
    game = relationship("Game", back_populates="matches")
    # 关联到获胜队伍
    winning_team = relationship("Team")
    # 关联到所有参赛队伍 (多对多)
    participants = relationship("Team", secondary=match_participants)
    # 关联到本场比赛的所有得分记录
    scores = relationship("Score", back_populates="match")

# 分数数据模型
class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True, comment="分数记录ID")
    points = Column(Integer, comment="得分")
    
    user_id = Column(Integer, ForeignKey("users.id"), comment="得分用户ID")
    match_id = Column(Integer, ForeignKey("matches.id"), comment="关联的比赛ID")

    # 关联到用户和比赛
    user = relationship("User")
    match = relationship("Match", back_populates="scores")