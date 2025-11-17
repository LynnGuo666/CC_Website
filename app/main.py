from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path
import logging

from alembic import command
from alembic.config import Config

from app.core.middleware import DatabaseConnectionMiddleware
from app.core.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Competition Server API",
    description="API for managing competitions, teams, and players.",
    version=settings.BACKEND_VERSION,  # 升级版本号表示新的队伍系统
)

# 添加数据库连接池监控中间件
app.add_middleware(DatabaseConnectionMiddleware)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cc.ziip.space",
        "https://cc-mc-website.vercel.app",
        "https://api-cc.lynn6.top",
        "https://cc.lynn6.top",
        "https://championship.midnight.school",
        "https://cc.midnight.school"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法，包括OPTIONS
    allow_headers=["*"],  # 允许所有请求头
)

# 静态文件路径
FRONTEND_BUILD_DIR = Path(__file__).parent.parent / "frontend" / ".next" / "static"

# 挂载静态文件（如果存在）
if FRONTEND_BUILD_DIR.exists():
    app.mount("/_next/static", StaticFiles(directory=str(FRONTEND_BUILD_DIR)), name="static")

@app.get("/api/health")
def read_root():
    return {
        "message": "Welcome to the Competition Server API v2.0 - New Team Management System",
        "backend_version": app.version or settings.BACKEND_VERSION,
    }


@app.get("/api/version")
def get_version():
    return {"backend_version": app.version or settings.BACKEND_VERSION}

# Here we will include the routers from our modules
from app.modules.users.router import router as users_router
from app.modules.games.router import router as games_router
from app.modules.matches.router import router as matches_router
from app.modules.admin.router import router as admin_router
from app.modules.games.admin_router import router as games_admin_router
from app.modules.users.admin_router import router as users_admin_router
from app.modules.admin.import_export import router as import_export_router
from app.modules.matches.admin_router import router as matches_admin_router

app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(games_router, prefix="/api/games", tags=["games"])
app.include_router(matches_router, prefix="/api/matches", tags=["matches"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(games_admin_router, prefix="/api/admin/games", tags=["admin-games"])
app.include_router(users_admin_router, prefix="/api/admin/users", tags=["admin-users"])
app.include_router(import_export_router, prefix="/api/admin/import-export", tags=["admin-import-export"])
app.include_router(matches_admin_router, prefix="/api/admin/matches", tags=["admin-matches"])

# 注意：teams 模块已被整合到 matches 模块中
# 新的队伍管理API现在在 /matches/{match_id}/teams 下


@app.on_event("startup")
def run_migrations() -> None:
    """确保服务启动时数据库迁移到最新版本。"""
    try:
        alembic_cfg = Config(str(Path(__file__).parent.parent / "alembic.ini"))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)
        command.upgrade(alembic_cfg, "head")
    except Exception:
        logger.exception("Failed to run Alembic migrations on startup")
