# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session

from . import models, schemas
from app.modules.teams.models import Team # 需要引入 Team 模型来查询参赛队伍

# --- 比赛相关的 CRUD ---

def get_match(db: Session, match_id: int):
    """根据 ID 查询单场比赛"""
    return db.query(models.Match).filter(models.Match.id == match_id).first()

def get_matches(db: Session, skip: int = 0, limit: int = 100):
    """查询比赛列表，支持分页"""
    return db.query(models.Match).offset(skip).limit(limit).all()

def create_match(db: Session, match: schemas.MatchCreate):
    """创建一场新比赛"""
    # 查找所有参赛队伍的 ORM 模型
    participant_teams = db.query(Team).filter(Team.id.in_(match.participant_team_ids)).all()
    
    db_match = models.Match(
        match_type=match.match_type,
        game_id=match.game_id,
        start_time=match.start_time,
        end_time=match.end_time,
        winning_team_id=match.winning_team_id,
        participants=participant_teams # 添加参赛队伍
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

# --- 分数相关的 CRUD ---

def create_match_score(db: Session, match_id: int, score: schemas.ScoreCreate):
    """为指定比赛记录一笔分数"""
    db_score = models.Score(
        points=score.points,
        user_id=score.user_id,
        match_id=match_id
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score

def get_scores_for_match(db: Session, match_id: int):
    """获取指定比赛的所有得分记录"""
    return db.query(models.Score).filter(models.Score.match_id == match_id).all()