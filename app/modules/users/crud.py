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
                "games_played": 0,
                "game_name": score.match_game.game.name  # 保留游戏名称用于显示
            }
        game_scores[game_code]["total_score"] += score.points
        game_scores[game_code]["games_played"] += 1
    
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