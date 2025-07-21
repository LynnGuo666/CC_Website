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

def update_game(db: Session, game_id: int, game_update: schemas.GameCreate):
    """更新比赛项目"""
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        return None
    
    db_game.name = game_update.name
    if game_update.description is not None:
        db_game.description = game_update.description
    
    db.commit()
    db.refresh(db_game)
    return db_game

def delete_game(db: Session, game_id: int):
    """删除比赛项目"""
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        return False
    
    db.delete(db_game)
    db.commit()
    return True