# -*- coding: utf-8 -*-
"""
锦标赛（比赛）管理后台路由 - 需要 JWT 认证
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import require_role
from app.modules.admin.models import UserRole
from . import crud, schemas
from .importer import import_score_events_from_csv

router = APIRouter()


@router.get("/", response_model=List[schemas.MatchList])
def list_matches(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[schemas.MatchStatus] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value)),
):
    """获取比赛列表（后台）"""
    return crud.get_matches(db, skip=skip, limit=limit, status=status_filter)


@router.get("/{match_id}", response_model=schemas.Match)
def get_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value)),
):
    """获取单个比赛详情（后台）"""
    match = crud.get_match(db, match_id=match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.post("/", response_model=schemas.Match, status_code=status.HTTP_201_CREATED)
def create_match(
    payload: schemas.MatchCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """创建比赛"""
    return crud.create_match(db, payload)


@router.put("/{match_id}", response_model=schemas.Match)
def update_match(
    match_id: int,
    payload: schemas.MatchUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """更新比赛"""
    match = crud.update_match(db, match_id, payload)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value)),
):
    """删除比赛"""
    success = crud.delete_match(db, match_id)
    if not success:
        raise HTTPException(status_code=404, detail="Match not found")
    return None


@router.post("/{match_id}/start", response_model=schemas.Match)
def start_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """开始比赛"""
    match = crud.start_match(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.post("/{match_id}/finish", response_model=schemas.Match)
def finish_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """结束比赛"""
    match = crud.finish_match(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.post("/{match_id}/score-events/import")
async def import_score_events(
    match_id: int,
    file: UploadFile = File(...),
    clear_existing: bool = False,
    tournament_stage: Optional[str] = None,
    event_type: str = "game_score",
    recalc: bool = False,
    preview: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """从 CSV 导入小分（ScoreEvent）并可选重算标准分"""
    content = await file.read()
    try:
        result = import_score_events_from_csv(
            db=db,
            match_id=match_id,
            file_bytes=content,
            tournament_stage=tournament_stage,
            event_type=event_type,
            clear_existing=clear_existing,
            dry_run=preview,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"导入失败: {exc}") from exc

    if recalc and not preview:
        crud.recalculate_match_standard_scores(db, match_id=match_id)

    return result


# --- 视频管理接口 ---

@router.post("/{match_id}/videos", response_model=schemas.MatchVideo, status_code=status.HTTP_201_CREATED)
def create_match_video(
    match_id: int,
    video: schemas.MatchVideoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """添加比赛视频（管理员）"""
    db_match = crud.get_match(db, match_id=match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")

    return crud.create_match_video(db, match_id=match_id, video=video)


@router.put("/videos/{video_id}", response_model=schemas.MatchVideo)
def update_match_video(
    video_id: int,
    video_update: schemas.MatchVideoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """更新视频信息（管理员）"""
    db_video = crud.update_match_video(db, video_id=video_id, video_update=video_update)
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    return db_video


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """删除视频（管理员）"""
    success = crud.delete_match_video(db, video_id=video_id)
    if not success:
        raise HTTPException(status_code=404, detail="Video not found")
    return None


@router.get("/videos/bilibili-info", status_code=status.HTTP_200_OK)
async def get_bilibili_video_info(
    url: str,
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """获取Bilibili视频信息"""
    from app.utils.bilibili import BilibiliAPI

    video_info = await BilibiliAPI.get_video_info_from_url(url)
    if not video_info:
        raise HTTPException(status_code=400, detail="无法获取视频信息，请检查URL是否正确")

    return video_info


@router.get("/videos/proxy-image")
async def proxy_bilibili_image_endpoint(url: str):
    """代理Bilibili图片（无需认证，用于前端显示）"""
    from app.utils.bilibili import proxy_bilibili_image

    if not url or not ("bilibili" in url or "hdslb" in url):
        raise HTTPException(status_code=400, detail="仅支持Bilibili图片URL")

    response = await proxy_bilibili_image(url)
    if not response:
        raise HTTPException(status_code=404, detail="图片获取失败")

    return response
