# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from . import crud, models, schemas
from app.modules.games import crud as games_crud # 引入比赛项目crud
from app.modules.users import crud as users_crud # 引入用户crud

router = APIRouter()

# 数据库会话依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 比赛接口 ---

@router.post("/", response_model=schemas.Match)
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db)):
    """创建一场新比赛"""
    # 检查关联的比赛项目是否存在
    db_game = games_crud.get_game(db, game_id=match.game_id)
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return crud.create_match(db=db, match=match)

@router.get("/", response_model=list[schemas.Match])
def read_matches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取比赛列表"""
    matches = crud.get_matches(db, skip=skip, limit=limit)
    return matches

@router.get("/{match_id}", response_model=schemas.Match)
def read_match(match_id: int, db: Session = Depends(get_db)):
    """获取单场比赛的详细信息"""
    db_match = crud.get_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

# --- 分数接口 ---

@router.post("/{match_id}/scores/", response_model=schemas.Score)
def create_score_for_match(match_id: int, score: schemas.ScoreCreate, db: Session = Depends(get_db)):
    """为指定比赛创建一条分数记录"""
    # 检查比赛和用户是否存在
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    db_user = users_crud.get_user(db, user_id=score.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return crud.create_match_score(db=db, match_id=match_id, score=score)

@router.get("/{match_id}/scores/", response_model=list[schemas.Score])
def read_scores_for_match(match_id: int, db: Session = Depends(get_db)):
    """获取指定比赛的所有分数记录"""
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return crud.get_scores_for_match(db=db, match_id=match_id)