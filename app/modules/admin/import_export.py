# -*- coding: utf-8 -*-
"""
数据导入/导出功能
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import csv
import io
import json
from datetime import datetime

from app.core.deps import get_db
from app.core.security import require_role
from .models import UserRole
from app.modules.games import models as game_models, schemas as game_schemas
from app.modules.users import models as user_models, schemas as user_schemas

router = APIRouter()


# ==================== 比赛项目导入/导出 ====================

@router.get("/games/export/csv")
async def export_games_csv(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    导出比赛项目为 CSV 文件
    """
    games = db.query(game_models.Game).all()

    # 创建 CSV 内容
    output = io.StringIO()
    writer = csv.writer(output)

    # 写入表头
    writer.writerow(['ID', '项目名称', '项目代码', '项目介绍', '是否季节限定'])

    # 写入数据
    for game in games:
        writer.writerow([
            game.id,
            game.name,
            game.code,
            game.description or '',
            'Yes' if game.seasonal else 'No'
        ])

    # 准备响应
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=games_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )


@router.get("/games/export/json")
async def export_games_json(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    导出比赛项目为 JSON 文件
    """
    games = db.query(game_models.Game).all()

    games_data = [
        {
            "id": game.id,
            "name": game.name,
            "code": game.code,
            "description": game.description,
            "seasonal": game.seasonal
        }
        for game in games
    ]

    json_str = json.dumps(games_data, ensure_ascii=False, indent=2)

    return StreamingResponse(
        iter([json_str]),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=games_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        }
    )


@router.post("/games/import/csv")
async def import_games_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    从 CSV 文件导入比赛项目
    CSV 格式: 项目名称,项目代码,项目介绍,是否季节限定
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV file")

    content = await file.read()
    csv_content = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(csv_content))

    created_count = 0
    updated_count = 0
    errors = []

    for row_num, row in enumerate(csv_reader, start=2):
        try:
            # 检查必填字段
            if not row.get('项目名称') or not row.get('项目代码'):
                errors.append(f"第 {row_num} 行: 缺少必填字段")
                continue

            # 检查是否已存在
            from app.modules.games import crud as game_crud

            game_data = game_schemas.GameCreate(
                name=row['项目名称'],
                code=row['项目代码'],
                description=row.get('项目介绍', ''),
                seasonal=row.get('是否季节限定', 'No').lower() in ['yes', 'true', '1', '是']
            )

            existing_game = db.query(game_models.Game).filter(
                game_models.Game.code == game_data.code
            ).first()

            if existing_game:
                # 更新现有游戏
                existing_game.name = game_data.name
                existing_game.description = game_data.description
                existing_game.seasonal = game_data.seasonal
                updated_count += 1
            else:
                # 创建新游戏
                game_crud.create_game(db, game_data)
                created_count += 1

        except Exception as e:
            errors.append(f"第 {row_num} 行: {str(e)}")

    db.commit()

    return {
        "success": True,
        "created": created_count,
        "updated": updated_count,
        "errors": errors
    }


# ==================== 选手导入/导出 ====================

@router.get("/users/export/csv")
async def export_users_csv(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    导出选手为 CSV 文件
    """
    users = db.query(user_models.User).all()

    # 创建 CSV 内容
    output = io.StringIO()
    writer = csv.writer(output)

    # 写入表头
    writer.writerow([
        'ID', '昵称', '显示名称', '数据来源', '参赛总数', '获胜次数',
        '总得分', '总标准分', '平均标准分', '游戏等级', '等级进度',
        '创建时间', '最后活跃时间'
    ])

    # 写入数据
    for user in users:
        writer.writerow([
            user.id,
            user.nickname,
            user.display_name or '',
            user.source or '',
            user.total_matches,
            user.total_wins,
            user.total_points,
            user.total_standard_score,
            user.average_standard_score,
            user.game_level,
            user.level_progress,
            user.created_at.isoformat() if user.created_at else '',
            user.last_active.isoformat() if user.last_active else ''
        ])

    # 准备响应
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=users_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )


@router.get("/users/export/json")
async def export_users_json(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value))
):
    """
    导出选手为 JSON 文件
    """
    users = db.query(user_models.User).all()

    users_data = [
        {
            "id": user.id,
            "nickname": user.nickname,
            "display_name": user.display_name,
            "source": user.source,
            "total_matches": user.total_matches,
            "total_wins": user.total_wins,
            "total_points": user.total_points,
            "total_standard_score": user.total_standard_score,
            "average_standard_score": user.average_standard_score,
            "game_level": user.game_level,
            "level_progress": user.level_progress,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_active": user.last_active.isoformat() if user.last_active else None
        }
        for user in users
    ]

    json_str = json.dumps(users_data, ensure_ascii=False, indent=2)

    return StreamingResponse(
        iter([json_str]),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=users_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        }
    )


@router.post("/users/import/csv")
async def import_users_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value))
):
    """
    从 CSV 文件导入选手
    CSV 格式: 昵称,显示名称,数据来源
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV file")

    content = await file.read()
    csv_content = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(csv_content))

    created_count = 0
    updated_count = 0
    errors = []

    for row_num, row in enumerate(csv_reader, start=2):
        try:
            # 检查必填字段
            if not row.get('昵称'):
                errors.append(f"第 {row_num} 行: 缺少必填字段 '昵称'")
                continue

            # 检查是否已存在
            from app.modules.users import crud as user_crud

            user_data = user_schemas.UserCreate(
                nickname=row['昵称'],
                display_name=row.get('显示名称', None),
                source=row.get('数据来源', None)
            )

            existing_user = db.query(user_models.User).filter(
                user_models.User.nickname == user_data.nickname
            ).first()

            if existing_user:
                # 更新现有用户
                if user_data.display_name:
                    existing_user.display_name = user_data.display_name
                if user_data.source:
                    existing_user.source = user_data.source
                updated_count += 1
            else:
                # 创建新用户
                user_crud.create_user(db, user_data)
                created_count += 1

        except Exception as e:
            errors.append(f"第 {row_num} 行: {str(e)}")

    db.commit()

    return {
        "success": True,
        "created": created_count,
        "updated": updated_count,
        "errors": errors
    }
