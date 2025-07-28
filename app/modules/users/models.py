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
        """根据平均标准分计算游戏等级
        等级分布：S-10% A-10% B-30% C-40% D-10%
        """
        avg_score = self.average_standard_score
        if avg_score >= 900:  # S级：900+
            return 'S'
        elif avg_score >= 800:  # A级：800-899
            return 'A'
        elif avg_score >= 600:  # B级：600-799
            return 'B'
        elif avg_score >= 400:  # C级：400-599
            return 'C'
        else:  # D级：0-399
            return 'D'
    
    @property
    def level_progress(self):
        """计算当前等级的进度百分比"""
        avg_score = self.average_standard_score
        if avg_score >= 900:
            return 100  # S级已达到顶级
        elif avg_score >= 800:
            return ((avg_score - 800) / 100) * 100  # A级进度
        elif avg_score >= 600:
            return ((avg_score - 600) / 200) * 100  # B级进度
        elif avg_score >= 400:
            return ((avg_score - 400) / 200) * 100  # C级进度
        else:
            return (avg_score / 400) * 100  # D级进度