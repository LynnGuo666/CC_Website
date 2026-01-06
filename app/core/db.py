from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

def _get_async_database_uri(sync_uri: str) -> str:
    if sync_uri.startswith("sqlite+aiosqlite://"):
        return sync_uri
    if sync_uri.startswith("sqlite:///"):
        return sync_uri.replace("sqlite:///", "sqlite+aiosqlite:///")
    if sync_uri.startswith("sqlite://"):
        return sync_uri.replace("sqlite://", "sqlite+aiosqlite://")
    return sync_uri


ASYNC_SQLALCHEMY_DATABASE_URI = _get_async_database_uri(settings.SQLALCHEMY_DATABASE_URI)

connect_args = {}
if ASYNC_SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

async_engine = create_async_engine(
    ASYNC_SQLALCHEMY_DATABASE_URI,
    connect_args=connect_args,
    # 优化连接池配置
    pool_size=500,  # 减少基础连接池大小
    max_overflow=0,  # 不允许溢出连接，强制复用
    pool_timeout=30,  # 减少连接超时时间
    pool_recycle=180,  # 30分钟回收连接
    pool_pre_ping=True,  # 连接前ping检查
    echo=False,  # 关闭SQL日志以提高性能
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    autoflush=False,
    expire_on_commit=False,
)

Base = declarative_base()
