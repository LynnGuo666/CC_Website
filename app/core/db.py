from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    # required for sqlite
    connect_args={"check_same_thread": False},
    # 优化连接池配置
    pool_size=5,  # 减少基础连接池大小
    max_overflow=0,  # 不允许溢出连接，强制复用
    pool_timeout=30,  # 减少连接超时时间
    pool_recycle=1800,  # 30分钟回收连接
    pool_pre_ping=True,  # 连接前ping检查
    echo=False,  # 关闭SQL日志以提高性能
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()