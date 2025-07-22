# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.db import SessionLocal
from app.core.security import get_api_key
from . import crud, schemas
from .websocket import manager
from app.modules.matches import crud as matches_crud
from app.modules.matches import models as matches_models
from app.modules.matches import schemas as matches_schemas

router = APIRouter()

# 数据库会话依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/matches/{match_id}/games", response_model=matches_schemas.MatchGame, status_code=201)
def create_match_game(
    match_id: int,
    match_game: matches_schemas.MatchGameCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """
    为指定比赛创建一个新的赛程（例如，添加一个比赛项目并定义其结构）。
    """
    db_match = matches_crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return matches_crud.create_match_game(db=db, match_id=match_id, match_game=match_game)

@router.post("/events", status_code=202)
async def create_live_event(
    event: schemas.EventPost, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """
    接收赛事服务器上报的实时事件。
    """
    # 1. 将事件作为分数记录存入数据库
    score_record = crud.create_live_event(db=db, event=event)
    match_game = score_record.match_game
    if not match_game:
        return {"message": "Event for non-existent match_game received, ignored."}

    # 2. 计算当前赛程的子项目得分 - 使用新的MatchTeam系统
    sub_scores_query = db.query(
        matches_models.Score.team_id,
        matches_models.MatchTeam.name,
        func.sum(matches_models.Score.points).label("sub_total")
    ).join(matches_models.MatchTeam).filter(
        matches_models.Score.match_game_id == event.match_game_id
    ).group_by(
        matches_models.Score.team_id, matches_models.MatchTeam.name
    ).order_by(func.sum(matches_models.Score.points).desc()).all()

    sub_scores = [
        schemas.TeamSubScore(team_id=row.team_id, team_name=row.name, score=row.sub_total)
        for row in sub_scores_query
    ]

    # 3. 计算整个比赛的总积分榜 - 使用新的MatchTeam系统
    total_scores_query = db.query(
        matches_models.Score.team_id,
        matches_models.MatchTeam.name,
        func.sum(matches_models.Score.points).label("total")
    ).join(matches_models.MatchGame).join(
        matches_models.MatchTeam, 
        matches_models.Score.team_id == matches_models.MatchTeam.id
    ).filter(
        matches_models.MatchGame.match_id == match_game.match_id
    ).group_by(
        matches_models.Score.team_id, matches_models.MatchTeam.name
    ).order_by(
        func.sum(matches_models.Score.points).desc()
    ).all()

    total_leaderboard = [
        schemas.TeamTotalScore(rank=i+1, team_id=row.team_id, team_name=row.name, total_points=row.total)
        for i, row in enumerate(total_scores_query)
    ]

    # 4. 构造完整的 LiveUpdate 数据包
    live_update_data = {
        "match_id": match_game.match_id,
        "match_name": match_game.match.name,
        "total_leaderboard": [board.dict() for board in total_leaderboard],
        "current_match_game": {
            "match_game_id": match_game.id,
            "game_name": match_game.game.name,
            "structure_type": match_game.structure_type,
            "teams": [score.dict() for score in sub_scores]
        },
        "last_event": {
            "match_game_id": match_game.id,
            "user_id": event.user_id,
            "description": f"Team {event.team_id} scored {event.event_data.get('points', 0)} points."
        }
    }
    
    # 5. 使用后台任务进行广播
    background_tasks.add_task(manager.broadcast, match_game.match_id, live_update_data)
    
    return {"message": "Event received"}


@router.websocket("/ws/live/{match_id}")
async def websocket_endpoint(websocket: WebSocket, match_id: int):
    """
    处理客户端的 WebSocket 连接。
    """
    await manager.connect(websocket, match_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)