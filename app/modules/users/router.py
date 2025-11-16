from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from typing import List
import httpx
import logging

from app.core.deps import get_db
from . import crud, models, schemas
from app.core.security import get_api_key

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    return crud.create_user(db=db, user=user)


@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


# --- 排行榜接口 (必须在 /{user_id} 路由之前) ---

@router.get("/leaderboard")
def get_leaderboard(
    skip: int = 0, 
    limit: int = 100, 
    game_code: str = None, 
    db: Session = Depends(get_db)
):
    """
    获取游戏等级分排行榜
    
    Args:
        skip: 跳过数量
        limit: 返回数量限制 (最大100)
        game_code: 游戏代码，如果指定则按该游戏排行，否则按综合排行
    
    Returns:
        排行榜数据
    """
    # 限制最大返回数量
    limit = min(limit, 100)
    
    leaderboard = crud.get_leaderboard(db, skip=skip, limit=limit, game_code=game_code)
    return {
        "leaderboard": leaderboard,
        "total_displayed": len(leaderboard),
        "game_code": game_code
    }

@router.get("/leaderboard/level-distribution")
def get_level_distribution(db: Session = Depends(get_db)):
    """获取等级分布统计"""
    return crud.get_level_distribution(db)

@router.get("/leaderboard/games")
def get_available_games_for_leaderboard(db: Session = Depends(get_db)):
    """获取有排行榜数据的游戏列表"""
    return {
        "games": crud.get_available_games_for_leaderboard(db)
    }


@router.get("/avatar/{identifier}/{size}")
async def get_avatar_proxy(identifier: str, size: int = 64):
    """
    头像反代接口

    当原始头像服务（mc-heads.net）无法访问时，通过后端反代获取头像

    Args:
        identifier: 用户名或用户ID
        size: 头像尺寸（默认64）

    Returns:
        头像图片流
    """
    # 限制尺寸范围，防止滥用
    size = max(8, min(size, 512))

    avatar_url = f"https://mc-heads.net/avatar/{identifier}/{size}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(avatar_url)
            response.raise_for_status()

            # 返回图片流
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "image/png"),
                headers={
                    "Cache-Control": "public, max-age=3600",  # 缓存1小时
                    "Access-Control-Allow-Origin": "*"
                }
            )
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch avatar for {identifier}: {e}")
        raise HTTPException(status_code=404, detail="Avatar not found")
    except Exception as e:
        logger.error(f"Unexpected error fetching avatar for {identifier}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch avatar")


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/{user_id}/stats", response_model=schemas.UserStats)
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """获取玩家详细统计信息，包括历史比赛数据"""
    stats = crud.get_user_stats(db, user_id=user_id)
    if not stats:
        raise HTTPException(status_code=404, detail="User not found")
    return stats


@router.get("/{user_id}/matches")
def get_user_match_history(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """获取玩家历史比赛记录"""
    history = crud.get_user_match_history(db, user_id=user_id, skip=skip, limit=limit)
    if not history:
        raise HTTPException(status_code=404, detail="User not found")
    return history


@router.get("/{user_id}/teams")
def get_user_team_history(user_id: int, db: Session = Depends(get_db)):
    """获取玩家队伍历史"""
    teams = crud.get_user_team_history(db, user_id=user_id)
    if teams is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "current_team": teams.get("current_team"),
        "historical_teams": teams.get("historical_teams", [])
    }

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """更新用户信息"""
    db_user = crud.update_user(db, user_id=user_id, user_update=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """删除用户"""
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}