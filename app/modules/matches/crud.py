# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
from . import models, schemas

# --- Match CRUD ---

def get_match(db: Session, match_id: int):
    return db.query(models.Match).filter(models.Match.id == match_id).first()

def get_matches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Match).offset(skip).limit(limit).all()

def create_match(db: Session, match: schemas.MatchCreate):
    db_match = models.Match(
        name=match.name,
        start_time=match.start_time,
        end_time=match.end_time,
        winning_team_id=match.winning_team_id
    )
    
    # 如果请求中包含了赛程信息，则一并创建
    if match.match_games:
        for match_game_data in match.match_games:
            db_match_game = models.MatchGame(
                game_id=match_game_data.game_id,
                structure_type=match_game_data.structure_type,
                structure_details=match_game_data.structure_details
            )
            db_match.match_games.append(db_match_game)

    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

# --- MatchGame CRUD ---

def get_match_game(db: Session, match_game_id: int):
    return db.query(models.MatchGame).filter(models.MatchGame.id == match_game_id).first()

def create_match_game(db: Session, match_id: int, match_game: schemas.MatchGameCreate):
    db_match_game = models.MatchGame(
        match_id=match_id,
        game_id=match_game.game_id,
        structure_type=match_game.structure_type,
        structure_details=match_game.structure_details
    )
    db.add(db_match_game)
    db.commit()
    db.refresh(db_match_game)
    return db_match_game

# --- Score CRUD ---

def create_match_score(db: Session, match_game_id: int, score: schemas.ScoreCreate):
    db_score = models.Score(
        points=score.points,
        user_id=score.user_id,
        team_id=score.team_id,
        match_game_id=match_game_id
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

def get_scores_for_match_game(db: Session, match_game_id: int):
    return db.query(models.Score).filter(models.Score.match_game_id == match_game_id).all()