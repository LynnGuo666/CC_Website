from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, Dict, Any

from . import models, schemas
from app.modules.matches import models as match_models


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_stats(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """获取玩家详细统计信息"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    
    # 查询玩家的得分记录来计算游戏统计
    scores = db.query(match_models.Score).filter(match_models.Score.user_id == user_id).all()
    
    # 按游戏类型统计得分 - 使用游戏代码而不是名称
    game_scores = {}
    for score in scores:
        game_code = score.match_game.game.code
        if game_code not in game_scores:
            game_scores[game_code] = {
                "total_score": 0,
                "total_standard_score": 0.0,
                "games_played": 0,
                "game_name": score.match_game.game.name  # 保留游戏名称用于显示
            }
        game_scores[game_code]["total_score"] += score.points
        game_scores[game_code]["total_standard_score"] += (score.standard_score or 0.0)
        game_scores[game_code]["games_played"] += 1
    
    # 计算每个游戏的平均标准分和等级
    for game_code in game_scores:
        avg_standard_score = (game_scores[game_code]["total_standard_score"] / 
                             game_scores[game_code]["games_played"]) if game_scores[game_code]["games_played"] > 0 else 0
        game_scores[game_code]["average_standard_score"] = round(avg_standard_score, 2)
        
        # 计算该游戏的等级
        if avg_standard_score >= 900:
            game_scores[game_code]["level"] = 'S'
        elif avg_standard_score >= 800:
            game_scores[game_code]["level"] = 'A'
        elif avg_standard_score >= 600:
            game_scores[game_code]["level"] = 'B'
        elif avg_standard_score >= 400:
            game_scores[game_code]["level"] = 'C'
        else:
            game_scores[game_code]["level"] = 'D'
    
    # 查询比赛历史 - 基于新的MatchTeamMembership系统
    match_history = []
    user_matches = db.query(match_models.Match).join(
        match_models.MatchTeam, match_models.Match.id == match_models.MatchTeam.match_id
    ).join(
        match_models.MatchTeamMembership
    ).filter(
        match_models.MatchTeamMembership.user_id == user_id
    ).distinct().all()
    
    for match in user_matches:
        # 计算该玩家在这场比赛中的总得分
        match_scores = db.query(func.sum(match_models.Score.points)).filter(
            match_models.Score.user_id == user_id,
            match_models.Score.match_game_id.in_(
                [mg.id for mg in match.match_games]
            )
        ).scalar() or 0
        
        # 计算参与的游戏数
        games_played = db.query(func.count(func.distinct(match_models.Score.match_game_id))).filter(
            match_models.Score.user_id == user_id,
            match_models.Score.match_game_id.in_(
                [mg.id for mg in match.match_games]
            )
        ).scalar() or 0
        
        # 获取队伍名称 - 基于新的MatchTeamMembership
        team_membership = db.query(match_models.MatchTeamMembership).join(
            match_models.MatchTeam
        ).filter(
            match_models.MatchTeamMembership.user_id == user_id,
            match_models.MatchTeam.match_id == match.id
        ).first()
        
        team_name = team_membership.team.name if team_membership else "未知队伍"
        
        match_history.append({
            "match_id": match.id,
            "match_name": match.name,
            "total_points": int(match_scores),
            "games_played": int(games_played),
            "team_name": team_name
        })
    
    # 查询最近得分记录
    recent_scores = db.query(match_models.Score).filter(
        match_models.Score.user_id == user_id
    ).order_by(desc(match_models.Score.recorded_at)).limit(10).all()
    
    recent_scores_data = []
    for score in recent_scores:
        recent_scores_data.append({
            "points": score.points,
            "game_name": score.match_game.game.name,
            "team_name": score.team.name,
            "recorded_at": score.recorded_at.isoformat()
        })
    
    return {
        "user": {
            "id": user.id,
            "nickname": user.nickname,
            "display_name": user.display_name,
            "total_points": user.total_points,
            "win_rate": user.win_rate,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_active": user.last_active.isoformat() if user.last_active else None,
        },
        "current_team": None,  # 使用下面的 get_user_team_history 函数
        "historical_teams": [],  # 使用下面的 get_user_team_history 函数
        "match_history": match_history,
        "recent_scores": recent_scores_data,
        "game_scores": game_scores
    }

def get_user_match_history(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    """获取玩家历史比赛记录"""
    # 通过新的MatchTeamMembership查询用户参与的比赛
    user_matches = db.query(match_models.Match).join(
        match_models.MatchTeam, match_models.Match.id == match_models.MatchTeam.match_id
    ).join(
        match_models.MatchTeamMembership
    ).filter(
        match_models.MatchTeamMembership.user_id == user_id
    ).order_by(desc(match_models.Match.created_at)).offset(skip).limit(limit).distinct().all()
    
    match_history = []
    for match in user_matches:
        # 计算该玩家在这场比赛中的统计数据
        match_scores = db.query(func.sum(match_models.Score.points)).filter(
            match_models.Score.user_id == user_id,
            match_models.Score.match_game_id.in_(
                [mg.id for mg in match.match_games]
            )
        ).scalar() or 0
        
        games_played = db.query(func.count(func.distinct(match_models.Score.match_game_id))).filter(
            match_models.Score.user_id == user_id,
            match_models.Score.match_game_id.in_(
                [mg.id for mg in match.match_games]
            )
        ).scalar() or 0
        
        match_history.append({
            "match_id": match.id,
            "match_name": match.name,
            "status": match.status.value,
            "total_points": int(match_scores),
            "games_played": int(games_played),
            "created_at": match.created_at.isoformat()
        })
    
    return match_history

def get_user_team_history(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """获取玩家队伍历史 - 新版本基于比赛队伍"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    
    # 查询玩家参与的所有比赛队伍
    memberships = db.query(match_models.MatchTeamMembership).join(
        match_models.MatchTeam
    ).join(
        match_models.Match, match_models.MatchTeam.match_id == match_models.Match.id
    ).filter(
        match_models.MatchTeamMembership.user_id == user_id
    ).all()
    
    teams_info = []
    for membership in memberships:
        team_info = {
            "id": membership.team.id,
            "name": membership.team.name,
            "color": membership.team.color,
            "role": membership.role.value,
            "match_id": membership.team.match_id,
            "match_name": membership.team.match.name,
            "join_date": membership.joined_at.isoformat() if membership.joined_at else None
        }
        teams_info.append(team_info)
    
    # 按照加入时间排序，最新的在前
    teams_info.sort(key=lambda x: x['join_date'] or '', reverse=True)
    
    # 分离当前活跃的队伍和历史队伍
    current_teams = []
    historical_teams = []
    
    for team in teams_info:
        # 判断比赛是否还在进行中
        match = db.query(match_models.Match).filter(
            match_models.Match.id == team['match_id']
        ).first()
        
        if match and match.status in [match_models.MatchStatus.PREPARING, match_models.MatchStatus.ONGOING]:
            current_teams.append(team)
        else:
            historical_teams.append(team)
    
    return {
        "current_teams": current_teams,
        "historical_teams": historical_teams,
        "total_teams": len(teams_info)
    }

def create_user(db: Session, user: schemas.UserCreate):
    """Get or Create a user."""
    db_user = db.query(models.User).filter(models.User.nickname == user.nickname).first()
    if db_user:
        return db_user
    db_user = models.User(nickname=user.nickname, source=user.source)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserCreate):
    """更新用户信息"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    db_user.nickname = user_update.nickname
    if user_update.display_name is not None:
        db_user.display_name = user_update.display_name
    if user_update.source is not None:
        db_user.source = user_update.source
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """删除用户"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True

# --- 排行榜相关函数 ---

def get_leaderboard(db: Session, skip: int = 0, limit: int = 100, game_code: str = None):
    """
    获取标准分排行榜
    
    Args:
        db: 数据库会话
        skip: 跳过数量
        limit: 返回数量限制
        game_code: 游戏代码，如果指定则按该游戏的平均标准分排序
        
    Returns:
        List[Dict]: 排行榜数据
    """
    if game_code:
        # 按指定游戏的平均标准分排行
        return get_game_specific_leaderboard(db, game_code, skip, limit)
    else:
        # 按综合平均标准分排行
        users = db.query(models.User).filter(
            models.User.average_standard_score > 0
        ).order_by(
            desc(models.User.average_standard_score)
        ).offset(skip).limit(limit).all()
        
        leaderboard = []
        for idx, user in enumerate(users):
            # 获取用户的游戏统计
            game_stats = get_user_game_stats(db, user.id)
            
            leaderboard.append({
                "rank": skip + idx + 1,
                "user_id": user.id,
                "nickname": user.nickname,
                "display_name": user.display_name,
                "average_standard_score": round(user.average_standard_score, 1),
                "total_standard_score": round(user.total_standard_score, 1),
                "game_level": user.game_level,
                "level_progress": round(user.level_progress, 1),
                "total_matches": user.total_matches,
                "total_games_played": sum(stats.get('games_played', 0) for stats in game_stats.values()),
                "best_game": get_user_best_game(game_stats),
                "game_count": len([g for g in game_stats.values() if g.get('games_played', 0) > 0])
            })
        
        return leaderboard

def get_game_specific_leaderboard(db: Session, game_code: str, skip: int = 0, limit: int = 100):
    """
    获取指定游戏的排行榜
    
    Args:
        db: 数据库会话
        game_code: 游戏代码
        skip: 跳过数量
        limit: 返回数量限制
        
    Returns:
        List[Dict]: 该游戏的排行榜数据
    """
    from app.modules.games import models as game_models
    from app.modules.matches import models as match_models
    
    # 先获取游戏信息
    game = db.query(game_models.Game).filter(game_models.Game.code == game_code).first()
    if not game:
        return []
    
    # 查询所有有该游戏分数的用户，按平均标准分排序
    user_scores = db.query(
        models.User.id,
        models.User.nickname,
        models.User.display_name,
        func.avg(match_models.Score.standard_score).label('avg_standard_score'),
        func.sum(match_models.Score.standard_score).label('total_standard_score'),
        func.count(match_models.Score.id).label('games_played'),
        func.sum(match_models.Score.points).label('total_raw_score')
    ).join(
        match_models.Score, models.User.id == match_models.Score.user_id
    ).join(
        match_models.MatchGame, match_models.Score.match_game_id == match_models.MatchGame.id
    ).join(
        game_models.Game, match_models.MatchGame.game_id == game_models.Game.id
    ).filter(
        game_models.Game.code == game_code,
        match_models.Score.standard_score.isnot(None)
    ).group_by(
        models.User.id, models.User.nickname, models.User.display_name
    ).order_by(
        desc(func.avg(match_models.Score.standard_score))
    ).offset(skip).limit(limit).all()
    
    leaderboard = []
    for idx, user_score in enumerate(user_scores):
        # 计算该游戏的等级
        avg_score = float(user_score.avg_standard_score or 0)
        if avg_score >= 900:
            level = 'S'
        elif avg_score >= 800:
            level = 'A'
        elif avg_score >= 600:
            level = 'B'
        elif avg_score >= 400:
            level = 'C'
        else:
            level = 'D'
        
        # 计算等级进度
        if avg_score >= 900:
            progress = 100
        elif avg_score >= 800:
            progress = ((avg_score - 800) / 100) * 100
        elif avg_score >= 600:
            progress = ((avg_score - 600) / 200) * 100
        elif avg_score >= 400:
            progress = ((avg_score - 400) / 200) * 100
        else:
            progress = (avg_score / 400) * 100
        
        leaderboard.append({
            "rank": skip + idx + 1,
            "user_id": user_score.id,
            "nickname": user_score.nickname,
            "display_name": user_score.display_name,
            "average_standard_score": round(avg_score, 1),
            "total_standard_score": round(float(user_score.total_standard_score or 0), 1),
            "game_level": level,
            "level_progress": round(progress, 1),
            "games_played": int(user_score.games_played or 0),
            "total_raw_score": int(user_score.total_raw_score or 0),
            "average_raw_score": round(float(user_score.total_raw_score or 0) / max(int(user_score.games_played or 1), 1), 1),
            "game_code": game_code,
            "game_name": game.name
        })
    
    return leaderboard

def get_user_game_stats(db: Session, user_id: int):
    """获取用户的游戏统计数据"""
    from app.modules.matches import models as match_models
    
    scores = db.query(match_models.Score).filter(match_models.Score.user_id == user_id).all()
    
    game_stats = {}
    for score in scores:
        if not score.match_game or not score.match_game.game:
            continue
            
        game_code = score.match_game.game.code
        if game_code not in game_stats:
            game_stats[game_code] = {
                "total_score": 0,
                "total_standard_score": 0.0,
                "games_played": 0,
                "game_name": score.match_game.game.name
            }
        
        game_stats[game_code]["total_score"] += score.points
        game_stats[game_code]["total_standard_score"] += (score.standard_score or 0.0)
        game_stats[game_code]["games_played"] += 1
    
    # 计算每个游戏的平均标准分
    for game_code in game_stats:
        if game_stats[game_code]["games_played"] > 0:
            game_stats[game_code]["average_standard_score"] = round(
                game_stats[game_code]["total_standard_score"] / game_stats[game_code]["games_played"], 2
            )
        else:
            game_stats[game_code]["average_standard_score"] = 0.0
    
    return game_stats

def get_user_best_game(game_stats):
    """获取用户表现最好的游戏"""
    if not game_stats:
        return None
    
    best_game = None
    best_score = 0
    
    for game_code, stats in game_stats.items():
        avg_score = stats.get('average_standard_score', 0)
        if avg_score > best_score:
            best_score = avg_score
            best_game = {
                "game_code": game_code,
                "game_name": stats.get('game_name', game_code),
                "average_standard_score": avg_score,
                "games_played": stats.get('games_played', 0)
            }
    
    return best_game

def get_level_distribution(db: Session):
    """
    获取等级分布统计
    
    Returns:
        Dict: 等级分布数据
    """
    users = db.query(models.User).filter(
        models.User.average_standard_score > 0
    ).all()
    
    distribution = {'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0}
    
    for user in users:
        level = user.game_level
        distribution[level] += 1
    
    total_users = sum(distribution.values())
    
    # 计算百分比
    distribution_with_percentage = {}
    for level, count in distribution.items():
        percentage = (count / total_users * 100) if total_users > 0 else 0
        distribution_with_percentage[level] = {
            "count": count,
            "percentage": round(percentage, 1)
        }
    
    return {
        "distribution": distribution_with_percentage,
        "total_users": total_users
    }

def get_available_games_for_leaderboard(db: Session):
    """
    获取有排行榜数据的游戏列表
    
    Returns:
        List[Dict]: 游戏列表
    """
    from app.modules.games import models as game_models
    from app.modules.matches import models as match_models
    
    # 查询有标准分数据的游戏
    games_with_scores = db.query(
        game_models.Game.id,
        game_models.Game.name,
        game_models.Game.code,
        func.count(match_models.Score.id).label('total_scores'),
        func.count(func.distinct(match_models.Score.user_id)).label('unique_players')
    ).join(
        match_models.MatchGame, game_models.Game.id == match_models.MatchGame.game_id
    ).join(
        match_models.Score, match_models.MatchGame.id == match_models.Score.match_game_id
    ).filter(
        match_models.Score.standard_score.isnot(None)
    ).group_by(
        game_models.Game.id, game_models.Game.name, game_models.Game.code
    ).order_by(
        desc(func.count(match_models.Score.id))
    ).all()
    
    return [
        {
            "id": game.id,
            "name": game.name,
            "code": game.code,
            "total_scores": int(game.total_scores),
            "unique_players": int(game.unique_players)
        }
        for game in games_with_scores
    ]