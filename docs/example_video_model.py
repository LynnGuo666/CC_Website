# -*- coding: utf-8 -*-
"""
视频系统数据模型
用于存储赛事回放、直播链接等视频资源
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
import datetime
import enum

from app.core.db import Base


class VideoType(enum.Enum):
    """视频类型枚举"""
    LIVESTREAM = "livestream"    # 直播
    REPLAY = "replay"            # 录播
    HIGHLIGHT = "highlight"      # 精彩集锦


class VideoPlatform(enum.Enum):
    """视频平台枚举"""
    BILIBILI = "bilibili"        # B站
    YOUTUBE = "youtube"          # YouTube
    TWITCH = "twitch"            # Twitch
    DOUYU = "douyu"              # 斗鱼
    HUYA = "huya"                # 虎牙
    OTHER = "other"              # 其他


class MatchVideo(Base):
    """
    赛事视频模型
    
    支持三种类型的视频：
    1. 官方录播：is_official=True, user_id=None
    2. 选手视角：is_official=False, user_id!=None
    3. 第三方录播：is_official=False, user_id=None
    """
    __tablename__ = "match_videos"
    
    # 主键
    id = Column(Integer, primary_key=True, index=True, comment="视频ID")
    
    # 关联信息
    match_id = Column(
        Integer, 
        ForeignKey("matches.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True,
        comment="关联的比赛ID"
    )
    match_game_id = Column(
        Integer, 
        ForeignKey("match_games.id", ondelete="SET NULL"), 
        nullable=True,
        index=True,
        comment="关联的小游戏ID（可选）"
    )
    user_id = Column(
        Integer, 
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True,
        index=True,
        comment="关联选手ID（选手视角时使用）"
    )
    
    # 视频基本信息
    title = Column(String(255), nullable=False, comment="视频标题")
    url = Column(String(512), nullable=False, comment="视频链接")
    platform = Column(
        Enum(VideoPlatform), 
        nullable=False, 
        index=True,
        comment="视频平台"
    )
    video_type = Column(
        Enum(VideoType), 
        default=VideoType.REPLAY,
        index=True,
        comment="视频类型"
    )
    
    # 上传者信息
    is_official = Column(
        Boolean, 
        default=False, 
        index=True,
        comment="是否官方录播"
    )
    uploader_name = Column(
        String(100), 
        nullable=True,
        comment="上传者名称（用于官方/第三方）"
    )
    
    # 视频元数据
    duration = Column(Integer, nullable=True, comment="视频时长（秒）")
    thumbnail_url = Column(String(512), nullable=True, comment="缩略图URL")
    view_count = Column(Integer, default=0, comment="观看次数")
    description = Column(String(1000), nullable=True, comment="视频描述")
    
    # 时间戳
    published_at = Column(DateTime, nullable=True, comment="视频发布时间")
    created_at = Column(
        DateTime, 
        default=datetime.datetime.utcnow,
        comment="记录创建时间"
    )
    updated_at = Column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        onupdate=datetime.datetime.utcnow,
        comment="记录更新时间"
    )
    
    # 关联关系
    match = relationship("Match", back_populates="videos", lazy="select")
    match_game = relationship("MatchGame", back_populates="videos", lazy="select")
    user = relationship("User", back_populates="videos", lazy="select")
    
    @property
    def is_player_pov(self) -> bool:
        """判断是否为选手视角"""
        return self.user_id is not None and not self.is_official
    
    @property
    def is_third_party(self) -> bool:
        """判断是否为第三方录播"""
        return not self.is_official and self.user_id is None
    
    @property
    def uploader_display_name(self) -> str:
        """获取显示用的上传者名称"""
        if self.is_official:
            return self.uploader_name or "官方"
        elif self.user:
            return f"{self.user.display_name or self.user.nickname}的视角"
        else:
            return self.uploader_name or "第三方"
    
    @property
    def platform_display_name(self) -> str:
        """获取平台显示名称"""
        platform_names = {
            VideoPlatform.BILIBILI: "B站",
            VideoPlatform.YOUTUBE: "YouTube",
            VideoPlatform.TWITCH: "Twitch",
            VideoPlatform.DOUYU: "斗鱼",
            VideoPlatform.HUYA: "虎牙",
            VideoPlatform.OTHER: "其他"
        }
        return platform_names.get(self.platform, "未知")
    
    @property
    def type_display_name(self) -> str:
        """获取视频类型显示名称"""
        type_names = {
            VideoType.LIVESTREAM: "直播",
            VideoType.REPLAY: "录播",
            VideoType.HIGHLIGHT: "精彩集锦"
        }
        return type_names.get(self.video_type, "未知")
    
    @property
    def duration_formatted(self) -> str:
        """格式化时长为 HH:MM:SS"""
        if not self.duration:
            return "未知"
        
        hours = self.duration // 3600
        minutes = (self.duration % 3600) // 60
        seconds = self.duration % 60
        
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes:02d}:{seconds:02d}"
    
    def __repr__(self):
        return f"<MatchVideo(id={self.id}, title='{self.title}', platform={self.platform.value})>"


# 需要在 Match 模型中添加反向关系
# class Match(Base):
#     ...
#     videos = relationship("MatchVideo", back_populates="match", cascade="all, delete-orphan", lazy="select")

# 需要在 MatchGame 模型中添加反向关系
# class MatchGame(Base):
#     ...
#     videos = relationship("MatchVideo", back_populates="match_game", cascade="all, delete-orphan", lazy="select")

# 需要在 User 模型中添加反向关系
# class User(Base):
#     ...
#     videos = relationship("MatchVideo", back_populates="user", lazy="select")
