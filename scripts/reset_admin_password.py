#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重置指定管理员账号密码的辅助脚本。

Usage:
    .venv/bin/python scripts/reset_admin_password.py --username admin --password newpass
"""
import argparse
import sys
from pathlib import Path

# 确保可以导入项目模块
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.modules.admin import crud


def reset_password(username: str, new_password: str) -> None:
    """将指定管理员账号的密码重置为 new_password。"""
    db: Session = SessionLocal()
    try:
        user = crud.get_admin_user_by_username(db, username)
        if not user:
            print(f"❌ 用户 '{username}' 不存在")
            return

        user.hashed_password = crud.get_password_hash(new_password)
        db.commit()
        print("✅ 密码重置成功")
        print(f"用户名: {username}")
        print(f"新密码: {new_password}")
    except Exception as exc:
        db.rollback()
        print(f"❌ 重置失败: {exc}")
        raise
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="重置管理员密码")
    parser.add_argument("--username", required=True, help="需要重置的管理员用户名")
    parser.add_argument("--password", required=True, help="新的登录密码")
    args = parser.parse_args()

    reset_password(args.username, args.password)


if __name__ == "__main__":
    main()
