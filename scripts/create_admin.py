#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建初始管理员用户的脚本
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.db import SessionLocal
from app.modules.admin import crud, schemas
from app.modules.admin.models import UserRole


def create_initial_admin():
    """创建初始管理员用户"""
    db: Session = SessionLocal()

    try:
        # 检查是否已存在管理员
        existing_admin = crud.get_admin_user_by_username(db, "admin")
        if existing_admin:
            print("管理员用户已存在！")
            print(f"用户名: {existing_admin.username}")
            print(f"邮箱: {existing_admin.email}")
            return

        # 创建管理员用户
        admin_user = schemas.AdminUserCreate(
            username="admin",
            email="admin@example.com",
            password="admin123",  # 请在生产环境中修改此密码！
            full_name="系统管理员",
            role=UserRole.ADMIN
        )

        db_admin = crud.create_admin_user(db, admin_user)

        # 设置为超级管理员
        db_admin.is_superuser = True
        db.commit()

        print("✅ 初始管理员用户创建成功！")
        print(f"用户名: {db_admin.username}")
        print(f"邮箱: {db_admin.email}")
        print(f"密码: admin123")
        print("\n⚠️  请立即登录并修改默认密码！")

    except Exception as e:
        print(f"❌ 创建管理员失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_initial_admin()
