# -*- coding: utf-8 -*-
from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime
from .models import UserRole


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None


# Admin User schemas
class AdminUserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.VIEWER


class AdminUserCreate(AdminUserBase):
    password: str


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class AdminUser(AdminUserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime.datetime
    last_login: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


# Login schema
class LoginRequest(BaseModel):
    username: str
    password: str
