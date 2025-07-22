from fastapi import FastAPI

app = FastAPI(
    title="Competition Server API",
    description="API for managing competitions, teams, and players.",
    version="2.0.0",  # 升级版本号表示新的队伍系统
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Competition Server API v2.0 - New Team Management System"}

# Here we will include the routers from our modules
from app.modules.users.router import router as users_router
from app.modules.games.router import router as games_router
from app.modules.matches.router import router as matches_router
from app.modules.live.router import router as live_router

app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(games_router, prefix="/games", tags=["games"])
app.include_router(matches_router, prefix="/matches", tags=["matches"])
app.include_router(live_router, prefix="/live", tags=["live"])

# 注意：teams 模块已被整合到 matches 模块中
# 新的队伍管理API现在在 /matches/{match_id}/teams 下