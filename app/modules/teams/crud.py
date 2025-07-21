# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
import datetime
from typing import Optional, List, Dict, Any

from . import models, schemas
from app.modules.users import models as user_models

# --- 队伍相关的 CRUD ---

def get_team(db: Session, team_id: int):
    """根据 ID 查询单个队伍"""
    return db.query(models.Team).filter(models.Team.id == team_id).first()

def get_teams(db: Session, skip: int = 0, limit: int = 100):
    """查询队伍列表，支持分页"""
    return db.query(models.Team).offset(skip).limit(limit).all()

def get_team_with_members(db: Session, team_id: int):
    """获取队伍详情包含成员信息"""
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        return None
    
    # 获取当前成员
    current_memberships = db.query(models.TeamMembership).filter(
        models.TeamMembership.team_id == team_id,
        models.TeamMembership.leave_date == None
    ).all()
    
    # 获取历史成员
    historical_memberships = db.query(models.TeamMembership).filter(
        models.TeamMembership.team_id == team_id,
        models.TeamMembership.leave_date != None
    ).all()
    
    # 构造返回的数据结构
    result = {
        "id": team.id,
        "name": team.name,
        "color": team.color,
        "current_members": [],
        "historical_members": [],
        "total_members": len(current_memberships) + len(historical_memberships)
    }
    
    # 添加当前成员信息
    for membership in current_memberships:
        user = membership.user
        result["current_members"].append({
            "id": user.id,
            "nickname": user.nickname,
            "display_name": user.display_name,
            "total_points": user.total_points,
            "win_rate": user.win_rate,
        })
    
    # 添加历史成员信息
    for membership in historical_memberships:
        user = membership.user
        result["historical_members"].append({
            "id": user.id,
            "nickname": user.nickname,
            "display_name": user.display_name,
            "total_points": user.total_points,
            "win_rate": user.win_rate,
        })
    
    return result

def get_team_stats(db: Session, team_id: int) -> Optional[Dict[str, Any]]:
    """获取队伍统计信息"""
    from app.modules.matches import models as match_models
    
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        return None
    
    # 获取队伍参与的所有比赛
    team_matches = db.query(match_models.Match).join(
        match_models.match_participants
    ).filter(match_models.match_participants.c.team_id == team_id).all()
    
    # 计算队伍总积分
    total_points = db.query(
        db.func.coalesce(db.func.sum(match_models.Score.points), 0)
    ).filter(match_models.Score.team_id == team_id).scalar()
    
    # 计算总比赛数和获胜数
    total_matches = len(team_matches)
    total_wins = db.query(match_models.Match).filter(
        match_models.Match.winning_team_id == team_id
    ).count()
    
    # 计算胜率
    win_rate = (total_wins / total_matches) if total_matches > 0 else 0.0
    
    # 计算平均每场比赛得分
    avg_score_per_match = (total_points / total_matches) if total_matches > 0 else 0.0
    
    # 获取当前成员
    current_members = db.query(models.TeamMembership).filter(
        models.TeamMembership.team_id == team_id,
        models.TeamMembership.leave_date == None
    ).all()
    
    # 获取历史成员
    historical_members = db.query(models.TeamMembership).filter(
        models.TeamMembership.team_id == team_id,
        models.TeamMembership.leave_date != None
    ).all()
    
    # 获取最近比赛（最多5场）
    recent_matches = db.query(match_models.Match).join(
        match_models.match_participants
    ).filter(
        match_models.match_participants.c.team_id == team_id
    ).order_by(match_models.Match.created_at.desc()).limit(5).all()
    
    return {
        "team": {
            "id": team.id,
            "name": team.name,
            "color": team.color
        },
        "total_matches": total_matches,
        "total_wins": total_wins,
        "total_points": int(total_points),
        "win_rate": round(win_rate, 2),
        "average_score_per_match": round(avg_score_per_match, 2),
        "current_members": [
            {
                "user_id": member.user_id,
                "user_name": member.user.username if member.user else "Unknown",
                "join_date": member.join_date.isoformat() if member.join_date else None
            } for member in current_members
        ],
        "historical_members": [
            {
                "user_id": member.user_id,
                "user_name": member.user.username if member.user else "Unknown",
                "join_date": member.join_date.isoformat() if member.join_date else None,
                "leave_date": member.leave_date.isoformat() if member.leave_date else None
            } for member in historical_members
        ],
        "recent_matches": [
            {
                "id": match.id,
                "name": match.name,
                "status": match.status.value if match.status else None,
                "start_time": match.start_time.isoformat() if match.start_time else None,
                "is_winner": match.winning_team_id == team_id
            } for match in recent_matches
        ]
    }

def get_team_members(db: Session, team_id: int, include_historical: bool = False):
    """获取队伍成员列表"""
    query = db.query(models.TeamMembership).filter(models.TeamMembership.team_id == team_id)
    
    if not include_historical:
        query = query.filter(models.TeamMembership.leave_date == None)
    
    return query.all()

def get_team_match_history(db: Session, team_id: int, skip: int = 0, limit: int = 50):
    """获取队伍历史比赛记录"""
    from app.modules.matches import models as match_models
    
    # 获取队伍参与的比赛，按时间倒序
    matches = db.query(match_models.Match).join(
        match_models.match_participants
    ).filter(
        match_models.match_participants.c.team_id == team_id
    ).order_by(match_models.Match.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for match in matches:
        # 获取这场比赛中队伍的总得分
        team_score = db.query(
            db.func.coalesce(db.func.sum(match_models.Score.points), 0)
        ).join(match_models.MatchGame).filter(
            match_models.MatchGame.match_id == match.id,
            match_models.Score.team_id == team_id
        ).scalar()
        
        # 获取比赛中的游戏数量
        game_count = db.query(match_models.MatchGame).filter(
            match_models.MatchGame.match_id == match.id
        ).count()
        
        # 获取队伍在各个游戏中的详细表现
        game_performances = []
        match_games = db.query(match_models.MatchGame).filter(
            match_models.MatchGame.match_id == match.id
        ).order_by(match_models.MatchGame.game_order).all()
        
        for match_game in match_games:
            game_score = db.query(
                db.func.coalesce(db.func.sum(match_models.Score.points), 0)
            ).filter(
                match_models.Score.match_game_id == match_game.id,
                match_models.Score.team_id == team_id
            ).scalar()
            
            game_performances.append({
                "game_id": match_game.game_id,
                "game_name": match_game.game.name if match_game.game else "Unknown",
                "game_order": match_game.game_order,
                "team_score": int(game_score),
                "structure_type": match_game.structure_type
            })
        
        result.append({
            "match_id": match.id,
            "match_name": match.name,
            "description": match.description,
            "status": match.status.value if match.status else None,
            "start_time": match.start_time.isoformat() if match.start_time else None,
            "end_time": match.end_time.isoformat() if match.end_time else None,
            "is_winner": match.winning_team_id == team_id,
            "total_score": int(team_score),
            "game_count": game_count,
            "average_score_per_game": round(team_score / game_count, 2) if game_count > 0 else 0.0,
            "game_performances": game_performances,
            "created_at": match.created_at.isoformat() if match.created_at else None
        })
    
    return result

def create_team(db: Session, team: schemas.TeamCreate):
    """Get or Create a team."""
    db_team = db.query(models.Team).filter(models.Team.name == team.name).first()
    if db_team:
        return db_team
    db_team = models.Team(
        name=team.name,
        color=team.color
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

# --- 队伍成员关系相关的 CRUD ---

def add_team_member(db: Session, team_id: int, user_id: int):
    """向队伍中添加一个新成员"""
    # 检查是否已经是成员
    existing_membership = db.query(models.TeamMembership).filter_by(team_id=team_id, user_id=user_id, leave_date=None).first()
    if existing_membership:
        return existing_membership # 如果已经是活跃成员，则不重复添加

    db_membership = models.TeamMembership(
        team_id=team_id,
        user_id=user_id,
        join_date=datetime.datetime.utcnow()
    )
    db.add(db_membership)
    db.commit()
    db.refresh(db_membership)
    return db_membership

def remove_team_member(db: Session, team_id: int, user_id: int):
    """从队伍中移除一个成员（通过设置 leave_date 实现软删除）"""
    db_membership = db.query(models.TeamMembership).filter_by(team_id=team_id, user_id=user_id, leave_date=None).first()
    if db_membership:
        db_membership.leave_date = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_membership)
    return db_membership