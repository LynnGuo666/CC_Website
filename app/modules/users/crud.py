from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, Dict, Any

from . import models, schemas
from app.modules.matches import models as match_models


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_game_level_and_progress(db: Session, user_id: int, game_code: str, avg_standard_score: float) -> tuple[str, float]:
    """
    基于游戏内排名计算用户在指定游戏中的等级和进度
    
    Args:
        db: 数据库会话
        user_id: 用户ID
        game_code: 游戏代码
        avg_standard_score: 用户在该游戏的平均标准分
        
    Returns:
        tuple[str, float]: (等级, 进度百分比)
    """
    from app.modules.games import models as game_models
    from app.modules.matches import models as match_models
    
    # 获取该游戏的所有用户，按平均标准分排序
    all_users_in_game = db.query(
        models.User.id,
        func.avg(match_models.Score.standard_score).label('avg_standard_score')
    ).join(
        match_models.Score, models.User.id == match_models.Score.user_id
    ).join(
        match_models.MatchGame, match_models.Score.match_game_id == match_models.MatchGame.id
    ).join(
        game_models.Game, match_models.MatchGame.game_id == game_models.Game.id
    ).filter(
        game_models.Game.code == game_code,
        match_models.Score.standard_score.isnot(None)
    ).group_by(
        models.User.id
    ).order_by(
        desc(func.avg(match_models.Score.standard_score))
    ).all()
    
    if not all_users_in_game:
        return 'D', 0.0
    
    total_users_in_game = len(all_users_in_game)
    
    # 找到当前用户在该游戏中的排名
    current_rank = None
    for i, (uid, score) in enumerate(all_users_in_game):
        if uid == user_id:
            current_rank = i + 1
            break
    
    if current_rank is None:
        return 'D', 0.0
    
    # 基于排名百分比计算等级（游戏内排名）
    if current_rank <= max(1, total_users_in_game * 0.1):  # 前10%
        level = 'S'
        s_users = max(1, int(total_users_in_game * 0.1))
        progress = ((s_users - (current_rank - 1)) / s_users) * 100
    elif current_rank <= max(1, total_users_in_game * 0.3):  # 前11%-30%
        level = 'A'
        a_start = max(1, int(total_users_in_game * 0.1)) + 1
        a_end = max(1, int(total_users_in_game * 0.3))
        a_size = a_end - a_start + 1
        progress = ((a_end - current_rank + 1) / a_size) * 100
    elif current_rank <= max(1, total_users_in_game * 0.6):  # 前31%-60%
        level = 'B'
        b_start = max(1, int(total_users_in_game * 0.3)) + 1
        b_end = max(1, int(total_users_in_game * 0.6))
        b_size = b_end - b_start + 1
        progress = ((b_end - current_rank + 1) / b_size) * 100
    elif current_rank <= max(1, total_users_in_game * 0.9):  # 前61%-90%
        level = 'C'
        c_start = max(1, int(total_users_in_game * 0.6)) + 1
        c_end = max(1, int(total_users_in_game * 0.9))
        c_size = c_end - c_start + 1
        progress = ((c_end - current_rank + 1) / c_size) * 100
    else:  # 后10%
        level = 'D'
        d_start = max(1, int(total_users_in_game * 0.9)) + 1
        d_size = total_users_in_game - d_start + 1
        progress = ((total_users_in_game - current_rank + 1) / d_size) * 100
    
    return level, round(progress, 1)

def get_user_stats(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """获取玩家详细统计信息"""
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return None
        
        # 查询玩家的得分记录来计算游戏统计
        scores = db.query(match_models.Score).filter(match_models.Score.user_id == user_id).all()
        
        # 按游戏类型统计得分 - 使用游戏代码而不是名称
        game_scores = {}
        for score in scores:
            if not score.match_game or not score.match_game.game:
                continue
                
            game_code = score.match_game.game.code
            if game_code not in game_scores:
                game_scores[game_code] = {
                    "total_score": 0,
                    "total_standard_score": 0.0,
                    "games_played": 0,
                    "game_name": score.match_game.game.name  # 保留游戏名称用于显示
                }
            game_scores[game_code]["total_score"] += score.points
            game_scores[game_code]["total_standard_score"] += (score.standard_score or 0.0)
            game_scores[game_code]["games_played"] += 1
        
        # 计算每个游戏的平均标准分和等级
        for game_code in game_scores:
            avg_standard_score = (game_scores[game_code]["total_standard_score"] / 
                                 game_scores[game_code]["games_played"]) if game_scores[game_code]["games_played"] > 0 else 0
            game_scores[game_code]["average_standard_score"] = round(avg_standard_score, 2)
            
            # 基于游戏内排名计算等级和进度
            if avg_standard_score > 0:
                level, progress = get_user_game_level_and_progress(db, user_id, game_code, avg_standard_score)
                game_scores[game_code]["level"] = level
                game_scores[game_code]["level_progress"] = progress
            else:
                game_scores[game_code]["level"] = 'D'
                game_scores[game_code]["level_progress"] = 0.0
        
        # 查询比赛历史 - 改为按队伍分组，避免同一比赛不同队的分数被合并
        match_history = []
        try:
            user_matches = db.query(match_models.Match).join(
                match_models.MatchTeam, match_models.Match.id == match_models.MatchTeam.match_id
            ).join(
                match_models.MatchTeamMembership,
                match_models.MatchTeam.id == match_models.MatchTeamMembership.match_team_id
            ).filter(
                match_models.MatchTeamMembership.user_id == user_id
            ).distinct().limit(10).all()  # 限制数量避免过多查询

            for match in user_matches:
                try:
                    match_game_ids = [mg.id for mg in match.match_games]
                    if not match_game_ids:
                        continue

                    # 找到该用户在这场比赛中产生分数的所有队伍ID
                    team_ids = db.query(match_models.Score.match_team_id).filter(
                        match_models.Score.user_id == user_id,
                        match_models.Score.match_game_id.in_(match_game_ids)
                    ).distinct().all()
                    team_ids = [tid[0] for tid in team_ids if tid[0] is not None]

                    # 若没有找到队伍ID，跳过该比赛
                    if not team_ids:
                        continue

                    for team_id in team_ids:
                        # 计算该玩家在这场比赛、且属于该队伍时的得分与参赛场次
                        team_points = db.query(func.sum(match_models.Score.points)).filter(
                            match_models.Score.user_id == user_id,
                            match_models.Score.match_game_id.in_(match_game_ids),
                            match_models.Score.match_team_id == team_id
                        ).scalar() or 0

                        team_games_played = db.query(func.count(func.distinct(match_models.Score.match_game_id))).filter(
                            match_models.Score.user_id == user_id,
                            match_models.Score.match_game_id.in_(match_game_ids),
                            match_models.Score.match_team_id == team_id
                        ).scalar() or 0

                        team_name = db.query(match_models.MatchTeam.name).filter(
                            match_models.MatchTeam.id == team_id
                        ).scalar() or "未知队伍"

                        match_history.append({
                            "match_id": match.id,
                            "match_name": match.name,
                            "total_points": int(team_points),
                            "games_played": int(team_games_played),
                            "team_name": team_name
                        })
                except Exception as match_error:
                    print(f"Error processing match {match.id}: {match_error}")
                    continue
        except Exception as matches_error:
            print(f"Error querying matches: {matches_error}")
        
        # 查询最近得分记录
        recent_scores_data = []
        try:
            recent_scores = db.query(match_models.Score).filter(
                match_models.Score.user_id == user_id
            ).order_by(desc(match_models.Score.recorded_at)).limit(10).all()
            
            for score in recent_scores:
                try:
                    recent_scores_data.append({
                        "points": score.points,
                        "game_name": score.match_game.game.name if score.match_game and score.match_game.game else "未知游戏",
                        "team_name": score.team.name if score.team else "未知队伍",
                        "recorded_at": score.recorded_at.isoformat() if score.recorded_at else None
                    })
                except Exception as score_error:
                    print(f"Error processing score: {score_error}")
                    continue
        except Exception as scores_error:
            print(f"Error querying recent scores: {scores_error}")
        
        return {
            "user": {
                "id": user.id,
                "nickname": user.nickname,
                "display_name": user.display_name,
                "total_points": user.total_points,
                "win_rate": user.win_rate,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_active": user.last_active.isoformat() if user.last_active else None,
            },
            "current_team": None,  # 使用下面的 get_user_team_history 函数
            "historical_teams": [],  # 使用下面的 get_user_team_history 函数
            "match_history": match_history,
            "recent_scores": recent_scores_data,
            "game_scores": game_scores
        }
    except Exception as e:
        # 记录错误但不抛出，避免影响整个请求
        print(f"Error in get_user_stats: {e}")
        return None

def get_user_match_history(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    """获取玩家历史比赛记录（按队伍分组）"""
    user_matches = db.query(match_models.Match).join(
        match_models.MatchTeam, match_models.Match.id == match_models.MatchTeam.match_id
    ).join(
        match_models.MatchTeamMembership
    ).filter(
        match_models.MatchTeamMembership.user_id == user_id
    ).order_by(desc(match_models.Match.created_at)).offset(skip).limit(limit).distinct().all()

    match_history = []
    for match in user_matches:
        match_game_ids = [mg.id for mg in match.match_games]
        if not match_game_ids:
            continue

        # 找到该用户在这场比赛中产生分数的所有队伍ID
        team_ids = db.query(match_models.Score.match_team_id).filter(
            match_models.Score.user_id == user_id,
            match_models.Score.match_game_id.in_(match_game_ids)
        ).distinct().all()
        team_ids = [tid[0] for tid in team_ids if tid[0] is not None]

        for team_id in team_ids:
            match_scores = db.query(func.sum(match_models.Score.points)).filter(
                match_models.Score.user_id == user_id,
                match_models.Score.match_game_id.in_(match_game_ids),
                match_models.Score.match_team_id == team_id
            ).scalar() or 0

            games_played = db.query(func.count(func.distinct(match_models.Score.match_game_id))).filter(
                match_models.Score.user_id == user_id,
                match_models.Score.match_game_id.in_(match_game_ids),
                match_models.Score.match_team_id == team_id
            ).scalar() or 0

            team_name = db.query(match_models.MatchTeam.name).filter(
                match_models.MatchTeam.id == team_id
            ).scalar() or "未知队伍"

            match_history.append({
                "match_id": match.id,
                "match_name": match.name,
                "status": match.status.value,
                "total_points": int(match_scores),
                "games_played": int(games_played),
                "created_at": match.created_at.isoformat(),
                "team_name": team_name
            })

    return match_history

def get_user_team_history(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """获取玩家队伍历史 - 新版本基于比赛队伍"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    
    # 查询玩家参与的所有比赛队伍
    memberships = db.query(match_models.MatchTeamMembership).join(
        match_models.MatchTeam
    ).join(
        match_models.Match, match_models.MatchTeam.match_id == match_models.Match.id
    ).filter(
        match_models.MatchTeamMembership.user_id == user_id
    ).all()
    
    teams_info = []
    for membership in memberships:
        team_info = {
            "id": membership.team.id,
            "name": membership.team.name,
            "color": membership.team.color,
            "role": membership.role.value,
            "match_id": membership.team.match_id,
            "match_name": membership.team.match.name,
            "join_date": membership.joined_at.isoformat() if membership.joined_at else None
        }
        teams_info.append(team_info)
    
    # 按照加入时间排序，最新的在前
    teams_info.sort(key=lambda x: x['join_date'] or '', reverse=True)
    
    # 分离当前活跃的队伍和历史队伍
    current_teams = []
    historical_teams = []
    
    for team in teams_info:
        # 判断比赛是否还在进行中
        match = db.query(match_models.Match).filter(
            match_models.Match.id == team['match_id']
        ).first()
        
        if match and match.status in [match_models.MatchStatus.PREPARING, match_models.MatchStatus.ONGOING]:
            current_teams.append(team)
        else:
            historical_teams.append(team)
    
    return {
        "current_teams": current_teams,
        "historical_teams": historical_teams,
        "total_teams": len(teams_info)
    }

def create_user(db: Session, user: schemas.UserCreate):
    """Get or Create a user."""
    db_user = db.query(models.User).filter(models.User.nickname == user.nickname).first()
    if db_user:
        return db_user
    db_user = models.User(nickname=user.nickname, source=user.source)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserCreate):
    """更新用户信息"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    db_user.nickname = user_update.nickname
    if user_update.display_name is not None:
        db_user.display_name = user_update.display_name
    if user_update.source is not None:
        db_user.source = user_update.source
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """删除用户"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True

# --- 排行榜相关函数 ---

def get_leaderboard(db: Session, skip: int = 0, limit: int = 100, game_code: str = None):
    """
    获取标准分排行榜
    
    Args:
        db: 数据库会话
        skip: 跳过数量
        limit: 返回数量限制
        game_code: 游戏代码，如果指定则按该游戏的平均标准分排序
        
    Returns:
        List[Dict]: 排行榜数据
    """
    if game_code:
        # 按指定游戏的平均标准分排行
        return get_game_specific_leaderboard(db, game_code, skip, limit)
    else:
        # 按综合平均标准分排行
        users = db.query(models.User).filter(
            models.User.average_standard_score > 0
        ).order_by(desc(models.User.average_standard_score)).offset(skip).limit(limit).all()
        
        leaderboard = []
        for idx, user in enumerate(users):
            # 获取用户的游戏统计
            game_stats = get_user_game_stats(db, user.id)
            
            leaderboard.append({
                "rank": skip + idx + 1,
                "user_id": user.id,
                "nickname": user.nickname,
                "display_name": user.display_name,
                "average_standard_score": round(user.average_standard_score, 1),
                "total_standard_score": round(user.total_standard_score, 1),
                "game_level": user.game_level,  # 直接从数据库读取
                "level_progress": round(user.level_progress, 1),  # 直接从数据库读取
                "total_matches": user.total_matches,
                "total_games_played": sum(stats.get('games_played', 0) for stats in game_stats.values()),
                "best_game": get_user_best_game(game_stats),
                "game_count": len([g for g in game_stats.values() if g.get('games_played', 0) > 0])
            })
        
        return leaderboard

def get_game_specific_leaderboard(db: Session, game_code: str, skip: int = 0, limit: int = 100):
    """
    获取指定游戏的排行榜
    
    Args:
        db: 数据库会话
        game_code: 游戏代码
        skip: 跳过数量
        limit: 返回数量限制
        
    Returns:
        List[Dict]: 该游戏的排行榜数据
    """
    from app.modules.games import models as game_models
    from app.modules.matches import models as match_models
    
    # 先获取游戏信息
    game = db.query(game_models.Game).filter(game_models.Game.code == game_code).first()
    if not game:
        return []
    
    # 首先获取该游戏的所有用户总数（用于计算排名百分比）
    total_users_in_game = db.query(
        func.count(func.distinct(models.User.id))
    ).join(
        match_models.Score, models.User.id == match_models.Score.user_id
    ).join(
        match_models.MatchGame, match_models.Score.match_game_id == match_models.MatchGame.id
    ).join(
        game_models.Game, match_models.MatchGame.game_id == game_models.Game.id
    ).filter(
        game_models.Game.code == game_code,
        match_models.Score.standard_score.isnot(None)
    ).scalar()
    
    if total_users_in_game == 0:
        return []
    
    # 查询所有有该游戏分数的用户，按平均标准分排序
    user_scores = db.query(
        models.User.id,
        models.User.nickname,
        models.User.display_name,
        func.avg(match_models.Score.standard_score).label('avg_standard_score'),
        func.sum(match_models.Score.standard_score).label('total_standard_score'),
        func.count(match_models.Score.id).label('games_played'),
        func.sum(match_models.Score.points).label('total_raw_score')
    ).join(
        match_models.Score, models.User.id == match_models.Score.user_id
    ).join(
        match_models.MatchGame, match_models.Score.match_game_id == match_models.MatchGame.id
    ).join(
        game_models.Game, match_models.MatchGame.game_id == game_models.Game.id
    ).filter(
        game_models.Game.code == game_code,
        match_models.Score.standard_score.isnot(None)
    ).group_by(
        models.User.id, models.User.nickname, models.User.display_name
    ).order_by(
        desc(func.avg(match_models.Score.standard_score))
    ).offset(skip).limit(limit).all()
    
    leaderboard = []
    for idx, user_score in enumerate(user_scores):
        current_rank = skip + idx + 1  # 实际排名
        
        # 基于排名百分比计算等级（游戏内排名）
        if current_rank <= max(1, total_users_in_game * 0.1):  # 前10%
            level = 'S'
            # 在S级内的进度
            s_users = max(1, int(total_users_in_game * 0.1))
            progress = ((s_users - (current_rank - 1)) / s_users) * 100
        elif current_rank <= max(1, total_users_in_game * 0.3):  # 前11%-30%
            level = 'A'
            # 在A级内的进度
            a_start = max(1, int(total_users_in_game * 0.1)) + 1
            a_end = max(1, int(total_users_in_game * 0.3))
            a_size = a_end - a_start + 1
            progress = ((a_end - current_rank + 1) / a_size) * 100
        elif current_rank <= max(1, total_users_in_game * 0.6):  # 前31%-60%
            level = 'B'
            # 在B级内的进度
            b_start = max(1, int(total_users_in_game * 0.3)) + 1
            b_end = max(1, int(total_users_in_game * 0.6))
            b_size = b_end - b_start + 1
            progress = ((b_end - current_rank + 1) / b_size) * 100
        elif current_rank <= max(1, total_users_in_game * 0.9):  # 前61%-90%
            level = 'C'
            # 在C级内的进度
            c_start = max(1, int(total_users_in_game * 0.6)) + 1
            c_end = max(1, int(total_users_in_game * 0.9))
            c_size = c_end - c_start + 1
            progress = ((c_end - current_rank + 1) / c_size) * 100
        else:  # 后10%
            level = 'D'
            # 在D级内的进度
            d_start = max(1, int(total_users_in_game * 0.9)) + 1
            d_size = total_users_in_game - d_start + 1
            progress = ((total_users_in_game - current_rank + 1) / d_size) * 100
        
        leaderboard.append({
            "rank": current_rank,
            "user_id": user_score.id,
            "nickname": user_score.nickname,
            "display_name": user_score.display_name,
            "average_standard_score": round(float(user_score.avg_standard_score or 0), 1),
            "total_standard_score": round(float(user_score.total_standard_score or 0), 1),
            "game_level": level,
            "level_progress": round(progress, 1),
            "games_played": int(user_score.games_played or 0),
            "total_raw_score": int(user_score.total_raw_score or 0),
            "average_raw_score": round(float(user_score.total_raw_score or 0) / max(int(user_score.games_played or 1), 1), 1),
            "game_code": game_code,
            "game_name": game.name
        })
    
    return leaderboard

def get_user_game_stats(db: Session, user_id: int):
    """获取用户的游戏统计数据"""
    from app.modules.matches import models as match_models
    
    scores = db.query(match_models.Score).filter(match_models.Score.user_id == user_id).all()
    
    game_stats = {}
    for score in scores:
        if not score.match_game or not score.match_game.game:
            continue
            
        game_code = score.match_game.game.code
        if game_code not in game_stats:
            game_stats[game_code] = {
                "total_score": 0,
                "total_standard_score": 0.0,
                "games_played": 0,
                "game_name": score.match_game.game.name
            }
        
        game_stats[game_code]["total_score"] += score.points
        game_stats[game_code]["total_standard_score"] += (score.standard_score or 0.0)
        game_stats[game_code]["games_played"] += 1
    
    # 计算每个游戏的平均标准分
    for game_code in game_stats:
        if game_stats[game_code]["games_played"] > 0:
            game_stats[game_code]["average_standard_score"] = round(
                game_stats[game_code]["total_standard_score"] / game_stats[game_code]["games_played"], 2
            )
        else:
            game_stats[game_code]["average_standard_score"] = 0.0
    
    return game_stats

def get_user_best_game(game_stats):
    """获取用户表现最好的游戏"""
    if not game_stats:
        return None
    
    best_game = None
    best_score = 0
    
    for game_code, stats in game_stats.items():
        avg_score = stats.get('average_standard_score', 0)
        if avg_score > best_score:
            best_score = avg_score
            best_game = {
                "game_code": game_code,
                "game_name": stats.get('game_name', game_code),
                "average_standard_score": avg_score,
                "games_played": stats.get('games_played', 0)
            }
    
    return best_game

def get_level_distribution(db: Session):
    """
    获取等级分布统计
    
    Returns:
        Dict: 等级分布数据
    """
    # 直接统计数据库中的等级字段
    level_counts = db.query(
        models.User.game_level,
        func.count(models.User.id).label('count')
    ).filter(
        models.User.average_standard_score > 0
    ).group_by(models.User.game_level).all()
    
    # 初始化分布字典
    distribution = {'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0}
    
    # 填充实际数据
    for level, count in level_counts:
        if level in distribution:
            distribution[level] = count
    
    total_users = sum(distribution.values())
    
    # 计算百分比
    distribution_with_percentage = {}
    for level, count in distribution.items():
        percentage = (count / total_users * 100) if total_users > 0 else 0
        distribution_with_percentage[level] = {
            "count": count,
            "percentage": round(percentage, 1)
        }
    
    return {
        "distribution": distribution_with_percentage,
        "total_users": total_users
    }

def get_available_games_for_leaderboard(db: Session):
    """
    获取有排行榜数据的游戏列表
    
    Returns:
        List[Dict]: 游戏列表
    """
    from app.modules.games import models as game_models
    from app.modules.matches import models as match_models
    
    # 查询有标准分数据的游戏
    games_with_scores = db.query(
        game_models.Game.id,
        game_models.Game.name,
        game_models.Game.code,
        func.count(match_models.Score.id).label('total_scores'),
        func.count(func.distinct(match_models.Score.user_id)).label('unique_players')
    ).join(
        match_models.MatchGame, game_models.Game.id == match_models.MatchGame.game_id
    ).join(
        match_models.Score, match_models.MatchGame.id == match_models.Score.match_game_id
    ).filter(
        match_models.Score.standard_score.isnot(None)
    ).group_by(
        game_models.Game.id, game_models.Game.name, game_models.Game.code
    ).order_by(
        desc(func.count(match_models.Score.id))
    ).all()
    
    return [
        {
            "id": game.id,
            "name": game.name,
            "code": game.code,
            "total_scores": int(game.total_scores),
            "unique_players": int(game.unique_players)
        }
        for game in games_with_scores
    ]

def update_all_user_levels(db: Session):
    """
    更新所有用户的等级和进度信息
    这个函数应该在标准分更新后调用
    """
    # 获取所有有标准分的用户，按平均标准分降序排列
    all_users = db.query(models.User).filter(
        models.User.average_standard_score > 0
    ).order_by(desc(models.User.average_standard_score)).all()
    
    total_users = len(all_users)
    
    if total_users == 0:
        return 0
    
    # 批量更新用户等级
    for i, user in enumerate(all_users):
        current_rank = i + 1
        
        # 计算等级 (基于排名百分比)
        if current_rank <= max(1, total_users * 0.1):  # 前10%
            level = 'S'
            # 在S级内的进度：排名越靠前，进度越高
            s_users = max(1, int(total_users * 0.1))
            progress = ((s_users - (current_rank - 1)) / s_users) * 100
        elif current_rank <= max(1, total_users * 0.3):  # 前11%-30%
            level = 'A'
            # 在A级内的进度
            a_start = max(1, int(total_users * 0.1)) + 1
            a_end = max(1, int(total_users * 0.3))
            a_size = a_end - a_start + 1
            progress = ((a_end - current_rank + 1) / a_size) * 100
        elif current_rank <= max(1, total_users * 0.6):  # 前31%-60%
            level = 'B'
            # 在B级内的进度
            b_start = max(1, int(total_users * 0.3)) + 1
            b_end = max(1, int(total_users * 0.6))
            b_size = b_end - b_start + 1
            progress = ((b_end - current_rank + 1) / b_size) * 100
        elif current_rank <= max(1, total_users * 0.9):  # 前61%-90%
            level = 'C'
            # 在C级内的进度
            c_start = max(1, int(total_users * 0.6)) + 1
            c_end = max(1, int(total_users * 0.9))
            c_size = c_end - c_start + 1
            progress = ((c_end - current_rank + 1) / c_size) * 100
        else:  # 后10%
            level = 'D'
            # 在D级内的进度
            d_start = max(1, int(total_users * 0.9)) + 1
            d_size = total_users - d_start + 1
            progress = ((total_users - current_rank + 1) / d_size) * 100
        
        # 更新用户等级和进度
        user.game_level = level
        user.level_progress = round(progress, 1)
    
    try:
        db.commit()
        return total_users
    except Exception as e:
        db.rollback()
        raise e