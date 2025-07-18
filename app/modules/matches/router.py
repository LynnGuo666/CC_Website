# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

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

# --- 比赛接口 ---

@router.post("/", response_model=schemas.Match, status_code=201)
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """创建一场新比赛"""
    return crud.create_match(db=db, match=match)

@router.get("/", response_model=list[schemas.Match])
def read_matches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取比赛列表"""
    return crud.get_matches(db, skip=skip, limit=limit)

@router.get("/{match_id}", response_model=schemas.Match)
def read_match(match_id: int, db: Session = Depends(get_db)):
    """获取单场比赛的详细信息"""
    db_match = crud.get_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

# --- 赛程接口 ---
# 注意：创建赛程的接口在 live 模块中，因为它与直播设置紧密相关

@router.get("/games/{match_game_id}", response_model=schemas.MatchGame)
def read_match_game(match_game_id: int, db: Session = Depends(get_db)):
    """获取单个赛程的详细信息"""
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if db_match_game is None:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    return db_match_game

# --- 分数接口 ---

@router.post("/games/{match_game_id}/scores", response_model=schemas.Score, status_code=201)
def create_score_for_match_game(
    match_game_id: int, 
    score: schemas.ScoreCreate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """为指定赛程创建一条分数记录（用于常规、非直播的数据录入）。"""
    # 检查赛程和用户是否存在
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    db_user = users_crud.get_user(db, user_id=score.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return crud.create_match_score(db=db, match_game_id=match_game_id, score=score)

@router.get("/games/{match_game_id}/scores", response_model=list[schemas.Score])
def read_scores_for_match_game(match_game_id: int, db: Session = Depends(get_db)):
    """获取指定赛程的所有分数记录"""
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    return crud.get_scores_for_match_game(db=db, match_game_id=match_game_id)