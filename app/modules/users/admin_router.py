# -*- coding: utf-8 -*-
"""
选手管理路由 - 需要 JWT 认证和编辑者权限
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.deps import get_db
from app.core.security import require_role
from app.modules.admin.models import UserRole
from . import crud, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    获取选手列表（需要登录）
    """
    return await db.run_sync(lambda sync_db: crud.get_users(sync_db, skip=skip, limit=limit))


@router.get("/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    获取单个选手详情（需要登录）
    """
    db_user = await db.run_sync(crud.get_user, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    创建选手（需要编辑者权限）
    """
    return await db.run_sync(crud.create_user, user)


@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    更新选手信息（需要编辑者权限）
    """
    db_user = await db.run_sync(lambda sync_db: crud.update_user(sync_db, user_id=user_id, user_update=user))
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value))
):
    """
    删除选手（需要管理员权限）
    """
    success = await db.run_sync(crud.delete_user, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return None
