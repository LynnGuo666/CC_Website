from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from app.core.middleware import DatabaseConnectionMiddleware

app = FastAPI(
    title="Competition Server API",
    description="API for managing competitions, teams, and players.",
    version="2.0.0",  # 升级版本号表示新的队伍系统
)

# 添加数据库连接池监控中间件
app.add_middleware(DatabaseConnectionMiddleware)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js开发服务器
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
    return {"message": "Welcome to the Competition Server API v2.0 - New Team Management System"}

# Here we will include the routers from our modules
from app.modules.users.router import router as users_router
from app.modules.games.router import router as games_router
from app.modules.matches.router import router as matches_router

app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(games_router, prefix="/api/games", tags=["games"])
app.include_router(matches_router, prefix="/api/matches", tags=["matches"])

# 注意：teams 模块已被整合到 matches 模块中
# 新的队伍管理API现在在 /matches/{match_id}/teams 下