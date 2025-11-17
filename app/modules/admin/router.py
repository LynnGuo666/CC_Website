# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

from app.core.deps import get_db
from app.core.security import create_access_token, get_current_active_user, require_role
from app.core.config import settings
from . import crud, schemas
from .models import UserRole

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    管理员登录
    """
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.AdminUser)
async def read_users_me(current_user: schemas.AdminUser = Depends(get_current_active_user)):
    """
    获取当前登录用户信息
    """
    return current_user


@router.get("/users", response_model=List[schemas.AdminUser])
async def list_admin_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value))
):
    """
    获取管理员用户列表（仅管理员可访问）
    """
    users = crud.get_admin_users(db, skip=skip, limit=limit)
    return users


@router.post("/users", response_model=schemas.AdminUser, status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    user: schemas.AdminUserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value))
):
    """
    创建管理员用户（仅管理员可访问）
    """
    # 检查用户名是否已存在
    db_user = crud.get_admin_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # 检查邮箱是否已存在
    db_user = crud.get_admin_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        return crud.create_admin_user(db=db, user=user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/users/{user_id}", response_model=schemas.AdminUser)
async def update_admin_user(
    user_id: int,
    user_update: schemas.AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value))
):
    """
    更新管理员用户（仅管理员可访问）
    """
    try:
        db_user = crud.update_admin_user(db, user_id, user_update)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value))
):
    """
    删除管理员用户（仅管理员可访问）
    """
    # 防止删除自己
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    success = crud.delete_admin_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

    return None
