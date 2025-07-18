# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from . import crud, models, schemas
from app.core.security import get_api_key

router = APIRouter()

# 数据库会话依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Game)
def create_game(game: schemas.GameCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """创建一个新比赛项目"""
    return crud.create_game(db=db, game=game)

@router.get("/", response_model=list[schemas.Game])
def read_games(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取比赛项目列表"""
    games = crud.get_games(db, skip=skip, limit=limit)
    return games

@router.get("/{game_id}", response_model=schemas.Game)
def read_game(game_id: int, db: Session = Depends(get_db)):
    """获取单个比赛项目的详细信息"""
    db_game = crud.get_game(db, game_id=game_id)
    if db_game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return db_game