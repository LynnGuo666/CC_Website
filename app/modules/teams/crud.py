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
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        return None
    
    # TODO: 实现详细的统计逻辑
    # 这里先返回基本统计信息
    current_members = db.query(models.TeamMembership).filter(
        models.TeamMembership.team_id == team_id,
        models.TeamMembership.leave_date == None
    ).count()
    
    historical_members = db.query(models.TeamMembership).filter(
        models.TeamMembership.team_id == team_id,
        models.TeamMembership.leave_date != None
    ).count()
    
    return {
        "team": {
            "id": team.id,
            "name": team.name,
            "color": team.color
        },
        "total_matches": 0,  # TODO: 从scores表计算
        "total_wins": 0,     # TODO: 从matches表计算
        "total_points": 0,   # TODO: 从scores表计算
        "win_rate": 0.0,
        "average_score_per_match": 0.0,
        "current_members": [],
        "historical_members": [],
        "recent_matches": []
    }

def get_team_members(db: Session, team_id: int, include_historical: bool = False):
    """获取队伍成员列表"""
    query = db.query(models.TeamMembership).filter(models.TeamMembership.team_id == team_id)
    
    if not include_historical:
        query = query.filter(models.TeamMembership.leave_date == None)
    
    return query.all()

def get_team_match_history(db: Session, team_id: int, skip: int = 0, limit: int = 50):
    """获取队伍历史比赛记录"""
    # TODO: 实现队伍比赛历史查询
    # 这里先返回空列表
    return []

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