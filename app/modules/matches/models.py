# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
import datetime
import enum

from app.core.db import Base

# 比赛状态枚举
class MatchStatus(enum.Enum):
    PREPARING = "preparing"      # 筹办中
    ONGOING = "ongoing"          # 进行中
    FINISHED = "finished"        # 已结束
    CANCELLED = "cancelled"      # 已取消

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
    description = Column(String, nullable=True, comment="比赛描述")
    start_time = Column(DateTime, nullable=True, comment="比赛开始时间")
    end_time = Column(DateTime, nullable=True, comment="比赛结束时间")
    status = Column(Enum(MatchStatus), default=MatchStatus.PREPARING, comment="比赛状态")
    
    # 只需要总决赛冠军，积分冠军由积分榜自动计算
    winning_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, comment="总决赛冠军队伍ID")
    
    # 赛事相关配置
    prize_pool = Column(String, nullable=True, comment="奖金池")
    max_teams = Column(Integer, nullable=True, comment="最大参赛队伍数")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, comment="更新时间")

    # 关联到冠军队伍
    winning_team = relationship("Team", foreign_keys=[winning_team_id])
    # 关联到所有参赛队伍 (多对多)
    participants = relationship("Team", secondary=match_participants)
    # 关联到本场比赛的所有赛程
    match_games = relationship("MatchGame", back_populates="match", cascade="all, delete-orphan")

    @property
    def can_start_live(self) -> bool:
        """判断是否可以开启直播模式"""
        return self.status == MatchStatus.ONGOING

    @property
    def is_archived(self) -> bool:
        """判断比赛是否已归档"""
        return self.status in [MatchStatus.FINISHED, MatchStatus.CANCELLED]

# 赛程数据模型 (核心) - MC小游戏
class MatchGame(Base):
    __tablename__ = "match_games"

    id = Column(Integer, primary_key=True, index=True, comment="赛程ID")
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False, comment="关联的比赛ID")
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False, comment="关联的项目ID")
    
    # 赛程信息
    game_order = Column(Integer, default=1, comment="比赛顺序")
    structure_type = Column(String, comment="对战结构类型 (例如：个人赛、团队赛、淘汰赛)")
    structure_details = Column(JSON, comment="对战结构详情 (例如：分组信息、规则)")
    
    # 赛程状态
    is_live = Column(String, default=False, comment="是否正在直播")
    start_time = Column(DateTime, nullable=True, comment="赛程开始时间")
    end_time = Column(DateTime, nullable=True, comment="赛程结束时间")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="创建时间")
    
    # 关联到比赛和项目
    match = relationship("Match", back_populates="match_games")
    game = relationship("Game")
    # 关联到本赛程的所有得分记录
    scores = relationship("Score", back_populates="match_game", cascade="all, delete-orphan")

# 分数数据模型
class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True, comment="分数记录ID")
    points = Column(Integer, comment="得分")
    
    user_id = Column(Integer, ForeignKey("users.id"), comment="得分用户ID")
    team_id = Column(Integer, ForeignKey("teams.id"), comment="得分队伍ID")
    match_game_id = Column(Integer, ForeignKey("match_games.id"), comment="关联的赛程ID")
    
    # 额外数据
    event_data = Column(JSON, nullable=True, comment="事件详细数据")
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, comment="记录时间")

    # 关联到用户、队伍和赛程
    user = relationship("User")
    team = relationship("Team")
    match_game = relationship("MatchGame", back_populates="scores")