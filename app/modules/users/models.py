from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
import datetime

from app.core.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, index=True, comment="玩家昵称")
    display_name = Column(String, nullable=True, comment="显示名称")
    source = Column(String, nullable=True, comment="数据来源")
    
    # 玩家统计信息
    total_matches = Column(Integer, default=0, comment="参与比赛总数")
    total_wins = Column(Integer, default=0, comment="获胜次数")
    total_points = Column(Integer, default=0, comment="总得分")
    total_standard_score = Column(Float, default=0.0, comment="总标准分")
    average_standard_score = Column(Float, default=0.0, comment="平均标准分")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="注册时间")
    last_active = Column(DateTime, default=datetime.datetime.utcnow, comment="最后活跃时间")

    # 关联关系
    team_memberships = relationship("MatchTeamMembership", back_populates="user", lazy="select")
    scores = relationship("Score", back_populates="user", lazy="select")
    
    @property
    def current_teams(self):
        """获取当前所有队伍（支持多队伍）"""
        return [membership.team for membership in self.team_memberships]
    
    @property
    def teams_by_match(self):
        """按比赛分组的队伍列表"""
        teams_by_match = {}
        for membership in self.team_memberships:
            match_id = membership.team.match_id
            if match_id not in teams_by_match:
                teams_by_match[match_id] = []
            teams_by_match[match_id].append({
                'team': membership.team,
                'role': membership.role,
                'joined_at': membership.joined_at
            })
        return teams_by_match
    
    @property
    def win_rate(self):
        """计算胜率"""
        if self.total_matches == 0:
            return 0.0
        return round(self.total_wins / self.total_matches * 100, 2)
    
    @property
    def average_score(self):
        """计算平均得分"""
        if self.total_matches == 0:
            return 0.0
        return round(self.total_points / self.total_matches, 2)
    
    @property
    def match_history(self):
        """获取参赛历史（通过分数记录）"""
        matches = set()
        for score in self.scores:
            if score.match_game and score.match_game.match:
                matches.add(score.match_game.match)
        return list(matches)
    
    @property
    def total_game_scores(self):
        """按游戏类型统计得分"""
        game_scores = {}
        for score in self.scores:
            if score.match_game and score.match_game.game:
                game_name = score.match_game.game.name
                if game_name not in game_scores:
                    game_scores[game_name] = {'total_score': 0, 'games_played': 0}
                game_scores[game_name]['total_score'] += score.points
                game_scores[game_name]['games_played'] += 1
        return game_scores
    
    @property
    def game_level(self):
        """根据排名百分比计算游戏等级
        S级：前10% A级：前30% B级：前60% C级：前90% D级：后10%
        """
        from sqlalchemy.orm import Session
        from app.core.db import SessionLocal
        
        # 获取数据库会话
        db = SessionLocal()
        try:
            # 获取所有有标准分的用户，按平均标准分降序排列
            all_users = db.query(User).filter(
                User.average_standard_score > 0
            ).order_by(User.average_standard_score.desc()).all()
            
            if not all_users:
                return 'D'
            
            total_users = len(all_users)
            
            # 找到当前用户在排行榜中的位置
            current_rank = None
            for i, user in enumerate(all_users):
                if user.id == self.id:
                    current_rank = i + 1  # 排名从1开始
                    break
            
            if current_rank is None:
                return 'D'
            
            # 根据排名百分比计算等级
            percentile = (current_rank / total_users) * 100
            
            if percentile <= 10:  # 前10%
                return 'S'
            elif percentile <= 30:  # 前30%
                return 'A'
            elif percentile <= 60:  # 前60%
                return 'B'
            elif percentile <= 90:  # 前90%
                return 'C'
            else:  # 后10%
                return 'D'
                
        finally:
            db.close()
    
    @property
    def level_progress(self):
        """计算当前等级的进度百分比"""
        from sqlalchemy.orm import Session
        from app.core.db import SessionLocal
        
        db = SessionLocal()
        try:
            # 获取所有有标准分的用户，按平均标准分降序排列
            all_users = db.query(User).filter(
                User.average_standard_score > 0
            ).order_by(User.average_standard_score.desc()).all()
            
            if not all_users:
                return 0.0
            
            total_users = len(all_users)
            
            # 找到当前用户在排行榜中的位置
            current_rank = None
            for i, user in enumerate(all_users):
                if user.id == self.id:
                    current_rank = i + 1
                    break
            
            if current_rank is None:
                return 0.0
            
            percentile = (current_rank / total_users) * 100
            
            # 根据等级计算进度（进度表示在当前等级内的位置）
            if percentile <= 10:  # S级（前10%）
                # 在S级内的相对位置：排名越靠前，进度越高
                return ((10 - percentile) / 10) * 100
            elif percentile <= 30:  # A级（前30%，但排除前10%）
                # 在A级内的相对位置：从第10%到第30%
                return ((30 - percentile) / 20) * 100
            elif percentile <= 60:  # B级（前60%，但排除前30%）
                # 在B级内的相对位置：从第30%到第60%
                return ((60 - percentile) / 30) * 100
            elif percentile <= 90:  # C级（前90%，但排除前60%）
                # 在C级内的相对位置：从第60%到第90%
                return ((90 - percentile) / 30) * 100
            else:  # D级（后10%）
                # 在D级内的相对位置：从第90%到第100%
                return ((100 - percentile) / 10) * 100
                
        finally:
            db.close()