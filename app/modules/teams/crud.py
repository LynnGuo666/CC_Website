# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
import datetime

from . import models, schemas

# --- 队伍相关的 CRUD ---

def get_team(db: Session, team_id: int):
    """根据 ID 查询单个队伍"""
    return db.query(models.Team).filter(models.Team.id == team_id).first()

def get_teams(db: Session, skip: int = 0, limit: int = 100):
    """查询队伍列表，支持分页"""
    return db.query(models.Team).offset(skip).limit(limit).all()

def create_team(db: Session, team: schemas.TeamCreate):
    """Get or Create a team."""
    db_team = db.query(models.Team).filter(models.Team.name == team.name).first()
    if db_team:
        return db_team
    db_team = models.Team(
        name=team.name,
        color=team.color,
        team_number=team.team_number
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