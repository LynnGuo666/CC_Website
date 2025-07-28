# -*- coding: utf-8 -*-
"""
标准分计算系统

每次锦标赛单个小游戏的所有人得分加起来然后折算到15000的总分，
按照比例给所有人赋分。
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Tuple
from . import models
import logging

logger = logging.getLogger(__name__)

class StandardScoreCalculator:
    """标准分计算器"""
    
    STANDARD_TOTAL_SCORE = 15000  # 标准总分
    
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_match_game_standard_scores(self, match_game_id: int) -> Dict[int, float]:
        """
        计算单个比赛游戏的标准分
        
        Args:
            match_game_id: 比赛游戏ID
            
        Returns:
            Dict[int, float]: {score_id: standard_score}
        """
        # 获取该游戏的所有分数记录
        scores = self.db.query(models.Score).filter(
            models.Score.match_game_id == match_game_id
        ).all()
        
        if not scores:
            return {}
        
        # 计算原始分数总和
        total_raw_score = sum(score.points for score in scores)
        
        if total_raw_score == 0:
            # 如果总分为0，则平均分配标准分
            standard_score_per_player = self.STANDARD_TOTAL_SCORE / len(scores)
            return {score.id: standard_score_per_player for score in scores}
        
        # 按比例计算标准分
        standard_scores = {}
        for score in scores:
            # 标准分 = (个人原始分数 / 总原始分数) * 标准总分
            standard_score = (score.points / total_raw_score) * self.STANDARD_TOTAL_SCORE
            standard_scores[score.id] = round(standard_score, 2)
        
        return standard_scores
    
    def update_match_game_standard_scores(self, match_game_id: int) -> bool:
        """
        更新单个比赛游戏的标准分到数据库
        
        Args:
            match_game_id: 比赛游戏ID
            
        Returns:
            bool: 是否成功更新
        """
        try:
            standard_scores = self.calculate_match_game_standard_scores(match_game_id)
            
            if not standard_scores:
                logger.warning(f"No scores found for match_game_id: {match_game_id}")
                return False
            
            # 批量更新标准分
            for score_id, standard_score in standard_scores.items():
                self.db.query(models.Score).filter(
                    models.Score.id == score_id
                ).update({"standard_score": standard_score})
            
            self.db.commit()
            logger.info(f"Updated standard scores for match_game_id: {match_game_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating standard scores for match_game_id {match_game_id}: {e}")
            self.db.rollback()
            return False
    
    def calculate_match_standard_scores(self, match_id: int) -> bool:
        """
        计算整个比赛的所有游戏的标准分
        
        Args:
            match_id: 比赛ID
            
        Returns:
            bool: 是否成功计算
        """
        try:
            # 获取该比赛的所有游戏
            match_games = self.db.query(models.MatchGame).filter(
                models.MatchGame.match_id == match_id
            ).all()
            
            success_count = 0
            for match_game in match_games:
                if self.update_match_game_standard_scores(match_game.id):
                    success_count += 1
            
            logger.info(f"Updated standard scores for {success_count}/{len(match_games)} games in match {match_id}")
            return success_count == len(match_games)
            
        except Exception as e:
            logger.error(f"Error calculating standard scores for match {match_id}: {e}")
            return False
    
    def update_user_standard_score_stats(self, user_id: int) -> bool:
        """
        更新用户的标准分统计信息
        
        Args:
            user_id: 用户ID
            
        Returns:
            bool: 是否成功更新
        """
        try:
            user = self.db.query(models.User).filter(models.User.id == user_id).first()
            if not user:
                return False
            
            # 计算用户的标准分统计
            stats = self.db.query(
                func.sum(models.Score.standard_score).label('total_standard_score'),
                func.count(models.Score.id).label('score_count'),
                func.avg(models.Score.standard_score).label('avg_standard_score')
            ).filter(
                models.Score.user_id == user_id,
                models.Score.standard_score.isnot(None)
            ).first()
            
            if stats and stats.total_standard_score is not None:
                user.total_standard_score = float(stats.total_standard_score)
                user.average_standard_score = float(stats.avg_standard_score or 0)
            else:
                user.total_standard_score = 0.0
                user.average_standard_score = 0.0
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error updating user standard score stats for user {user_id}: {e}")
            self.db.rollback()
            return False
    
    def update_all_users_standard_score_stats(self) -> int:
        """
        更新所有用户的标准分统计信息
        
        Returns:
            int: 成功更新的用户数量
        """
        try:
            # 获取所有有分数记录的用户
            user_ids = self.db.query(models.Score.user_id).distinct().all()
            user_ids = [uid[0] for uid in user_ids]
            
            success_count = 0
            for user_id in user_ids:
                if self.update_user_standard_score_stats(user_id):
                    success_count += 1
            
            logger.info(f"Updated standard score stats for {success_count}/{len(user_ids)} users")
            return success_count
            
        except Exception as e:
            logger.error(f"Error updating all users standard score stats: {e}")
            return 0
    
    def get_game_level_distribution(self) -> Dict[str, int]:
        """
        获取所有用户的等级分布统计
        
        Returns:
            Dict[str, int]: {'S': count, 'A': count, 'B': count, 'C': count, 'D': count}
        """
        try:
            users = self.db.query(models.User).filter(
                models.User.average_standard_score > 0
            ).all()
            
            distribution = {'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0}
            
            for user in users:
                level = user.game_level
                distribution[level] += 1
            
            return distribution
            
        except Exception as e:
            logger.error(f"Error getting game level distribution: {e}")
            return {'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0}


def calculate_standard_scores_for_match(db: Session, match_id: int) -> bool:
    """
    便捷函数：为指定比赛计算标准分
    
    Args:
        db: 数据库会话
        match_id: 比赛ID
        
    Returns:
        bool: 是否成功
    """
    calculator = StandardScoreCalculator(db)
    success = calculator.calculate_match_standard_scores(match_id)
    
    if success:
        # 更新所有相关用户的统计信息
        calculator.update_all_users_standard_score_stats()
    
    return success


def calculate_standard_scores_for_match_game(db: Session, match_game_id: int) -> bool:
    """
    便捷函数：为指定比赛游戏计算标准分
    
    Args:
        db: 数据库会话
        match_game_id: 比赛游戏ID
        
    Returns:
        bool: 是否成功
    """
    calculator = StandardScoreCalculator(db)
    success = calculator.update_match_game_standard_scores(match_game_id)
    
    if success:
        # 获取相关用户并更新统计信息
        scores = db.query(models.Score).filter(
            models.Score.match_game_id == match_game_id
        ).all()
        
        user_ids = list(set(score.user_id for score in scores))
        for user_id in user_ids:
            calculator.update_user_standard_score_stats(user_id)
    
    return success