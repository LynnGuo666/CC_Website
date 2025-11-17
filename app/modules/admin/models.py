# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
import enum

from app.core.db import Base


class UserRole(str, enum.Enum):
    """用户角色枚举"""
    ADMIN = "admin"  # 管理员：完全权限
    EDITOR = "editor"  # 编辑者：可以增删改查数据
    VIEWER = "viewer"  # 查看者：只能查看数据


class AdminUser(Base):
    """管理员用户模型"""
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, comment="用户名")
    email = Column(String, unique=True, index=True, comment="邮箱")
    hashed_password = Column(String, comment="加密后的密码")
    full_name = Column(String, nullable=True, comment="全名")
    api_key = Column(String, unique=True, index=True, nullable=False, comment="用于调用受限接口的 API Key")

    # 角色和权限
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, comment="用户角色")
    is_active = Column(Boolean, default=True, comment="是否激活")
    is_superuser = Column(Boolean, default=False, comment="是否超级管理员")

    # 时间戳
    created_at = Column(DateTime, default=datetime.datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, comment="更新时间")
    last_login = Column(DateTime, nullable=True, comment="最后登录时间")

    def has_permission(self, required_role: UserRole) -> bool:
        """检查用户是否有指定角色的权限"""
        if self.is_superuser:
            return True

        role_hierarchy = {
            UserRole.VIEWER: 1,
            UserRole.EDITOR: 2,
            UserRole.ADMIN: 3,
        }

        return role_hierarchy.get(self.role, 0) >= role_hierarchy.get(required_role, 0)
