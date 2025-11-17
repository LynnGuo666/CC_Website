#!/usr/bin/env python3
"""
根据 CSV 文件批量导入细粒度小分数据（score_events），并可选触发标准分重计算。

示例：
    .venv/bin/python scripts/import_score_events.py \\
        --csv 数据测试.csv \\
        --match-id 1 \\
        --tournament-stage "WCC 主赛程" \\
        --recalculate
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path
from typing import Dict, Optional

import requests
from sqlalchemy import select

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from app.core.db import SessionLocal  # noqa: E402
from app.modules.games import models as game_models  # noqa: E402
from app.modules.matches import models as match_models  # noqa: E402
from app.modules.users import models as user_models  # noqa: E402


def build_team_maps(db, match_id: int):
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


def build_game_map(db, match_id: int):
    match_games = (
        db.query(match_models.MatchGame)
        .join(game_models.Game)
        .filter(match_models.MatchGame.match_id == match_id)
        .all()
    )
    mapping: Dict[str, match_models.MatchGame] = {}
    for mg in match_games:
        identifiers = []
        if mg.game and mg.game.code:
            identifiers.append(mg.game.code.strip().lower())
        if mg.game and mg.game.name:
            identifiers.append(mg.game.name.strip().lower())
        identifiers.append(f"{mg.id}")
        for key in identifiers:
            mapping[key] = mg
    return mapping


def build_user_map(db, match_id: int):
    stmt = (
        select(user_models.User)
        .join(match_models.MatchTeamMembership, match_models.MatchTeamMembership.user_id == user_models.User.id)
        .join(match_models.MatchTeam, match_models.MatchTeamMembership.match_team_id == match_models.MatchTeam.id)
        .filter(match_models.MatchTeam.match_id == match_id)
    )
    users = db.scalars(stmt).all()
    mapping: Dict[str, user_models.User] = {}
    for user in users:
        mapping[user.nickname.lower()] = user
    return mapping


def resolve_team(team_maps, team_id: str, team_name: str) -> Optional[match_models.MatchTeam]:
    external_map, name_map = team_maps
    if team_id:
        team = external_map.get(team_id.strip().lower())
        if team:
            return team
    if team_name:
        return name_map.get(team_name.strip().lower())
    return None


def trigger_recalculate(api_base: str, api_key: str, match_id: int):
    url = f"{api_base.rstrip('/')}/matches/{match_id}/standard-scores/recalculate"
    resp = requests.post(url, headers={"X-API-Key": api_key})
    if resp.status_code not in (200, 201):
        try:
            detail = resp.json()
        except Exception:  # noqa: BLE001
            detail = resp.text
        raise SystemExit(f"重计算请求失败 ({resp.status_code}): {detail}")
    print(f"✓ 已触发比赛 {match_id} 的标准分重算")


def import_events(args):
    csv_path = Path(args.csv)
    if not csv_path.exists():
        raise SystemExit(f"CSV 文件不存在: {csv_path}")

    with SessionLocal() as db:
        match = db.get(match_models.Match, args.match_id)
        if not match:
            raise SystemExit(f"比赛 {args.match_id} 不存在")

        team_maps = build_team_maps(db, args.match_id)
        game_map = build_game_map(db, args.match_id)
        user_map = build_user_map(db, args.match_id)

        if args.clear_existing:
            deleted = (
                db.query(match_models.ScoreEvent)
                .filter(match_models.ScoreEvent.match_id == args.match_id)
                .delete()
            )
            db.commit()
            print(f"已清空既有小分事件 {deleted} 条")

        inserted = 0
        skipped = 0

        with csv_path.open(newline="", encoding="utf-8") as fp:
            reader = csv.DictReader(fp)
            for row in reader:
                points_raw = (row.get("points") or "").strip()
                if not points_raw:
                    skipped += 1
                    continue

                try:
                    points = int(float(points_raw))
                except ValueError:
                    print(f"跳过非法分数记录: {row}")
                    skipped += 1
                    continue

                game_code = (row.get("game") or "").strip().lower()
                match_game = game_map.get(game_code)
                if not match_game:
                    print(f"⚠️ 无法匹配游戏 {row.get('game')}，已跳过")
                    skipped += 1
                    continue

                team = resolve_team(team_maps, row.get("teamId", ""), row.get("team", ""))
                if not team:
                    print(f"⚠️ 无法匹配队伍 {row.get('team')}({row.get('teamId')}) ，已跳过")
                    skipped += 1
                    continue

                opponent = None
                rival_id = row.get("rivalId", "")
                rival_name = row.get("rival", "")
                if rival_id or rival_name:
                    opponent = resolve_team(team_maps, rival_id, rival_name)

                user_identifier = (row.get("username") or "").strip().lower()
                user = user_map.get(user_identifier)
                if not user:
                    print(f"⚠️ 玩家 {row.get('username')} 未在当前比赛队伍中，已跳过")
                    skipped += 1
                    continue

                event = match_models.ScoreEvent(
                    match_id=args.match_id,
                    match_game_id=match_game.id,
                    match_team_id=team.id,
                    opponent_team_id=opponent.id if opponent else None,
                    user_id=user.id,
                    event_type=args.event_type,
                    points=points,
                    raw_points=int(float(points_raw)),
                    multiplier_used=None,
                    tournament_stage=args.tournament_stage,
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
        print(f"导入完成：成功 {inserted} 条，跳过 {skipped} 条。")

    if args.recalculate:
        if not args.api_key:
            raise SystemExit("触发重算需要提供 --api-key（从后台管理员账号复制）")
        trigger_recalculate(args.api_url, args.api_key, args.match_id)


def parse_args():
    parser = argparse.ArgumentParser(description="导入细粒度赛事得分数据")
    parser.add_argument("--csv", required=True, help="包含小分记录的 CSV 路径")
    parser.add_argument("--match-id", type=int, required=True, help="目标比赛 ID")
    parser.add_argument("--tournament-stage", default=None, help="锦标赛阶段标签，可选")
    parser.add_argument("--event-type", default="game_score", help="事件类型标识，默认 game_score")
    parser.add_argument("--clear-existing", action="store_true", help="导入前清空现有 score_events 记录")
    parser.add_argument("--recalculate", action="store_true", help="导入后触发标准分重算")
    parser.add_argument("--api-url", default="http://127.0.0.1:8000/api", help="后端 API 基础地址，用于触发重算")
    parser.add_argument("--api-key", help="调用重算端点的 API Key（从管理员账号复制）")
    return parser.parse_args()


if __name__ == "__main__":
    cli_args = parse_args()
    import_events(cli_args)
