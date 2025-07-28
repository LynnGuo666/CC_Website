# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from . import crud, models, schemas
from app.modules.users import crud as users_crud
from app.core.security import get_api_key

router = APIRouter()

# --- 比赛接口 ---

@router.post("/", response_model=schemas.Match, status_code=201)
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """创建一场新比赛"""
    return crud.create_match(db=db, match=match)

@router.get("/", response_model=List[schemas.MatchList])
def read_matches(
    skip: int = 0, 
    limit: int = 100, 
    status: schemas.MatchStatus = None,
    db: Session = Depends(get_db)
):
    """获取比赛列表，支持按状态筛选"""
    return crud.get_matches(db, skip=skip, limit=limit, status=status)

@router.get("/{match_id}", response_model=schemas.Match)
def read_match(match_id: int, db: Session = Depends(get_db)):
    """获取单场比赛的详细信息"""
    db_match = crud.get_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.put("/{match_id}", response_model=schemas.Match)
def update_match(
    match_id: int, 
    match_update: schemas.MatchUpdate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """更新比赛信息"""
    db_match = crud.update_match(db, match_id=match_id, match_update=match_update)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.post("/{match_id}/start", response_model=schemas.Match)
def start_match(match_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """开始比赛"""
    db_match = crud.start_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.post("/{match_id}/finish", response_model=schemas.Match)
def finish_match(
    match_id: int, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """结束比赛"""
    db_match = crud.finish_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.delete("/{match_id}")
def delete_match(match_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """删除比赛"""
    success = crud.delete_match(db, match_id=match_id)
    if not success:
        raise HTTPException(status_code=404, detail="Match not found")
    return {"message": "Match deleted successfully"}

# --- 比赛队伍管理接口 ---

@router.post("/{match_id}/teams", response_model=schemas.MatchTeam, status_code=201)
def create_match_team(
    match_id: int, 
    team: schemas.MatchTeamCreate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """为比赛创建专属队伍"""
    # 验证比赛存在
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return crud.create_match_team(db=db, match_id=match_id, team_data=team)

@router.get("/{match_id}/teams", response_model=List[schemas.MatchTeam])
def get_match_teams(match_id: int, db: Session = Depends(get_db)):
    """获取比赛的所有队伍"""
    return crud.get_match_teams(db, match_id=match_id)

@router.get("/teams/{team_id}", response_model=schemas.MatchTeam)
def get_match_team(team_id: int, db: Session = Depends(get_db)):
    """获取单个比赛队伍详情"""
    db_team = crud.get_match_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.get("/teams/{team_id}/members", response_model=List[schemas.MatchTeamMembershipSchema])
def get_team_members(team_id: int, db: Session = Depends(get_db)):
    """获取队伍成员列表"""
    db_team = crud.get_match_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # 获取队伍成员
    members = crud.get_team_members(db, team_id=team_id)
    return members

@router.put("/teams/{team_id}", response_model=schemas.MatchTeam)
def update_match_team(
    team_id: int, 
    team_update: schemas.MatchTeamUpdate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """更新比赛队伍信息"""
    db_team = crud.update_match_team(db, team_id=team_id, team_update=team_update)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.delete("/teams/{team_id}")
def delete_match_team(team_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """删除比赛队伍"""
    success = crud.delete_match_team(db, team_id=team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted successfully"}

# --- 队员管理接口 ---

@router.post("/teams/{team_id}/members", response_model=schemas.TeamMember, status_code=201)
def add_team_member(
    team_id: int, 
    member: schemas.TeamMemberCreate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """添加队员"""
    # 验证用户存在
    db_user = users_crud.get_user(db, user_id=member.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 验证队伍存在
    db_team = crud.get_match_team(db, team_id=team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return crud.add_team_member(db=db, team_id=team_id, user_id=member.user_id, role=member.role)

@router.delete("/teams/{team_id}/members/{user_id}")
def remove_team_member(
    team_id: int, 
    user_id: int, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """移除队员"""
    success = crud.remove_team_member(db, team_id=team_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member removed successfully"}

@router.put("/teams/{team_id}/members/{user_id}/role", response_model=schemas.TeamMember)
def update_member_role(
    team_id: int, 
    user_id: int, 
    role_update: schemas.MemberRoleUpdate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """更新队员角色"""
    membership = crud.update_team_member_role(db, team_id=team_id, user_id=user_id, new_role=role_update.role)
    if membership is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return membership

# --- 赛程接口 ---

@router.get("/{match_id}/games", response_model=List[schemas.MatchGame])
def get_match_games(match_id: int, db: Session = Depends(get_db)):
    """获取指定比赛的所有赛程"""
    # 验证比赛存在
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return crud.get_match_games_by_match(db, match_id=match_id)

@router.post("/{match_id}/games", response_model=schemas.MatchGame, status_code=201)
def create_match_game(
    match_id: int, 
    game: schemas.MatchGameCreate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """为比赛添加游戏赛程"""
    # 验证比赛存在
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return crud.create_match_game(db=db, match_id=match_id, match_game=game)

@router.get("/games/{match_game_id}", response_model=schemas.MatchGame)
def read_match_game(match_game_id: int, db: Session = Depends(get_db)):
    """获取单个赛程的详细信息"""
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if db_match_game is None:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    return db_match_game

@router.put("/games/{match_game_id}", response_model=schemas.MatchGame)
def update_match_game(
    match_game_id: int,
    game_update: schemas.MatchGameUpdate,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_api_key)
):
    """更新赛程信息"""
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    # 如果要开启直播，验证比赛状态
    if game_update.is_live and not db_match_game.match.can_start_live:
        raise HTTPException(
            status_code=403, 
            detail=f"Cannot start live stream: Match status is {db_match_game.match.status.value}. Only ongoing matches support live streaming."
        )
    
    db_match_game = crud.update_match_game_status(
        db, 
        match_game_id=match_game_id, 
        is_live=game_update.is_live
    )
    return db_match_game

@router.delete("/games/{match_game_id}")
def delete_match_game(match_game_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """删除赛程"""
    success = crud.delete_match_game(db, match_game_id=match_game_id)
    if not success:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    return {"message": "MatchGame deleted successfully"}

# --- 游戏阵容管理接口 ---

@router.post("/games/{match_game_id}/lineups")
def set_game_lineups(
    match_game_id: int, 
    lineup_setting: schemas.LineupSetting, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """设置游戏出战阵容"""
    # 验证赛程存在
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    # 为每个队伍设置阵容
    for team_id, player_ids in lineup_setting.team_lineups.items():
        crud.set_game_lineup(
            db=db, 
            match_game_id=match_game_id, 
            team_id=team_id, 
            player_ids=player_ids,
            substitute_info=lineup_setting.substitute_info
        )
    
    return {"message": "Lineups set successfully"}

@router.get("/games/{match_game_id}/lineups", response_model=List[schemas.GameLineup])
def get_game_lineups(match_game_id: int, team_id: int = None, db: Session = Depends(get_db)):
    """获取游戏出战阵容"""
    return crud.get_game_lineup(db, match_game_id=match_game_id, team_id=team_id)

# --- 分数接口 ---

@router.post("/games/{match_game_id}/scores", response_model=schemas.Score, status_code=201)
def create_score_for_match_game(
    match_game_id: int, 
    score: schemas.ScoreCreate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """为指定赛程创建一条分数记录"""
    # 检查赛程和用户是否存在
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    db_user = users_crud.get_user(db, user_id=score.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return crud.create_match_score(db=db, match_game_id=match_game_id, score=score)

@router.get("/games/{match_game_id}/scores", response_model=List[schemas.Score])
def read_scores_for_match_game(match_game_id: int, db: Session = Depends(get_db)):
    """获取指定赛程的所有分数记录"""
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    return crud.get_scores_for_match_game(db=db, match_game_id=match_game_id)

@router.delete("/scores/{score_id}")
def delete_score(score_id: int, db: Session = Depends(get_db), api_key: str = Depends(get_api_key)):
    """删除分数记录"""
    success = crud.delete_score(db, score_id=score_id)
    if not success:
        raise HTTPException(status_code=404, detail="Score not found")
    return {"message": "Score deleted successfully"}

# --- 统计接口 ---

@router.get("/archived", response_model=List[schemas.MatchList])
def get_archived_matches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取已归档的比赛"""
    return crud.get_archived_matches(db, skip=skip, limit=limit)

@router.get("/{match_id}/stats")
def get_match_stats(match_id: int, db: Session = Depends(get_db)):
    """获取比赛统计数据"""
    stats = crud.get_match_stats(db, match_id=match_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Match not found")
    return stats

# --- 用户相关查询接口 ---

@router.get("/users/{user_id}/teams")
def get_user_teams_in_match(match_id: int, user_id: int, db: Session = Depends(get_db)):
    """获取用户在指定比赛中的所有队伍"""
    return crud.get_user_teams_in_match(db, match_id=match_id, user_id=user_id)

@router.get("/users/{user_id}/matches")
def get_user_matches(user_id: int, db: Session = Depends(get_db)):
    """获取用户参与的所有比赛"""
    return crud.get_user_matches(db, user_id=user_id)

# --- 批量操作接口 ---

@router.post("/{match_id}/teams/batch", status_code=201)
def create_teams_batch(
    match_id: int, 
    batch_create: schemas.BatchTeamCreate, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """批量创建队伍"""
    # 验证比赛存在
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    created_teams = []
    for team_data in batch_create.teams:
        created_team = crud.create_match_team(db=db, match_id=match_id, team_data=team_data)
        created_teams.append(created_team)
    
    return {"message": f"Created {len(created_teams)} teams successfully", "teams": created_teams}

# --- 标准分管理接口 ---

@router.post("/{match_id}/standard-scores/recalculate")
def recalculate_match_standard_scores(
    match_id: int, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """重新计算整个比赛的标准分"""
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    success = crud.recalculate_match_standard_scores(db, match_id=match_id)
    if success:
        return {"message": f"Successfully recalculated standard scores for match {match_id}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to recalculate standard scores")

@router.post("/games/{match_game_id}/standard-scores/recalculate")
def recalculate_game_standard_scores(
    match_game_id: int, 
    db: Session = Depends(get_db), 
    api_key: str = Depends(get_api_key)
):
    """重新计算单个游戏的标准分"""
    db_match_game = crud.get_match_game(db, match_game_id=match_game_id)
    if not db_match_game:
        raise HTTPException(status_code=404, detail="MatchGame not found")
    
    success = crud.recalculate_game_standard_scores(db, match_game_id=match_game_id)
    if success:
        return {"message": f"Successfully recalculated standard scores for game {match_game_id}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to recalculate standard scores")