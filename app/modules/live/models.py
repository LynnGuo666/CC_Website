# -*- coding: utf-8 -*-
import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base
from app.core.config import settings
import pytz

# 使用配置中定义的时区
TIMEZONE = pytz.timezone(settings.TIMEZONE)

def get_current_time():
    """获取带时区的当前时间"""
    return datetime.datetime.now(TIMEZONE)

class LiveEvent(Base):
    __tablename__ = "live_events"

    id = Column(Integer, primary_key=True, index=True, comment="事件ID")
    match_id = Column(Integer, ForeignKey("matches.id"), index=True, nullable=False, comment="关联的比赛ID")
    game_id = Column(Integer, ForeignKey("games.id"), index=True, nullable=False, comment="关联的项目ID")
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False, comment="关联的玩家ID")
    
    event_type = Column(String, index=True, comment="事件类型")
    data = Column(JSON, comment="具体的事件数据")
    
    created_at = Column(DateTime(timezone=True), default=get_current_time, comment="事件发生时间 (带时区)")

    # 建立与 Match, Game, User 模型的关联
    match = relationship("Match")
    game = relationship("Game")
    user = relationship("User")