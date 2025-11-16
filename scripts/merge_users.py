#!/usr/bin/env python3
"""
合并两个用户的所有数据（队伍成员关系、阵容、分数以及统计信息）。

使用示例：
    .venv/bin/python scripts/merge_users.py --source-id 12 --target-id 45
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from sqlalchemy import func

# 允许脚本导入 app.* 模块
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from app.core.db import SessionLocal  # noqa: E402
from app.modules.matches import models as match_models  # noqa: E402
from app.modules.matches.standard_score import StandardScoreService  # noqa: E402
from app.modules.users import crud as user_crud  # noqa: E402
from app.modules.users import models as user_models  # noqa: E402

RELATED_TABLES: List[Tuple[str, object, object]] = [
    ("match_team_memberships", match_models.MatchTeamMembership, match_models.MatchTeamMembership.user_id),
    ("game_lineups", match_models.GameLineup, match_models.GameLineup.user_id),
    ("scores", match_models.Score, match_models.Score.user_id),
]


def summarize_links(db, user_id: int) -> Dict[str, int]:
    """统计某个用户在各张关联表里的记录数量。"""
    summary = {}
    for label, model, column in RELATED_TABLES:
        count = db.query(func.count(model.id)).filter(column == user_id).scalar()
        summary[label] = int(count or 0)
    return summary


def merge_users(source_id: int, target_id: int, new_nickname: Optional[str], dry_run: bool) -> None:
    """将 source 用户的所有关联数据迁移到 target，并删除 source。"""
    with SessionLocal() as db:
        source_user = db.get(user_models.User, source_id)
        target_user = db.get(user_models.User, target_id)

        if not source_user:
            raise SystemExit(f"源用户 {source_id} 不存在")
        if not target_user:
            raise SystemExit(f"目标用户 {target_id} 不存在")
        if source_id == target_id:
            raise SystemExit("源用户和目标用户的 ID 不能相同")

        print(f"将把用户 #{source_id} ({source_user.nickname}) 的数据合并到用户 #{target_id} ({target_user.nickname})")
        summary = summarize_links(db, source_id)
        print("源用户包含的关联记录：")
        for label, count in summary.items():
            print(f"  - {label}: {count}")

        if dry_run:
            print("Dry run 已开启，仅展示将被迁移的数量，不会修改数据库。")
            return

        updates: Dict[str, int] = {}
        try:
            for label, model, column in RELATED_TABLES:
                affected = db.query(model).filter(column == source_id).update(
                    {column: target_id},
                    synchronize_session=False,
                )
                updates[label] = int(affected or 0)

            # 删除源用户
            db.delete(source_user)

            # 如果提供了新昵称，则更新目标用户的昵称
            if new_nickname:
                print(f"将目标用户昵称修改为 {new_nickname}")
                target_user.nickname = new_nickname
                if not target_user.display_name:
                    target_user.display_name = new_nickname

            db.commit()
        except Exception as exc:
            db.rollback()
            raise SystemExit(f"合并过程中出现错误，已回滚: {exc}") from exc

        print("迁移完成：")
        for label, count in updates.items():
            print(f"  - {label}: {count} 条记录已更新")

        # 重新计算目标用户的统计信息 & 更新等级
        print("正在重新计算统计信息...")
        svc = StandardScoreService(db)
        if not svc.update_user_standard_score_stats(target_id):
            print("警告：更新目标用户标准分统计失败，请手动检查。")

        try:
            updated_levels = user_crud.update_all_user_levels(db)
            print(f"等级分布已刷新，共更新 {updated_levels} 名用户。")
        except Exception as exc:
            print(f"警告：更新用户等级失败，请手动运行 update_user_levels.py。错误：{exc}")


def parse_args():
    parser = argparse.ArgumentParser(description="将一个用户的所有数据合并到另一个用户。")
    parser.add_argument("--source-id", type=int, required=True, help="需要被合并（删除）的用户ID")
    parser.add_argument("--target-id", type=int, required=True, help="要保留的用户ID")
    parser.add_argument("--target-nickname", help="可选，将目标用户昵称更新为此值")
    parser.add_argument("--dry-run", action="store_true", help="只显示将被迁移的数据量，不执行写操作")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    merge_users(
        source_id=args.source_id,
        target_id=args.target_id,
        new_nickname=args.target_nickname,
        dry_run=args.dry_run,
    )
