# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
from . import schemas
from app.modules.matches import models as matches_models

def create_live_event(db: Session, event: schemas.EventPost) -> matches_models.Score:
    """
    将一个新的直播事件作为一条分数记录存入数据库。
    """
    db_score = matches_models.Score(
        match_game_id=event.match_game_id,
        user_id=event.user_id,
        team_id=event.team_id,
        points=event.event_data.get("points", 0) # 从 event_data 中获取分数
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score