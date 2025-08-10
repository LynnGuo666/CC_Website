
# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Enum, Boolean, Float
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

# 队员角色枚举
class MemberRole(enum.Enum):
    MAIN = "main"              # 主力队员
    SUBSTITUTE = "substitute"   # 替补队员
    CAPTAIN = "captain"        # 队长

# 比赛数据模型
class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True, comment="比赛ID")
    name = Column(String, index=True, comment="比赛名称 (例如：第一届XX杯)")
    description = Column(String, nullable=True, comment="比赛描述")
    start_time = Column(DateTime, nullable=True, comment="比赛开始时间")
    end_time = Column(DateTime, nullable=True, comment="比赛结束时间")
    status = Column(Enum(MatchStatus), default=MatchStatus.PREPARING, comment="比赛状态")
    
    # 赛事相关配置
    prize_pool = Column(String, nullable=True, comment="奖金池")
    max_teams = Column(Integer, nullable=True, comment="最大参赛队伍数")
    max_players_per_team = Column(Integer, default=4, comment="每队最大人数")
    allow_substitutes = Column(Boolean, default=True, comment="是否允许替补")
    
    # 比赛结果
    winning_team_id = Column(Integer, ForeignKey("match_teams.id"), nullable=True, comment="冠军队伍ID")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, comment="更新时间")

    # 关联关系
    teams = relationship("MatchTeam", back_populates="match", cascade="all, delete-orphan", lazy="select", foreign_keys="MatchTeam.match_id")
    match_games = relationship("MatchGame", back_populates="match", cascade="all, delete-orphan", lazy="select")
    winning_team = relationship("MatchTeam", foreign_keys=[winning_team_id], lazy="select")

    @property
    def can_start_live(self) -> bool:
        """判断是否可以开启直播模式"""
        return self.status == MatchStatus.ONGOING

    @property
    def is_archived(self) -> bool:
        """判断比赛是否已归档"""
        return self.status in [MatchStatus.FINISHED, MatchStatus.CANCELLED]

    @property
    def participants(self):
        """兼容性属性 - 获取参赛队伍"""
        return self.teams

# 比赛专属队伍模型
class MatchTeam(Base):
    __tablename__ = "match_teams"

    id = Column(Integer, primary_key=True, index=True, comment="比赛队伍ID")
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False, comment="关联的比赛ID")
    name = Column(String, nullable=False, comment="队伍名称")
    color = Column(String, comment="队伍颜色")
    
    # 队伍统计
    total_score = Column(Integer, default=0, comment="队伍总积分")
    games_played = Column(Integer, default=0, comment="已参与游戏数")
    team_rank = Column(Integer, nullable=True, comment="队伍排名")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="创建时间")
    
    # 关联关系
    match = relationship("Match", back_populates="teams", lazy="select", foreign_keys=[match_id])
    memberships = relationship("MatchTeamMembership", back_populates="team", cascade="all, delete-orphan", lazy="select")
    lineups = relationship("GameLineup", back_populates="team", cascade="all, delete-orphan", lazy="select")
    scores = relationship("Score", back_populates="team", lazy="select")

    @property
    def is_champion(self) -> bool:
        """判断该队伍是否是所在比赛的冠军"""
        if not self.match:
            return False
        return self.match.winning_team_id == self.id

    @property
    def main_players(self):
        """获取主力队员"""
        return [m.user for m in self.memberships if m.role == MemberRole.MAIN]
    
    @property 
    def substitute_players(self):
        """获取替补队员"""
        return [m.user for m in self.memberships if m.role == MemberRole.SUBSTITUTE]
    
    @property
    def captain(self):
        """获取队长"""
        captain_membership = next((m for m in self.memberships if m.role == MemberRole.CAPTAIN), None)
        return captain_membership.user if captain_membership else None

    @property
    def current_members(self):
        """兼容性属性 - 获取所有队员"""
        return [m.user for m in self.memberships]

    @property  
    def members(self):
        """兼容性属性 - 获取所有队员"""
        return [m.user for m in self.memberships]

# 比赛队伍成员关系模型
class MatchTeamMembership(Base):
    __tablename__ = "match_team_memberships"

    id = Column(Integer, primary_key=True, index=True, comment="成员关系ID")
    match_team_id = Column(Integer, ForeignKey("match_teams.id"), nullable=False, comment="比赛队伍ID")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="用户ID")
    role = Column(Enum(MemberRole), default=MemberRole.MAIN, comment="队员角色")
    
    # 时间戳
    joined_at = Column(DateTime, default=datetime.datetime.utcnow, comment="加入时间")
    
    # 关联关系
    team = relationship("MatchTeam", back_populates="memberships", lazy="select")
    user = relationship("User", back_populates="team_memberships", lazy="select")

# 赛程数据模型
class MatchGame(Base):
    __tablename__ = "match_games"

    id = Column(Integer, primary_key=True, index=True, comment="赛程ID")
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False, comment="关联的比赛ID")
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False, comment="关联的项目ID")
    
    # 赛程信息
    game_order = Column(Integer, default=1, comment="比赛顺序")
    structure_type = Column(String, comment="对战结构类型")
    structure_details = Column(JSON, comment="对战结构详情")
    multiplier = Column(Float, default=1.0, comment="游戏积分倍率")
    
    # 赛程状态
    is_live = Column(Boolean, default=False, comment="是否正在直播")
    start_time = Column(DateTime, nullable=True, comment="赛程开始时间")
    end_time = Column(DateTime, nullable=True, comment="赛程结束时间")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="创建时间")
    
    # 关联关系
    match = relationship("Match", back_populates="match_games", lazy="select")
    game = relationship("Game", lazy="select")
    lineups = relationship("GameLineup", back_populates="match_game", cascade="all, delete-orphan", lazy="select")
    scores = relationship("Score", back_populates="match_game", cascade="all, delete-orphan", lazy="select")

# 每个小游戏的出战阵容
class GameLineup(Base):
    __tablename__ = "game_lineups"

    id = Column(Integer, primary_key=True, index=True, comment="阵容ID")
    match_game_id = Column(Integer, ForeignKey("match_games.id"), nullable=False, comment="赛程ID")
    match_team_id = Column(Integer, ForeignKey("match_teams.id"), nullable=False, comment="队伍ID")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="出战玩家ID")
    
    # 出战信息
    is_starting = Column(Boolean, default=True, comment="是否首发")
    substitute_reason = Column(String, nullable=True, comment="替补原因")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="创建时间")
    
    # 关联关系
    match_game = relationship("MatchGame", back_populates="lineups", lazy="select")
    team = relationship("MatchTeam", back_populates="lineups", lazy="select")
    user = relationship("User", lazy="select")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True, comment="分数记录ID")
    points = Column(Integer, comment="原始得分")
    standard_score = Column(Float, nullable=True, comment="标准分（15000分制）")
    
    user_id = Column(Integer, ForeignKey("users.id"), comment="得分用户ID")
    match_team_id = Column(Integer, ForeignKey("match_teams.id"), comment="得分队伍ID") 
    match_game_id = Column(Integer, ForeignKey("match_games.id"), comment="关联的赛程ID")
    
    # 额外数据
    event_data = Column(JSON, nullable=True, comment="事件详细数据")
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, comment="记录时间")

    # 关联关系
    user = relationship("User", lazy="select")
    team = relationship("MatchTeam", back_populates="scores", lazy="select")
    match_game = relationship("MatchGame", back_populates="scores", lazy="select")
    
    # 兼容性属性，用于序列化
    @property
    def team_id(self):
        """兼容旧的team_id字段名"""
        return self.match_team_id