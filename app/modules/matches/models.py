# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, JSON
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
    name = Column(String, index=True, comment="比赛名称 (例如：第一届XX杯)")
    start_time = Column(DateTime, default=datetime.datetime.utcnow, comment="比赛开始时间")
    end_time = Column(DateTime, nullable=True, comment="比赛结束时间")
    winning_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, comment="总冠军队伍ID")

    # 关联到获胜队伍
    winning_team = relationship("Team")
    # 关联到所有参赛队伍 (多对多)
    participants = relationship("Team", secondary=match_participants)
    # 关联到本场比赛的所有赛程
    match_games = relationship("MatchGame", back_populates="match")

# 赛程数据模型 (核心)
class MatchGame(Base):
    __tablename__ = "match_games"

    id = Column(Integer, primary_key=True, index=True, comment="赛程ID")
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False, comment="关联的比赛ID")
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False, comment="关联的项目ID")
    
    structure_type = Column(String, comment="对战结构类型 (例如：分组、混战)")
    structure_details = Column(JSON, comment="对战结构详情 (例如：分组信息)")

    # 关联到比赛和项目
    match = relationship("Match", back_populates="match_games")
    game = relationship("Game")
    # 关联到本赛程的所有得分记录
    scores = relationship("Score", back_populates="match_game")

# 分数数据模型
class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True, comment="分数记录ID")
    points = Column(Integer, comment="得分")
    
    user_id = Column(Integer, ForeignKey("users.id"), comment="得分用户ID")
    team_id = Column(Integer, ForeignKey("teams.id"), comment="得分队伍ID")
    match_game_id = Column(Integer, ForeignKey("match_games.id"), comment="关联的赛程ID")

    # 关联到用户、队伍和赛程
    user = relationship("User")
    team = relationship("Team")
    match_game = relationship("MatchGame", back_populates="scores")