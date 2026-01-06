# -*- coding: utf-8 -*-
"""
比赛项目管理路由 - 需要 JWT 认证和编辑者权限
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.deps import get_db
from app.core.security import require_role
from app.modules.admin.models import UserRole
from . import crud, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Game])
async def list_games(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    获取比赛项目列表（需要登录）
    """
    return await db.run_sync(lambda sync_db: crud.get_games(sync_db, skip=skip, limit=limit))


@router.get("/{game_id}", response_model=schemas.Game)
async def get_game(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    获取单个比赛项目详情（需要登录）
    """
    db_game = await db.run_sync(crud.get_game, game_id)
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return db_game


@router.post("/", response_model=schemas.Game, status_code=status.HTTP_201_CREATED)
async def create_game(
    game: schemas.GameCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    创建比赛项目（需要编辑者权限）
    """
    return await db.run_sync(crud.create_game, game)


@router.put("/{game_id}", response_model=schemas.Game)
async def update_game(
    game_id: int,
    game: schemas.GameCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    更新比赛项目（需要编辑者权限）
    """
    db_game = await db.run_sync(lambda sync_db: crud.update_game(sync_db, game_id=game_id, game_update=game))
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return db_game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value))
):
    """
    删除比赛项目（需要管理员权限）
    """
    success = await db.run_sync(crud.delete_game, game_id)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found")
    return None
