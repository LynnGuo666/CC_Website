from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path
import logging
import time

from app.core.middleware import DatabaseConnectionMiddleware
from app.core.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# 设置 uvicorn 和 fastapi 的日志级别
logging.getLogger("uvicorn").setLevel(logging.INFO)
logging.getLogger("uvicorn.access").setLevel(logging.INFO)
logging.getLogger("fastapi").setLevel(logging.INFO)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Competition Server API",
    description="API for managing competitions, teams, and players.",
    version=settings.BACKEND_VERSION,  # 升级版本号表示新的队伍系统
    redirect_slashes=False,  # 禁用自动斜杠重定向，避免 HTTPS 代理后重定向到 HTTP
)

logger.info(f"FastAPI 应用初始化完成 - 版本: {settings.BACKEND_VERSION}")

# 添加请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # 记录请求
    logger.info(f"➡️  {request.method} {request.url.path}")

    # 处理请求
    response = await call_next(request)

    # 计算处理时间
    process_time = time.time() - start_time

    # 记录响应
    logger.info(f"⬅️  {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")

    return response

# 添加数据库连接池监控中间件
app.add_middleware(DatabaseConnectionMiddleware)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 放行所有来源
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
from app.modules.config.router import router as config_router

app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(games_router, prefix="/api/games", tags=["games"])
app.include_router(matches_router, prefix="/api/matches", tags=["matches"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(games_admin_router, prefix="/api/admin/games", tags=["admin-games"])
app.include_router(users_admin_router, prefix="/api/admin/users", tags=["admin-users"])
app.include_router(import_export_router, prefix="/api/admin/import-export", tags=["admin-import-export"])
app.include_router(matches_admin_router, prefix="/api/admin/matches", tags=["admin-matches"])
app.include_router(config_router, prefix="/api", tags=["config"])

# 注意：teams 模块已被整合到 matches 模块中
# 新的队伍管理API现在在 /matches/{match_id}/teams 下


@app.on_event("startup")
def start_background_tasks():
    """启动后台定时任务"""
    from app.core.scheduler import start_scheduler
    try:
        start_scheduler()
        logger.info("✅ 后台定时任务已启动")
    except Exception:
        logger.exception("Failed to start background tasks")


@app.on_event("startup")
def startup_complete():
    """启动完成"""
    logger.info("=" * 60)
    logger.info("🚀 Competition Server API 启动完成！")
    logger.info(f"📦 版本: {settings.BACKEND_VERSION}")
    logger.info(f"🗄️  数据库: {settings.SQLALCHEMY_DATABASE_URI}")
    logger.info("📝 HTTP 请求日志已启用")
    logger.info("=" * 60)


@app.on_event("shutdown")
def shutdown_background_tasks():
    """关闭后台定时任务"""
    from app.core.scheduler import shutdown_scheduler
    try:
        shutdown_scheduler()
        logger.info("后台定时任务已关闭")
    except Exception:
        logger.exception("Failed to shutdown background tasks")
