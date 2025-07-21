# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

from app.core.db import Base

# 队伍数据模型
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True, comment="队伍ID")
    name = Column(String, index=True, comment="队伍名称")
    color = Column(String, comment="队伍颜色（仅锦标赛启用）")

    # 建立与 TeamMembership 的关联
    members = relationship("TeamMembership", back_populates="team")
    
    @property
    def current_players(self):
        """获取当前队伍成员"""
        return [membership.user for membership in self.members 
                if membership.leave_date is None]
    
    @property 
    def historical_players(self):
        """获取历史队伍成员"""
        return [membership.user for membership in self.members 
                if membership.leave_date is not None]

# 队伍成员关系模型（用于记录历史队伍关系）
class TeamMembership(Base):
    __tablename__ = "team_memberships"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, comment="用户ID")
    team_id = Column(Integer, ForeignKey("teams.id"), primary_key=True, comment="队伍ID")
    join_date = Column(DateTime, default=datetime.datetime.utcnow, comment="加入日期")
    leave_date = Column(DateTime, nullable=True, comment="离开日期, NULL表示现役")

    # 建立与 User 和 Team 的关联
    user = relationship("User", back_populates="team_memberships")
    team = relationship("Team", back_populates="members")