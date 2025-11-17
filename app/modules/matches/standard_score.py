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
from app.modules.users import models as user_models
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

            # 使用批量更新优化性能 - 使用 bulk_update_mappings
            score_updates = [
                {"id": score_id, "standard_score": standard_score}
                for score_id, standard_score in standard_scores.items()
            ]

            if score_updates:
                self.db.bulk_update_mappings(models.Score, score_updates)

            # 更新赛程的标准分汇总
            total_std = sum(standard_scores.values())
            avg_std = total_std / max(len(standard_scores), 1)
            self.db.query(models.MatchGame).filter(
                models.MatchGame.id == match_game_id
            ).update({
                "total_standard_score": total_std,
                "average_standard_score": avg_std
            })

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
            user = self.db.query(user_models.User).filter(user_models.User.id == user_id).first()
            if not user:
                return False

            # 使用单个查询获取所有统计信息（优化：合并多个查询）
            from sqlalchemy import case
            stats = self.db.query(
                func.sum(models.Score.standard_score).label('total_standard_score'),
                func.count(models.Score.id).label('score_count'),
                func.avg(models.Score.standard_score).label('avg_standard_score'),
                func.sum(models.Score.points).label('total_points'),
                func.count(func.distinct(models.MatchGame.match_id)).label('matches_played')
            ).join(
                models.MatchGame, models.MatchGame.id == models.Score.match_game_id
            ).filter(
                models.Score.user_id == user_id
            ).first()

            if stats and stats.total_standard_score is not None:
                user.total_standard_score = float(stats.total_standard_score)
                user.average_standard_score = float(stats.avg_standard_score or 0)
                user.total_points = int(stats.total_points or 0)
                user.total_matches = int(stats.matches_played or 0)
            else:
                user.total_standard_score = 0.0
                user.average_standard_score = 0.0
                user.total_points = 0
                user.total_matches = 0

            # 计算获胜次数（保持独立查询，因为涉及不同的表关联）
            wins = self.db.query(
                func.count(func.distinct(models.Match.id))
            ).select_from(
                models.Match
            ).join(
                models.MatchTeam,
                models.MatchTeam.id == models.Match.winning_team_id
            ).join(
                models.MatchTeamMembership,
                models.MatchTeamMembership.match_team_id == models.MatchTeam.id
            ).filter(
                models.MatchTeamMembership.user_id == user_id
            ).scalar()
            user.total_wins = int(wins or 0)

            self.db.commit()
            return True

        except Exception as e:
            logger.error(f"Error updating user standard score stats for user {user_id}: {e}")
            self.db.rollback()
            return False
    
    def update_all_users_standard_score_stats(self) -> int:
        """
        更新所有用户的标准分统计信息（优化：使用批量更新）

        Returns:
            int: 成功更新的用户数量
        """
        try:
            # 使用单个查询批量计算所有用户的统计信息
            from sqlalchemy import text

            # 批量更新标准分和原始分统计
            update_query = text("""
                UPDATE users
                SET
                    total_standard_score = COALESCE(stats.total_std, 0),
                    average_standard_score = COALESCE(stats.avg_std, 0),
                    total_points = COALESCE(stats.total_pts, 0),
                    total_matches = COALESCE(stats.matches_played, 0)
                FROM (
                    SELECT
                        s.user_id,
                        SUM(s.standard_score) as total_std,
                        AVG(s.standard_score) as avg_std,
                        SUM(s.points) as total_pts,
                        COUNT(DISTINCT mg.match_id) as matches_played
                    FROM scores s
                    JOIN match_games mg ON mg.id = s.match_game_id
                    GROUP BY s.user_id
                ) as stats
                WHERE users.id = stats.user_id
            """)

            result = self.db.execute(update_query)
            updated_count = result.rowcount

            # 批量更新获胜次数
            wins_query = text("""
                UPDATE users
                SET total_wins = COALESCE(wins.win_count, 0)
                FROM (
                    SELECT
                        mtm.user_id,
                        COUNT(DISTINCT m.id) as win_count
                    FROM matches m
                    JOIN match_teams mt ON mt.id = m.winning_team_id
                    JOIN match_team_memberships mtm ON mtm.match_team_id = mt.id
                    GROUP BY mtm.user_id
                ) as wins
                WHERE users.id = wins.user_id
            """)

            self.db.execute(wins_query)
            self.db.commit()

            logger.info(f"Batch updated standard score stats for {updated_count} users")

            # 更新完标准分统计后，重新计算所有用户的等级
            try:
                from app.modules.users.crud import update_all_user_levels
                updated_levels = update_all_user_levels(self.db)
                logger.info(f"Updated levels for {updated_levels} users")
            except Exception as e:
                logger.error(f"Error updating user levels: {e}")

            return updated_count

        except Exception as e:
            logger.error(f"Error updating all users standard score stats: {e}")
            self.db.rollback()
            return 0
    
    def get_game_level_distribution(self) -> Dict[str, int]:
        """
        获取所有用户的等级分布统计
        
        Returns:
            Dict[str, int]: {'S': count, 'A': count, 'B': count, 'C': count, 'D': count}
        """
        try:
            users = self.db.query(user_models.User).filter(
                user_models.User.average_standard_score > 0
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
        
        # 更新所有用户的等级
        try:
            from app.modules.users.crud import update_all_user_levels
            updated_levels = update_all_user_levels(db)
            logger.info(f"Updated levels for {updated_levels} users after match game update")
        except Exception as e:
            logger.error(f"Error updating user levels after match game update: {e}")
    
    return success
