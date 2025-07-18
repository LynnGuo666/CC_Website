# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session

from . import models, schemas

def get_game(db: Session, game_id: int):
    """根据 ID 查询单个比赛项目"""
    return db.query(models.Game).filter(models.Game.id == game_id).first()

def get_games(db: Session, skip: int = 0, limit: int = 100):
    """查询比赛项目列表，支持分页"""
    return db.query(models.Game).offset(skip).limit(limit).all()

def create_game(db: Session, game: schemas.GameCreate):
    """Get or Create a game."""
    db_game = db.query(models.Game).filter(models.Game.name == game.name).first()
    if db_game:
        return db_game
    db_game = models.Game(name=game.name, description=game.description)
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game