# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from . import crud, models, schemas
from app.core.security import get_api_key

router = APIRouter()

@router.post("/", response_model=schemas.Game)
async def create_game(game: schemas.GameCreate, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """创建一个新比赛项目"""
    return await db.run_sync(crud.create_game, game)

@router.get("/", response_model=list[schemas.Game])
async def read_games(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """获取比赛项目列表"""
    games = await db.run_sync(lambda sync_db: crud.get_games(sync_db, skip=skip, limit=limit))
    return games

@router.get("/{game_id}", response_model=schemas.GameDetail)
async def read_game(game_id: int, db: AsyncSession = Depends(get_db)):
    """获取单个比赛项目的详细信息（包含所属赛事）"""
    db_game = await db.run_sync(crud.get_game, game_id)
    if db_game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return db_game

@router.put("/{game_id}", response_model=schemas.Game)
async def update_game(game_id: int, game: schemas.GameCreate, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """更新比赛项目"""
    db_game = await db.run_sync(lambda sync_db: crud.update_game(sync_db, game_id=game_id, game_update=game))
    if db_game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return db_game

@router.delete("/{game_id}")
async def delete_game(game_id: int, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """删除比赛项目"""
    success = await db.run_sync(crud.delete_game, game_id)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found")
    return {"message": "Game deleted successfully"}
