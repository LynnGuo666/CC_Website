# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
from . import models, schemas
from app.modules.teams.models import Team

# --- Match CRUD ---

def get_match(db: Session, match_id: int):
    return db.query(models.Match).filter(models.Match.id == match_id).first()

def get_matches(db: Session, skip: int = 0, limit: int = 100, status: schemas.MatchStatus = None):
    query = db.query(models.Match)
    if status:
        query = query.filter(models.Match.status == status)
    return query.offset(skip).limit(limit).all()

def update_match(db: Session, match_id: int, match_update: schemas.MatchUpdate):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    update_data = match_update.dict(exclude_unset=True)
    
    # Convert schema status to model status if present
    if 'status' in update_data and update_data['status']:
        schema_status = update_data['status']
        if schema_status == schemas.MatchStatus.PREPARING:
            update_data['status'] = models.MatchStatus.PREPARING
        elif schema_status == schemas.MatchStatus.ONGOING:
            update_data['status'] = models.MatchStatus.ONGOING
        elif schema_status == schemas.MatchStatus.FINISHED:
            update_data['status'] = models.MatchStatus.FINISHED
        elif schema_status == schemas.MatchStatus.CANCELLED:
            update_data['status'] = models.MatchStatus.CANCELLED
    
    for key, value in update_data.items():
        setattr(db_match, key, value)
    
    db.commit()
    db.refresh(db_match)
    return db_match

def start_match(db: Session, match_id: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    db_match.status = models.MatchStatus.ONGOING
    db.commit()
    db.refresh(db_match)
    return db_match

def finish_match(db: Session, match_id: int, winning_team_id: int = None):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    db_match.status = models.MatchStatus.FINISHED
    if winning_team_id:
        db_match.winning_team_id = winning_team_id
    db.commit()
    db.refresh(db_match)
    return db_match

def get_archived_matches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Match).filter(
        models.Match.status.in_([models.MatchStatus.FINISHED, models.MatchStatus.CANCELLED])
    ).offset(skip).limit(limit).all()

def get_match_stats(db: Session, match_id: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    # 这里可以添加更复杂的统计逻辑
    return {
        "match_id": match_id,
        "name": db_match.name,
        "total_teams": len(db_match.participants),
        "total_games": len(db_match.match_games)
    }

def create_match(db: Session, match: schemas.MatchCreate):
    # Convert schema status to model status
    status = models.MatchStatus.PREPARING
    if match.status:
        if match.status == schemas.MatchStatus.PREPARING:
            status = models.MatchStatus.PREPARING
        elif match.status == schemas.MatchStatus.ONGOING:
            status = models.MatchStatus.ONGOING
        elif match.status == schemas.MatchStatus.FINISHED:
            status = models.MatchStatus.FINISHED
        elif match.status == schemas.MatchStatus.CANCELLED:
            status = models.MatchStatus.CANCELLED
    
    db_match = models.Match(
        name=match.name,
        description=match.description,
        start_time=match.start_time,
        end_time=match.end_time,
        status=status,
        prize_pool=match.prize_pool,
        max_teams=match.max_teams
    )
    
    # 如果请求中包含了赛程信息，则一并创建
    if match.match_games:
        for match_game_data in match.match_games:
            db_match_game = models.MatchGame(
                game_id=match_game_data.game_id,
                game_order=getattr(match_game_data, 'game_order', 1),
                structure_type=match_game_data.structure_type,
                structure_details=match_game_data.structure_details
            )
            db_match.match_games.append(db_match_game)
    
    # 添加参赛队伍
    if match.participant_team_ids:
        for team_id in match.participant_team_ids:
            team = db.query(Team).filter(Team.id == team_id).first()
            if team:
                db_match.participants.append(team)

    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

# --- MatchGame CRUD ---

def get_match_game(db: Session, match_game_id: int):
    return db.query(models.MatchGame).filter(models.MatchGame.id == match_game_id).first()

def update_match_game_status(db: Session, match_game_id: int, is_live: bool = None):
    db_match_game = db.query(models.MatchGame).filter(models.MatchGame.id == match_game_id).first()
    if not db_match_game:
        return None
    
    if is_live is not None:
        db_match_game.is_live = is_live
    
    db.commit()
    db.refresh(db_match_game)
    return db_match_game

def create_match_game(db: Session, match_id: int, match_game: schemas.MatchGameCreate):
    db_match_game = models.MatchGame(
        match_id=match_id,
        game_id=match_game.game_id,
        game_order=match_game.game_order or 1,
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
        match_game_id=match_game_id,
        event_data=score.event_data
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

def get_scores_for_match_game(db: Session, match_game_id: int):
    return db.query(models.Score).filter(models.Score.match_game_id == match_game_id).all()