# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy import func, text
from . import models, schemas
from .standard_score import calculate_standard_scores_for_match_game
from typing import List, Optional

# --- Match CRUD ---

def get_match(db: Session, match_id: int):
    return db.query(models.Match).filter(models.Match.id == match_id).first()

def get_matches(db: Session, skip: int = 0, limit: int = 100, status: schemas.MatchStatus = None):
    query = db.query(models.Match)
    if status:
        query = query.filter(models.Match.status == status)
    
    # 按开赛时间倒序排序：有开赛时间的在前，按时间倒序；没有开赛时间的在后，按创建时间降序
    query = query.order_by(
        models.Match.start_time.desc().nulls_last(),
        models.Match.created_at.desc()
    )
    
    return query.offset(skip).limit(limit).all()

def create_match(db: Session, match: schemas.MatchCreate):
    # Convert schema status to model status
    status = models.MatchStatus.PREPARING
    if match.status:
        if match.status == schemas.MatchStatus.PREPARING:
            status = models.MatchStatus.PREPARING
        elif match.status == schemas.MatchStatus.ONGOING:
            status = models.MatchStatus.ONGOING
        elif match.status == schemas.MatchStatus.FINISHED:
            status = models.MatchStatus.FINISHED
        elif match.status == schemas.MatchStatus.CANCELLED:
            status = models.MatchStatus.CANCELLED
    
    db_match = models.Match(
        name=match.name,
        description=match.description,
        start_time=match.start_time,
        end_time=match.end_time,
        status=status,
        prize_pool=match.prize_pool,
        max_teams=match.max_teams,
        max_players_per_team=match.max_players_per_team or 4,
        allow_substitutes=match.allow_substitutes if match.allow_substitutes is not None else True
    )
    
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    
    # 如果请求中包含了赛程信息，则一并创建
    if match.match_games:
        for match_game_data in match.match_games:
            db_match_game = models.MatchGame(
                match_id=db_match.id,
                game_id=match_game_data.game_id,
                game_order=getattr(match_game_data, 'game_order', 1),
                structure_type=match_game_data.structure_type,
                structure_details=match_game_data.structure_details,
                multiplier=match_game_data.multiplier
            )
            db.add(db_match_game)
    
    db.commit()
    db.refresh(db_match)
    return db_match

def update_match(db: Session, match_id: int, match_update: schemas.MatchUpdate):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    update_data = match_update.dict(exclude_unset=True)
    
    # Convert schema status to model status if present
    if 'status' in update_data and update_data['status']:
        schema_status = update_data['status']
        if schema_status == schemas.MatchStatus.PREPARING:
            update_data['status'] = models.MatchStatus.PREPARING
        elif schema_status == schemas.MatchStatus.ONGOING:
            update_data['status'] = models.MatchStatus.ONGOING
        elif schema_status == schemas.MatchStatus.FINISHED:
            update_data['status'] = models.MatchStatus.FINISHED
        elif schema_status == schemas.MatchStatus.CANCELLED:
            update_data['status'] = models.MatchStatus.CANCELLED
    
    for key, value in update_data.items():
        setattr(db_match, key, value)
    
    db.commit()
    db.refresh(db_match)
    return db_match

def start_match(db: Session, match_id: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    db_match.status = models.MatchStatus.ONGOING
    db.commit()
    db.refresh(db_match)
    return db_match

def finish_match(db: Session, match_id: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    db_match.status = models.MatchStatus.FINISHED
    db.commit()
    db.refresh(db_match)
    return db_match

def delete_match(db: Session, match_id: int):
    """删除比赛"""
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return False
    
    db.delete(db_match)
    db.commit()
    return True

# --- MatchTeam CRUD ---

def create_match_team(db: Session, match_id: int, team_data: schemas.MatchTeamCreate):
    """创建比赛专属队伍"""
    db_team = models.MatchTeam(
        match_id=match_id,
        name=team_data.name,
        color=team_data.color
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    # 添加队员
    if team_data.members:
        for member in team_data.members:
            membership = models.MatchTeamMembership(
                match_team_id=db_team.id,
                user_id=member.user_id,
                role=models.MemberRole(member.role) if member.role else models.MemberRole.MAIN
            )
            db.add(membership)
    
    db.commit()
    db.refresh(db_team)
    return db_team

def get_match_teams(db: Session, match_id: int):
    """获取比赛的所有队伍"""
    return db.query(models.MatchTeam).filter(models.MatchTeam.match_id == match_id).all()

def get_match_team(db: Session, team_id: int):
    """获取单个比赛队伍"""
    return db.query(models.MatchTeam).filter(models.MatchTeam.id == team_id).first()

def get_team_members(db: Session, team_id: int):
    """获取队伍成员列表"""
    return db.query(models.MatchTeamMembership).filter(
        models.MatchTeamMembership.match_team_id == team_id
    ).all()

def update_match_team(db: Session, team_id: int, team_update: schemas.MatchTeamUpdate):
    """更新比赛队伍信息"""
    db_team = db.query(models.MatchTeam).filter(models.MatchTeam.id == team_id).first()
    if not db_team:
        return None
    
    update_data = team_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key != 'members':  # 队员单独处理
            setattr(db_team, key, value)
    
    db.commit()
    db.refresh(db_team)
    return db_team

def add_team_member(db: Session, team_id: int, user_id: int, role: str = "main"):
    """添加队员"""
    membership = models.MatchTeamMembership(
        match_team_id=team_id,
        user_id=user_id,
        role=models.MemberRole(role)
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership

def remove_team_member(db: Session, team_id: int, user_id: int):
    """移除队员"""
    membership = db.query(models.MatchTeamMembership).filter(
        models.MatchTeamMembership.match_team_id == team_id,
        models.MatchTeamMembership.user_id == user_id
    ).first()
    
    if membership:
        db.delete(membership)
        db.commit()
        return True
    return False

def update_team_member_role(db: Session, team_id: int, user_id: int, new_role: str):
    """更新队员角色"""
    membership = db.query(models.MatchTeamMembership).filter(
        models.MatchTeamMembership.match_team_id == team_id,
        models.MatchTeamMembership.user_id == user_id
    ).first()
    
    if membership:
        membership.role = models.MemberRole(new_role)
        db.commit()
        db.refresh(membership)
        return membership
    return None

def delete_match_team(db: Session, team_id: int):
    """删除比赛队伍"""
    db_team = db.query(models.MatchTeam).filter(models.MatchTeam.id == team_id).first()
    if not db_team:
        return False
    
    db.delete(db_team)
    db.commit()
    return True

# --- MatchGame CRUD ---

def get_match_game(db: Session, match_game_id: int):
    return db.query(models.MatchGame).filter(models.MatchGame.id == match_game_id).first()

def get_match_games_by_match(db: Session, match_id: int):
    return db.query(models.MatchGame).filter(models.MatchGame.match_id == match_id).order_by(models.MatchGame.game_order).all()

def create_match_game(db: Session, match_id: int, match_game: schemas.MatchGameCreate):
    db_match_game = models.MatchGame(
        match_id=match_id,
        game_id=match_game.game_id,
        game_order=match_game.game_order or 1,
        structure_type=match_game.structure_type,
        structure_details=match_game.structure_details
    )
    db.add(db_match_game)
    db.commit()
    db.refresh(db_match_game)
    return db_match_game

def update_match_game_status(db: Session, match_game_id: int, is_live: bool = None):
    db_match_game = db.query(models.MatchGame).filter(models.MatchGame.id == match_game_id).first()
    if not db_match_game:
        return None
    
    if is_live is not None:
        db_match_game.is_live = is_live
    
    db.commit()
    db.refresh(db_match_game)
    return db_match_game

def delete_match_game(db: Session, match_game_id: int):
    """删除赛程"""
    db_match_game = db.query(models.MatchGame).filter(models.MatchGame.id == match_game_id).first()
    if not db_match_game:
        return False
    
    db.delete(db_match_game)
    db.commit()
    return True

# --- GameLineup CRUD ---

def set_game_lineup(db: Session, match_game_id: int, team_id: int, player_ids: List[int], substitute_info: dict = None):
    """设置某个游戏的出战阵容"""
    # 清除该队伍在这个游戏的现有阵容
    db.query(models.GameLineup).filter(
        models.GameLineup.match_game_id == match_game_id,
        models.GameLineup.match_team_id == team_id
    ).delete()
    
    # 添加新阵容
    for i, user_id in enumerate(player_ids):
        lineup = models.GameLineup(
            match_game_id=match_game_id,
            match_team_id=team_id,
            user_id=user_id,
            is_starting=True,
            substitute_reason=substitute_info.get(str(user_id)) if substitute_info else None
        )
        db.add(lineup)
    
    db.commit()

def get_game_lineup(db: Session, match_game_id: int, team_id: int = None):
    """获取游戏阵容"""
    query = db.query(models.GameLineup).filter(models.GameLineup.match_game_id == match_game_id)
    if team_id:
        query = query.filter(models.GameLineup.match_team_id == team_id)
    return query.all()

# --- Score CRUD ---

def create_match_score(db: Session, match_game_id: int, score: schemas.ScoreCreate):
    db_score = models.Score(
        points=score.points,
        user_id=score.user_id,
        match_team_id=score.team_id,  # 现在使用match_team_id
        match_game_id=match_game_id,
        event_data=score.event_data
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    
    # 自动计算该游戏的标准分
    calculate_standard_scores_for_match_game(db, match_game_id)
    
    # 异步更新相关队伍的积分
    update_team_scores_async([score.team_id])
    
    return db_score

def get_scores_for_match_game(db: Session, match_game_id: int):
    return db.query(models.Score).filter(models.Score.match_game_id == match_game_id).all()

def delete_score(db: Session, score_id: int):
    """删除分数记录"""
    db_score = db.query(models.Score).filter(models.Score.id == score_id).first()
    if not db_score:
        return False
    
    # 记录要更新的队伍ID
    team_id = db_score.match_team_id
    
    db.delete(db_score)
    db.commit()
    
    # 异步更新队伍积分
    if team_id:
        update_team_scores_async([team_id])
    
    return True

# --- 统计相关 CRUD ---

def get_match_stats(db: Session, match_id: int):
    db_match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not db_match:
        return None
    
    return {
        "match_id": match_id,
        "name": db_match.name,
        "total_teams": len(db_match.teams),
        "total_games": len(db_match.match_games)
    }

def get_archived_matches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Match).filter(
        models.Match.status.in_([models.MatchStatus.FINISHED, models.MatchStatus.CANCELLED])
    ).offset(skip).limit(limit).all()

# --- 用户相关查询 ---

def get_user_teams_in_match(db: Session, match_id: int, user_id: int):
    """获取用户在某个比赛中的所有队伍"""
    return db.query(models.MatchTeamMembership).join(models.MatchTeam).filter(
        models.MatchTeam.match_id == match_id,
        models.MatchTeamMembership.user_id == user_id
    ).all()

def get_user_matches(db: Session, user_id: int):
    """获取用户参与的所有比赛"""
    return db.query(models.Match).join(models.MatchTeam).join(models.MatchTeamMembership).filter(
        models.MatchTeamMembership.user_id == user_id
    ).distinct().all()

# --- 标准分管理函数 ---

def recalculate_match_standard_scores(db: Session, match_id: int) -> bool:
    """
    强制重新计算整个比赛的所有分数和排名：
    1. 重新计算所有个人标准分（不应用倍率）。
    2. 重新计算所有队伍总分（应用倍率）和排名。
    3. 重新计算所有用户的统计数据。
    """
    from .standard_score import calculate_standard_scores_for_match
    
    # 步骤1: 重新计算所有个人标准分 (此函数内部不使用倍率)
    success = calculate_standard_scores_for_match(db, match_id)
    if not success:
        return False
        
    # 步骤2: 强制重新计算所有队伍的总分和排名 (此函数内部使用倍率)
    db_match = get_match(db, match_id)
    if db_match:
        team_ids = [team.id for team in db_match.teams]
        if team_ids:
            # 使用同步方法确保计算立即完成
            update_team_scores_sync(team_ids)
            # 再次显式调用排名更新，确保万无一失
            update_team_rankings(db, match_id)
            
    return True

def recalculate_game_standard_scores(db: Session, match_game_id: int) -> bool:
    """重新计算单个游戏的标准分"""
    return calculate_standard_scores_for_match_game(db, match_game_id)

# --- 队伍积分更新函数 ---

def update_team_scores_sync(team_ids: list[int]):
    """同步更新指定队伍的积分（在独立的数据库会话中），考虑游戏倍率"""
    from app.core.db import SessionLocal
    
    db = SessionLocal()
    try:
        for team_id in team_ids:
            # 计算队伍总积分和参与游戏数，考虑游戏倍率
            result = db.execute(text("""
                SELECT
                    COALESCE(SUM(s.points * COALESCE(mg.multiplier, 1.0)), 0) as total_score,
                    COUNT(DISTINCT s.match_game_id) as games_played
                FROM match_teams mt
                LEFT JOIN scores s ON mt.id = s.match_team_id 
                LEFT JOIN match_games mg ON s.match_game_id = mg.id
                WHERE mt.id = :team_id
                GROUP BY mt.id
            """), {"team_id": team_id})
            
            team_data = result.fetchone()
            if team_data:
                total_score, games_played = team_data
                
                # 更新队伍积分
                db.execute(text("""
                    UPDATE match_teams 
                    SET total_score = :total_score, games_played = :games_played 
                    WHERE id = :team_id
                """), {
                    'total_score': int(total_score or 0),
                    'games_played': int(games_played or 0),
                    'team_id': team_id
                })
        
        # 在查询排名之前，将分数更新刷入数据库会话
        db.flush()

        # 更新该比赛所有队伍的排名
        if team_ids:
            # 获取第一个队伍的比赛ID
            match_result = db.execute(text("""
                SELECT match_id FROM match_teams WHERE id = :team_id
            """), {"team_id": team_ids[0]})
            match_row = match_result.fetchone()
            if match_row:
                match_id = match_row[0]
                update_team_rankings(db, match_id)
        
        db.commit()
    except Exception as e:
        print(f"更新队伍积分时出错: {e}")
        db.rollback()
    finally:
        db.close()


def update_team_rankings(db, match_id: int):
    """更新指定比赛的队伍排名"""
    # 获取所有队伍按积分排序
    teams_result = db.execute(text("""
        SELECT id, total_score
        FROM match_teams 
        WHERE match_id = :match_id
        ORDER BY total_score DESC
    """), {"match_id": match_id})
    
    teams = teams_result.fetchall()
    
    # 更新排名
    for rank, (team_id, total_score) in enumerate(teams, 1):
        db.execute(text("""
            UPDATE match_teams 
            SET team_rank = :rank 
            WHERE id = :team_id
        """), {"rank": rank, "team_id": team_id})

def update_team_scores_async(team_ids: list[int]):
    """异步更新队伍积分，避免阻塞主线程"""
    executor = ThreadPoolExecutor(max_workers=1)
    executor.submit(update_team_scores_sync, team_ids)