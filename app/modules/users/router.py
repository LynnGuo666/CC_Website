from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.db import SessionLocal
from . import crud, models, schemas
from app.core.security import get_api_key

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    return crud.create_user(db=db, user=user)


@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/{user_id}/stats", response_model=schemas.UserStats)
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """获取玩家详细统计信息，包括历史比赛数据"""
    stats = crud.get_user_stats(db, user_id=user_id)
    if not stats:
        raise HTTPException(status_code=404, detail="User not found")
    return stats


@router.get("/{user_id}/matches")
def get_user_match_history(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """获取玩家历史比赛记录"""
    history = crud.get_user_match_history(db, user_id=user_id, skip=skip, limit=limit)
    if not history:
        raise HTTPException(status_code=404, detail="User not found")
    return history


@router.get("/{user_id}/teams")
def get_user_team_history(user_id: int, db: Session = Depends(get_db)):
    """获取玩家队伍历史"""
    teams = crud.get_user_team_history(db, user_id=user_id)
    if teams is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "current_team": teams.get("current_team"),
        "historical_teams": teams.get("historical_teams", [])
    }