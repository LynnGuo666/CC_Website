from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    # required for sqlite
    connect_args={"check_same_thread": False},
    # 连接池配置
    pool_size=10,  # 基础连接池大小
    max_overflow=20,  # 最大溢出连接数
    pool_timeout=60,  # 连接超时时间（秒）
    pool_recycle=3600,  # 连接回收时间（秒）
    pool_pre_ping=True,  # 连接前ping检查
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()