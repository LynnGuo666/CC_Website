"""
数据库和其他依赖项的统一管理
"""
from sqlalchemy.orm import Session
from app.core.db import SessionLocal


def get_db():
    """获取数据库会话的依赖函数"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
