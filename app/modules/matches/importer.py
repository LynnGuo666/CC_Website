# -*- coding: utf-8 -*-
"""
比赛小分（ScoreEvent）导入工具
"""
from __future__ import annotations

import csv
import io
from typing import Dict, Optional, Tuple, List

from sqlalchemy.orm import Session

from . import models
from app.modules.games import models as game_models
from app.modules.users import models as user_models
from app.modules.matches import models as match_models


def build_team_maps(db: Session, match_id: int) -> Tuple[Dict[str, match_models.MatchTeam], Dict[str, match_models.MatchTeam]]:
    teams = (
        db.query(match_models.MatchTeam)
        .filter(match_models.MatchTeam.match_id == match_id)
        .all()
    )
    external_map: Dict[str, match_models.MatchTeam] = {}
    name_map: Dict[str, match_models.MatchTeam] = {}
    for team in teams:
        if team.external_team_id:
            external_map[str(team.external_team_id).strip().lower()] = team
        name_map[team.name.strip().lower()] = team
    return external_map, name_map


def build_game_map(db: Session, match_id: int) -> Dict[str, match_models.MatchGame]:
    match_games = (
        db.query(match_models.MatchGame)
        .join(game_models.Game)
        .filter(match_models.MatchGame.match_id == match_id)
        .all()
    )
    mapping: Dict[str, match_models.MatchGame] = {}
    for mg in match_games:
        identifiers: List[str] = []
        if mg.game and mg.game.code:
            identifiers.append(mg.game.code.strip().lower())
        if mg.game and mg.game.name:
            identifiers.append(mg.game.name.strip().lower())
        identifiers.append(f"{mg.id}")
        for key in identifiers:
            mapping[key] = mg
    return mapping


def build_user_map(db: Session, match_id: int) -> Dict[str, user_models.User]:
    users = (
        db.query(user_models.User)
        .join(match_models.MatchTeamMembership, match_models.MatchTeamMembership.user_id == user_models.User.id)
        .join(match_models.MatchTeam, match_models.MatchTeamMembership.match_team_id == match_models.MatchTeam.id)
        .filter(match_models.MatchTeam.match_id == match_id)
        .all()
    )
    mapping: Dict[str, user_models.User] = {}
    for user in users:
        mapping[user.nickname.lower()] = user
    return mapping


def resolve_team(team_maps: Tuple[Dict[str, match_models.MatchTeam], Dict[str, match_models.MatchTeam]], team_id: str, team_name: str) -> Optional[match_models.MatchTeam]:
    external_map, name_map = team_maps
    if team_id:
        team = external_map.get(team_id.strip().lower())
        if team:
            return team
    if team_name:
        return name_map.get(team_name.strip().lower())
    return None


def import_score_events_from_csv(
    db: Session,
    match_id: int,
    file_bytes: bytes,
    tournament_stage: Optional[str] = None,
    event_type: str = "game_score",
    clear_existing: bool = False,
) -> Dict[str, object]:
    """从 CSV 内容导入 ScoreEvent 记录"""
    if not file_bytes:
        raise ValueError("文件内容为空")

    text = file_bytes.decode("utf-8-sig")
    csv_reader = csv.DictReader(io.StringIO(text))

    team_maps = build_team_maps(db, match_id)
    game_map = build_game_map(db, match_id)
    user_map = build_user_map(db, match_id)

    if clear_existing:
        db.query(models.ScoreEvent).filter(models.ScoreEvent.match_id == match_id).delete()
        db.commit()

    inserted = 0
    skipped = 0
    errors: List[str] = []

    for row_num, row in enumerate(csv_reader, start=2):  # header is row 1
        points_raw = (row.get("points") or "").strip()
        if not points_raw:
            skipped += 1
            errors.append(f"第 {row_num} 行缺少 points，已跳过")
            continue

        try:
            points = int(float(points_raw))
        except ValueError:
            skipped += 1
            errors.append(f"第 {row_num} 行 points 非法: {points_raw}")
            continue

        game_code = (row.get("game") or "").strip().lower()
        match_game = game_map.get(game_code)
        if not match_game:
            skipped += 1
            errors.append(f"第 {row_num} 行无法匹配游戏: {row.get('game')}")
            continue

        team = resolve_team(team_maps, row.get("teamId", ""), row.get("team", ""))
        if not team:
            skipped += 1
            errors.append(f"第 {row_num} 行无法匹配队伍: {row.get('team')}({row.get('teamId')})")
            continue

        opponent = None
        rival_id = row.get("rivalId", "")
        rival_name = row.get("rival", "")
        if rival_id or rival_name:
            opponent = resolve_team(team_maps, rival_id, rival_name)

        user_identifier = (row.get("username") or "").strip().lower()
        user = user_map.get(user_identifier)
        if not user:
            skipped += 1
            errors.append(f"第 {row_num} 行玩家未在当前比赛队伍中: {row.get('username')}")
            continue

        event = models.ScoreEvent(
            match_id=match_id,
            match_game_id=match_game.id,
            match_team_id=team.id,
            opponent_team_id=opponent.id if opponent else None,
            user_id=user.id,
            event_type=event_type,
            points=points,
            raw_points=int(float(points_raw)),
            multiplier_used=None,
            tournament_stage=tournament_stage,
            game_round_label=row.get("round") or None,
            area=row.get("area") or None,
            meta={
                "source_csv_id": row.get("id"),
                "time": row.get("time"),
                "rival_name": rival_name,
            },
        )

        db.add(event)
        inserted += 1

    db.commit()

    return {
        "inserted": inserted,
        "skipped": skipped,
        "errors": errors,
    }
