from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, Dict, Any

from . import models, schemas
from app.modules.teams import models as team_models
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
    
    # 按游戏类型统计得分
    game_scores = {}
    for score in scores:
        game_name = score.match_game.game.name
        if game_name not in game_scores:
            game_scores[game_name] = {
                "total_score": 0,
                "games_played": 0
            }
        game_scores[game_name]["total_score"] += score.points
        game_scores[game_name]["games_played"] += 1
    
    # 查询比赛历史
    match_history = []
    user_matches = db.query(match_models.Match).join(
        match_models.match_participants
    ).filter(match_models.match_participants.c.team_id.in_(
        db.query(team_models.TeamMembership.team_id).filter(
            team_models.TeamMembership.user_id == user_id
        ).subquery()
    )).all()
    
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
        
        # 获取队伍名称
        team_membership = db.query(team_models.TeamMembership).filter(
            team_models.TeamMembership.user_id == user_id,
            team_models.TeamMembership.team_id.in_(
                [p.id for p in match.participants]
            )
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
        "current_team": None,  # 下面的函数中会查询
        "historical_teams": [],  # 下面的函数中会查询
        "match_history": match_history,
        "recent_scores": recent_scores_data,
        "game_scores": game_scores
    }

def get_user_match_history(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    """获取玩家历史比赛记录"""
    # 通过队伍成员关系查询用户参与的比赛
    user_matches = db.query(match_models.Match).join(
        match_models.match_participants
    ).join(
        team_models.TeamMembership,
        match_models.match_participants.c.team_id == team_models.TeamMembership.team_id
    ).filter(
        team_models.TeamMembership.user_id == user_id
    ).order_by(desc(match_models.Match.created_at)).offset(skip).limit(limit).all()
    
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
    """获取玩家队伍历史"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    
    # 查询当前队伍 (leave_date为空的)
    current_membership = db.query(team_models.TeamMembership).filter(
        team_models.TeamMembership.user_id == user_id,
        team_models.TeamMembership.leave_date == None
    ).first()
    
    current_team = None
    if current_membership:
        current_team = {
            "id": current_membership.team.id,
            "name": current_membership.team.name,
            "color": current_membership.team.color,
            "join_date": current_membership.join_date.isoformat()
        }
    
    # 查询历史队伍 (leave_date不为空的)
    historical_memberships = db.query(team_models.TeamMembership).filter(
        team_models.TeamMembership.user_id == user_id,
        team_models.TeamMembership.leave_date != None
    ).order_by(desc(team_models.TeamMembership.leave_date)).all()
    
    historical_teams = []
    for membership in historical_memberships:
        historical_teams.append({
            "id": membership.team.id,
            "name": membership.team.name,
            "color": membership.team.color,
            "join_date": membership.join_date.isoformat(),
            "leave_date": membership.leave_date.isoformat()
        })
    
    return {
        "current_team": current_team,
        "historical_teams": historical_teams
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