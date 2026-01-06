# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.deps import get_db
from . import crud, models, schemas
from app.modules.users import crud as users_crud
from app.core.security import get_api_key

router = APIRouter()

# --- 比赛接口 ---

@router.post("/", response_model=schemas.Match, status_code=201)
async def create_match(match: schemas.MatchCreate, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """创建一场新比赛"""
    return await db.run_sync(lambda sync_db: crud.create_match(sync_db, match=match))

@router.get("/", response_model=List[schemas.MatchList])
async def read_matches(
    skip: int = 0, 
    limit: int = 100, 
    status: schemas.MatchStatus = None,
    db: AsyncSession = Depends(get_db)
):
    """获取比赛列表，支持按状态筛选"""
    return await db.run_sync(lambda sync_db: crud.get_matches(sync_db, skip=skip, limit=limit, status=status))

@router.get("/{match_id}", response_model=schemas.Match)
async def read_match(match_id: int, db: AsyncSession = Depends(get_db)):
    """获取单场比赛的详细信息"""
    db_match = await db.run_sync(crud.get_match, match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.get("/{match_id}/full")
async def get_match_full_data(match_id: int, db: AsyncSession = Depends(get_db)):
    """
    获取比赛的完整数据（优化：一次请求返回所有数据）

    包括：
    - 比赛基本信息
    - 所有队伍信息
    - 所有赛程及其游戏信息
    - 所有分数记录
    """
    db_match = await db.run_sync(crud.get_match, match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")

    # 获取完整数据
    full_data = await db.run_sync(crud.get_match_full_data, match_id)
    return full_data

@router.put("/{match_id}", response_model=schemas.Match)
async def update_match(
    match_id: int, 
    match_update: schemas.MatchUpdate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """更新比赛信息"""
    db_match = await db.run_sync(lambda sync_db: crud.update_match(sync_db, match_id=match_id, match_update=match_update))
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.post("/{match_id}/start", response_model=schemas.Match)
async def start_match(match_id: int, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """开始比赛"""
    db_match = await db.run_sync(crud.start_match, match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.post("/{match_id}/finish", response_model=schemas.Match)
async def finish_match(
    match_id: int, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """结束比赛"""
    db_match = await db.run_sync(crud.finish_match, match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.delete("/{match_id}")
async def delete_match(match_id: int, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """删除比赛"""
    success = await db.run_sync(crud.delete_match, match_id)
    if not success:
        raise HTTPException(status_code=404, detail="Match not found")
    return {"message": "Match deleted successfully"}

# --- 比赛队伍管理接口 ---

@router.post("/{match_id}/teams", response_model=schemas.MatchTeam, status_code=201)
async def create_match_team(
    match_id: int, 
    team: schemas.MatchTeamCreate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """为比赛创建专属队伍"""
    # 验证比赛存在
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return await db.run_sync(lambda sync_db: crud.create_match_team(sync_db, match_id=match_id, team_data=team))

@router.get("/{match_id}/teams", response_model=List[schemas.MatchTeam])
async def get_match_teams(match_id: int, db: AsyncSession = Depends(get_db)):
    """获取比赛的所有队伍"""
    return await db.run_sync(crud.get_match_teams, match_id)

@router.get("/teams/{team_id}", response_model=schemas.MatchTeamWithMatch)
async def get_match_team(team_id: int, db: AsyncSession = Depends(get_db)):
    """获取单个比赛队伍详情"""
    def _get_team(sync_db):
        db_team = crud.get_match_team(sync_db, team_id=team_id)
        if db_team is None:
            return None
        return {
            "id": db_team.id,
            "match_id": db_team.match_id,
            "name": db_team.name,
            "color": db_team.color,
            "total_score": db_team.total_score,
            "games_played": db_team.games_played,
            "created_at": db_team.created_at,
            "match_name": db_team.match.name if db_team.match else "未知比赛",
            "match_status": db_team.match.status if db_team.match else "preparing",
        }

    team_dict = await db.run_sync(_get_team)
    if team_dict is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return team_dict

@router.get("/teams/{team_id}/members", response_model=List[schemas.MatchTeamMembershipSchema])
async def get_team_members(team_id: int, db: AsyncSession = Depends(get_db)):
    """获取队伍成员列表"""
    db_team = await db.run_sync(crud.get_match_team, team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # 获取队伍成员
    members = await db.run_sync(crud.get_team_members, team_id)
    return members

@router.put("/teams/{team_id}", response_model=schemas.MatchTeam)
async def update_match_team(
    team_id: int, 
    team_update: schemas.MatchTeamUpdate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """更新比赛队伍信息"""
    db_team = await db.run_sync(lambda sync_db: crud.update_match_team(sync_db, team_id=team_id, team_update=team_update))
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.delete("/teams/{team_id}")
async def delete_match_team(team_id: int, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """删除比赛队伍"""
    success = await db.run_sync(crud.delete_match_team, team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted successfully"}

# --- 队员管理接口 ---

@router.post("/teams/{team_id}/members", response_model=schemas.TeamMember, status_code=201)
async def add_team_member(
    team_id: int, 
    member: schemas.TeamMemberCreate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """添加队员"""
    # 验证用户存在
    db_user = await db.run_sync(users_crud.get_user, member.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 验证队伍存在
    db_team = await db.run_sync(crud.get_match_team, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return await db.run_sync(lambda sync_db: crud.add_team_member(sync_db, team_id=team_id, user_id=member.user_id, role=member.role))

@router.delete("/teams/{team_id}/members/{user_id}")
async def remove_team_member(
    team_id: int, 
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """移除队员"""
    success = await db.run_sync(lambda sync_db: crud.remove_team_member(sync_db, team_id=team_id, user_id=user_id))
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member removed successfully"}

@router.put("/teams/{team_id}/members/{user_id}/role", response_model=schemas.TeamMember)
async def update_member_role(
    team_id: int, 
    user_id: int, 
    role_update: schemas.MemberRoleUpdate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """更新队员角色"""
    membership = await db.run_sync(lambda sync_db: crud.update_team_member_role(sync_db, team_id=team_id, user_id=user_id, new_role=role_update.role))
    if membership is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return membership

# --- 赛程接口 ---

@router.get("/{match_id}/games", response_model=List[schemas.MatchGame])
async def get_match_games(match_id: int, db: AsyncSession = Depends(get_db)):
    """获取指定比赛的所有赛程"""
    # 验证比赛存在
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return await db.run_sync(crud.get_match_games_by_match, match_id)

@router.post("/{match_id}/games", response_model=schemas.MatchGame, status_code=201)
async def create_match_game(
    match_id: int, 
    game: schemas.MatchGameCreate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """为比赛添加游戏赛程"""
    # 验证比赛存在
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    def _create(sync_db):
        created = crud.create_match_game(sync_db, match_id=match_id, match_game=game)
        return crud.get_match_game(sync_db, created.id)

    return await db.run_sync(_create)

@router.get("/games/{match_game_id}", response_model=schemas.MatchGame)
async def read_match_game(match_game_id: int, db: AsyncSession = Depends(get_db)):
    """获取单个赛程的详细信息"""
    db_match_game = await db.run_sync(crud.get_match_game, match_game_id)
    if db_match_game is None:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    return db_match_game

@router.put("/games/{match_game_id}", response_model=schemas.MatchGame)
async def update_match_game(
    match_game_id: int,
    game_update: schemas.MatchGameUpdate,
    db: AsyncSession = Depends(get_db),
    _admin_user = Depends(get_api_key)
):
    """更新赛程信息"""
    def _update(sync_db):
        db_match_game = crud.get_match_game(sync_db, match_game_id=match_game_id)
        if not db_match_game:
            return None, "not_found", None
        if game_update.is_live and not db_match_game.match.can_start_live:
            return None, "invalid_status", db_match_game.match.status.value
        crud.update_match_game_status(
            sync_db,
            match_game_id=match_game_id,
            is_live=game_update.is_live
        )
        refreshed = crud.get_match_game(sync_db, match_game_id=match_game_id)
        return refreshed, None, None

    db_match_game, error, match_status = await db.run_sync(_update)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="MatchGame not found")
    if error == "invalid_status":
        raise HTTPException(
            status_code=403,
            detail=f"Cannot start live stream: Match status is {match_status or 'unknown'}. Only ongoing matches support live streaming."
        )
    return db_match_game

@router.delete("/games/{match_game_id}")
async def delete_match_game(match_game_id: int, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """删除赛程"""
    success = await db.run_sync(crud.delete_match_game, match_game_id)
    if not success:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    return {"message": "MatchGame deleted successfully"}

# --- 游戏阵容管理接口 ---

@router.post("/games/{match_game_id}/lineups")
async def set_game_lineups(
    match_game_id: int, 
    lineup_setting: schemas.LineupSetting, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """设置游戏出战阵容"""
    # 验证赛程存在
    db_match_game = await db.run_sync(crud.get_match_game, match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    # 一次性设置整个赛程的阵容（函数内部会清空并重建阵容，同时做唯一性校验）
    await db.run_sync(lambda sync_db: crud.set_game_lineups(sync_db, match_game_id=match_game_id, lineup_setting=lineup_setting))
    return {"message": "Lineups set successfully"}

@router.get("/games/{match_game_id}/lineups", response_model=List[schemas.GameLineup])
async def get_game_lineups(match_game_id: int, team_id: int = None, db: AsyncSession = Depends(get_db)):
    """获取游戏出战阵容"""
    return await db.run_sync(lambda sync_db: crud.get_game_lineup(sync_db, match_game_id=match_game_id, team_id=team_id))

# --- 分数接口 ---

@router.post("/games/{match_game_id}/scores", response_model=schemas.Score, status_code=201)
async def create_score_for_match_game(
    match_game_id: int, 
    score: schemas.ScoreCreate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """为指定赛程创建一条分数记录"""
    # 检查赛程和用户是否存在
    db_match_game = await db.run_sync(crud.get_match_game, match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    db_user = await db.run_sync(users_crud.get_user, score.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return await db.run_sync(lambda sync_db: crud.create_match_score(sync_db, match_game_id=match_game_id, score=score))

@router.get("/games/{match_game_id}/scores", response_model=List[schemas.Score])
async def read_scores_for_match_game(match_game_id: int, db: AsyncSession = Depends(get_db)):
    """获取指定赛程的所有分数记录"""
    db_match_game = await db.run_sync(crud.get_match_game, match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    return await db.run_sync(crud.get_scores_for_match_game, match_game_id)

@router.delete("/scores/{score_id}")
async def delete_score(score_id: int, db: AsyncSession = Depends(get_db), _admin_user = Depends(get_api_key)):
    """删除分数记录"""
    success = await db.run_sync(crud.delete_score, score_id)
    if not success:
        raise HTTPException(status_code=404, detail="Score not found")
    return {"message": "Score deleted successfully"}

# --- 统计接口 ---

@router.get("/archived", response_model=List[schemas.MatchList])
async def get_archived_matches(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """获取已归档的比赛"""
    return await db.run_sync(lambda sync_db: crud.get_archived_matches(sync_db, skip=skip, limit=limit))

@router.get("/{match_id}/stats")
async def get_match_stats(match_id: int, db: AsyncSession = Depends(get_db)):
    """获取比赛统计数据"""
    stats = await db.run_sync(crud.get_match_stats, match_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Match not found")
    return stats

# --- 用户相关查询接口 ---

@router.get("/users/{user_id}/teams")
async def get_user_teams_in_match(match_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    """获取用户在指定比赛中的所有队伍"""
    return await db.run_sync(lambda sync_db: crud.get_user_teams_in_match(sync_db, match_id=match_id, user_id=user_id))

@router.get("/users/{user_id}/matches")
async def get_user_matches(user_id: int, db: AsyncSession = Depends(get_db)):
    """获取用户参与的所有比赛"""
    return await db.run_sync(crud.get_user_matches, user_id)

# --- 批量操作接口 ---

@router.post("/{match_id}/teams/batch", status_code=201)
async def create_teams_batch(
    match_id: int, 
    batch_create: schemas.BatchTeamCreate, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """批量创建队伍"""
    # 验证比赛存在
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    created_teams = []
    for team_data in batch_create.teams:
        created_team = await db.run_sync(lambda sync_db: crud.create_match_team(sync_db, match_id=match_id, team_data=team_data))
        created_teams.append(created_team)
    
    return {"message": f"Created {len(created_teams)} teams successfully", "teams": created_teams}

# --- 标准分管理接口 ---

@router.post("/{match_id}/standard-scores/recalculate")
async def recalculate_match_standard_scores(
    match_id: int, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """重新计算整个比赛的标准分"""
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    success = await db.run_sync(crud.recalculate_match_standard_scores, match_id)
    if success:
        return {"message": f"Successfully recalculated standard scores for match {match_id}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to recalculate standard scores")

@router.post("/games/{match_game_id}/standard-scores/recalculate")
async def recalculate_game_standard_scores(
    match_game_id: int, 
    db: AsyncSession = Depends(get_db), 
    _admin_user = Depends(get_api_key)
):
    """重新计算单个游戏的标准分"""
    db_match_game = await db.run_sync(crud.get_match_game, match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    success = await db.run_sync(crud.recalculate_game_standard_scores, match_game_id)
    if success:
        return {"message": f"Successfully recalculated standard scores for game {match_game_id}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to recalculate standard scores")


# --- Score events data ---

@router.get("/{match_id}/events")
async def get_match_events(
    match_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    获取赛事中每个赛程的细粒度记录

    优化：移除 response_model 避免 Pydantic 验证导致的性能问题
    直接返回字典，由 FastAPI 自动序列化为 JSON
    """
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return await db.run_sync(crud.get_match_events_summary, match_id)

# --- 视频管理接口 ---

@router.get("/{match_id}/videos", response_model=List[schemas.MatchVideo])
async def get_match_videos(
    match_id: int,
    video_type: Optional[str] = None,
    is_official: Optional[bool] = None,
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取比赛视频列表"""
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    return await db.run_sync(
        lambda sync_db: crud.get_match_videos(
            sync_db,
            match_id=match_id,
            video_type=video_type,
            is_official=is_official,
            platform=platform
        )
    )
