from fastapi import FastAPI

app = FastAPI(
    title="Competition Server API",
    description="API for managing competitions, teams, and players.",
    version="0.1.0",
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Competition Server API"}

# Here we will include the routers from our modules
from app.modules.users.router import router as users_router
from app.modules.teams.router import router as teams_router
from app.modules.games.router import router as games_router
from app.modules.matches.router import router as matches_router

app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(teams_router, prefix="/teams", tags=["teams"])
app.include_router(games_router, prefix="/games", tags=["games"])
app.include_router(matches_router, prefix="/matches", tags=["matches"])