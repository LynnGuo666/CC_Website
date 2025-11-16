# -*- coding: utf-8 -*-
"""
比赛项目管理路由 - 需要 JWT 认证和编辑者权限
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from app.core.security import require_role
from app.modules.admin.models import UserRole
from . import crud, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Game])
def list_games(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    获取比赛项目列表（需要登录）
    """
    return crud.get_games(db, skip=skip, limit=limit)


@router.get("/{game_id}", response_model=schemas.Game)
def get_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    获取单个比赛项目详情（需要登录）
    """
    db_game = crud.get_game(db, game_id=game_id)
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return db_game


@router.post("/", response_model=schemas.Game, status_code=status.HTTP_201_CREATED)
def create_game(
    game: schemas.GameCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    创建比赛项目（需要编辑者权限）
    """
    return crud.create_game(db=db, game=game)


@router.put("/{game_id}", response_model=schemas.Game)
def update_game(
    game_id: int,
    game: schemas.GameCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    更新比赛项目（需要编辑者权限）
    """
    db_game = crud.update_game(db, game_id=game_id, game_update=game)
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return db_game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value))
):
    """
    删除比赛项目（需要管理员权限）
    """
    success = crud.delete_game(db, game_id=game_id)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found")
    return None
