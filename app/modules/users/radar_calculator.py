# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List, Any
from app.modules.matches import models as match_models
from app.modules.games import models as game_models

class RadarCalculator:
    """
    玩家六维能力雷达图计算器
    基于 v2.0 算法：0.5 * 排名分 + 0.5 * 标准分表现
    """

    # 维度定义
    DIMS = ["武力", "协作", "策略", "爆发", "知识", "身法"]

    # 游戏配置
    # 格式: "GameCode": {"high": [dims], "mid": [dims], "lobby_size": int}
    # 注意：这里使用 Game Code 而不是中文名称，以便于代码维护
    GAME_CONFIG = {
        "BattleBox": {"high": ["武力", "协作"], "mid": ["策略"], "lobby_size": 50},
        "SkyWars": {"high": ["武力", "爆发"], "mid": ["知识"], "lobby_size": 50},
        "Bingo": {"high": ["知识"], "mid": ["协作", "身法"], "lobby_size": 50},
        "TNTRun": {"high": ["身法", "策略"], "mid": ["爆发"], "lobby_size": 50},
        "ParkourTag": {"high": ["身法", "协作"], "mid": ["策略"], "lobby_size": 50},
        "ParkourWarrior": {"high": ["身法"], "mid": ["爆发"], "lobby_size": 50},
        "SnowballShowdown": {"high": ["爆发"], "mid": ["武力"], "lobby_size": 50},
        "TGTTOS": {"high": ["爆发"], "mid": ["身法", "策略"], "lobby_size": 50},
    }

    # 权重
    WEIGHT_HIGH = 1.0
    WEIGHT_MID = 0.6
    
    # 标准分总池
    TOTAL_STD_POOL = 15000

    def __init__(self, db: Session):
        self.db = db

    def calculate_user_radar(self, user_id: int, match_id: int = None) -> Dict[str, float]:
        """
        计算指定用户的雷达图数据
        
        Args:
            user_id: 用户 ID
            match_id: 可选，赛事 ID。如果指定，则只计算该赛事的数据
        
        Returns:
            Dict[str, float]: {Dimension: Score} (0-100+)
        """
        # 1. 获取用户在各个游戏中的表现（平均标准分、平均排名、实际房间人数）
        game_stats = self._get_user_game_performance(user_id, match_id)
        
        dim_scores = {d: 0.0 for d in self.DIMS}
        dim_max_possible = {d: 0.0 for d in self.DIMS}
        
        for game_code, stats in game_stats.items():
            if game_code not in self.GAME_CONFIG:
                continue
                
            config = self.GAME_CONFIG[game_code]
            # 使用实际的房间人数，而不是固定的 50
            lobby_size = stats.get("actual_lobby_size", 50)  # 默认 50 作为后备
            
            # 获取数据
            avg_std_score = stats["avg_std_score"]
            avg_rank = stats["avg_rank"]
            
            # --- 核心算法 ---
            
            # A. 排名分 (Rank Score)
            # 1st = 100, Last = 0
            if lobby_size > 1:
                # 限制 rank 不超过 lobby_size (虽然理论上 avg_rank 可能因为样本少而波动，但一般不会)
                effective_rank = min(avg_rank, lobby_size)
                rank_score = 100 * (1 - (effective_rank - 1) / (lobby_size - 1))
            else:
                rank_score = 100
            rank_score = max(0, min(100, rank_score))
            
            # B. 标准分表现 (Std Score Performance)
            # 预期平均分 = 总池 / 房间人数（使用实际人数）
            expected_avg = self.TOTAL_STD_POOL / lobby_size
            
            # 表现分 = (实际分 / 预期分) * 50
            # 例如：实际=预期 -> 50分；实际=2倍预期 -> 100分
            if expected_avg > 0:
                std_perf_score = (avg_std_score / expected_avg) * 50
            else:
                std_perf_score = 0
            
            # C. 综合单局表现
            final_perf = (rank_score * 0.5) + (std_perf_score * 0.5)
            
            # --- 维度聚合 ---
            
            # High Impact
            for dim in config["high"]:
                dim_scores[dim] += final_perf * self.WEIGHT_HIGH
                dim_max_possible[dim] += 100 * self.WEIGHT_HIGH
                
            # Mid Impact
            for dim in config["mid"]:
                dim_scores[dim] += final_perf * self.WEIGHT_MID
                dim_max_possible[dim] += 100 * self.WEIGHT_MID
                
        # 3. 计算最终维度分
        results = {}
        for dim in self.DIMS:
            if dim_max_possible[dim] > 0:
                results[dim] = round((dim_scores[dim] / dim_max_possible[dim]) * 100, 1)
            else:
                results[dim] = 0.0
                
        return results

    def _get_user_game_performance(self, user_id: int, match_id: int = None) -> Dict[str, Dict[str, float]]:
        """
        获取用户在每个游戏中的平均表现
        
        Args:
            user_id: 用户 ID
            match_id: 可选，赛事 ID。如果指定，则只计算该赛事的数据
        
        Returns:
            {
                "GameCode": {
                    "avg_std_score": float,
                    "avg_rank": float
                }
            }
        """
        # 1. 获取用户所有有标准分的比赛记录
        # 我们需要知道：游戏代码、单场标准分、单场排名
        
        # 这里的“单场排名”比较难直接获取，因为数据库只存了分数。
        # 我们需要动态计算：在该场比赛该游戏中，该用户的标准分排名。
        # 为了性能，我们可能需要简化：
        # 方案 A: 实时计算每场比赛的排名（精确但慢）
        # 方案 B: 使用已有的 game_level 计算逻辑估算（不精确）
        # 方案 C: 预计算并存储 rank（最佳，但需要改库）
        
        # 鉴于目前是实时计算，我们采用优化后的 方案 A：
        # 先查出用户玩过的所有 (match_game_id, game_code, standard_score)
        
        query = self.db.query(
            match_models.Score.match_game_id,
            match_models.Score.standard_score,
            game_models.Game.code
        ).join(
            match_models.MatchGame, match_models.Score.match_game_id == match_models.MatchGame.id
        ).join(
            game_models.Game, match_models.MatchGame.game_id == game_models.Game.id
        ).filter(
            match_models.Score.user_id == user_id,
            match_models.Score.standard_score.isnot(None)
        )
        
        # 如果指定了 match_id，则只查询该赛事的数据
        if match_id is not None:
            query = query.join(
                match_models.Match, match_models.MatchGame.match_id == match_models.Match.id
            ).filter(
                match_models.Match.id == match_id
            )
        
        user_scores = query.all()
        
        if not user_scores:
            return {}
            
        # 按游戏分组
        game_data = {} # {code: {"total_std": 0, "total_rank": 0, "count": 0}}
        
        # 收集所有涉及的 match_game_id 以便批量查询排名
        match_game_ids = [s.match_game_id for s in user_scores]
        
        # 批量查询这些场次的排名信息
        # 我们需要知道每个 match_game_id 中，比当前用户分数高的人数 + 1
        # SELECT match_game_id, standard_score FROM scores WHERE match_game_id IN (...)
        
        all_match_scores = self.db.query(
            match_models.Score.match_game_id,
            match_models.Score.standard_score
        ).filter(
            match_models.Score.match_game_id.in_(match_game_ids),
            match_models.Score.standard_score.isnot(None)
        ).all()
        
        # 构建内存索引: match_game_id -> list of scores (sorted desc)
        match_score_map = {}
        match_lobby_sizes = {}  # 记录每个 match_game 的实际人数
        for mg_id, score in all_match_scores:
            if mg_id not in match_score_map:
                match_score_map[mg_id] = []
            match_score_map[mg_id].append(score)
            
        for mg_id, scores_list in match_score_map.items():
            scores_list.sort(reverse=True)
            match_lobby_sizes[mg_id] = len(scores_list)  # 实际参赛人数
            
        # 计算每个记录的排名和累计房间人数
        for mg_id, std_score, game_code in user_scores:
            if game_code not in game_data:
                game_data[game_code] = {
                    "total_std": 0.0, 
                    "total_rank": 0, 
                    "total_lobby_size": 0,  # 累计房间人数
                    "count": 0
                }
                
            # 计算 rank
            # 简单的 rank 算法：在排序列表中找到第一个 <= std_score 的位置（其实是等于，因为是浮点数，最好用近似或直接找）
            # 由于是降序，index + 1 就是排名
            rank = 1
            lobby_size = 50  # 默认值
            if mg_id in match_score_map:
                scores_list = match_score_map[mg_id]
                lobby_size = match_lobby_sizes.get(mg_id, 50)
                for i, s in enumerate(scores_list):
                    if abs(s - std_score) < 0.001: # Float equality
                        rank = i + 1
                        break
            
            game_data[game_code]["total_std"] += std_score
            game_data[game_code]["total_rank"] += rank
            game_data[game_code]["total_lobby_size"] += lobby_size
            game_data[game_code]["count"] += 1
            
        # 计算平均值
        result = {}
        for code, data in game_data.items():
            if data["count"] > 0:
                result[code] = {
                    "avg_std_score": data["total_std"] / data["count"],
                    "avg_rank": data["total_rank"] / data["count"],
                    "actual_lobby_size": round(data["total_lobby_size"] / data["count"])  # 平均房间人数
                }
                
        return result

