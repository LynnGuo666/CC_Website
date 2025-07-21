# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.db import SessionLocal
from . import crud, models, schemas
from app.modules.users import crud as users_crud
from app.core.security import get_api_key

router = APIRouter()

# 数据库会话依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 队伍接口 ---

@router.post("/", response_model=schemas.Team)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """创建一个新队伍"""
    return crud.create_team(db=db, team=team)

@router.get("/", response_model=List[schemas.Team])
def read_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取队伍列表"""
    teams = crud.get_teams(db, skip=skip, limit=limit)
    return teams

@router.get("/{team_id}", response_model=schemas.TeamWithMembers)
def read_team(team_id: int, db: Session = Depends(get_db)):
    """获取单个队伍的详细信息，包括成员列表"""
    db_team = crud.get_team_with_members(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.get("/{team_id}/stats", response_model=schemas.TeamStats)
def get_team_stats(team_id: int, db: Session = Depends(get_db)):
    """获取队伍统计信息"""
    stats = crud.get_team_stats(db, team_id=team_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Team not found")
    return stats

# --- 队伍成员接口 ---

@router.post("/{team_id}/members/{user_id}", response_model=schemas.TeamMembership)
def add_team_member(team_id: int, user_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """向队伍中添加一个成员"""
    # 检查队伍和用户是否存在
    db_team = crud.get_team(db, team_id=team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    db_user = users_crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return crud.add_team_member(db=db, team_id=team_id, user_id=user_id)

@router.delete("/{team_id}/members/{user_id}", response_model=schemas.TeamMembership)
def remove_team_member(team_id: int, user_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """从队伍中移除一个成员"""
    # 检查队伍和用户是否存在
    db_team = crud.get_team(db, team_id=team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    db_user = users_crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return crud.remove_team_member(db=db, team_id=team_id, user_id=user_id)

@router.get("/{team_id}/members", response_model=List[schemas.TeamMembership])
def get_team_members(team_id: int, include_historical: bool = False, db: Session = Depends(get_db)):
    """获取队伍成员列表"""
    db_team = crud.get_team(db, team_id=team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return crud.get_team_members(db=db, team_id=team_id, include_historical=include_historical)

@router.get("/{team_id}/matches")
def get_team_match_history(team_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """获取队伍历史比赛记录"""
    history = crud.get_team_match_history(db, team_id=team_id, skip=skip, limit=limit)
    if not history:
        raise HTTPException(status_code=404, detail="Team not found")
    return history