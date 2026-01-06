# -*- coding: utf-8 -*-
"""
锦标赛（比赛）管理后台路由 - 需要 JWT 认证
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.core.security import require_role
from app.modules.admin.models import UserRole
from . import crud, schemas, models
from .importer import import_score_events_from_csv

router = APIRouter()


@router.get("/", response_model=List[schemas.MatchList])
async def list_matches(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[schemas.MatchStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value)),
):
    """获取比赛列表（后台）"""
    return await db.run_sync(lambda sync_db: crud.get_matches(sync_db, skip=skip, limit=limit, status=status_filter))


@router.get("/{match_id}", response_model=schemas.Match)
async def get_match(
    match_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.VIEWER.value)),
):
    """获取单个比赛详情（后台）"""
    match = await db.run_sync(crud.get_match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.post("/", response_model=schemas.Match, status_code=status.HTTP_201_CREATED)
async def create_match(
    payload: schemas.MatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """创建比赛"""
    return await db.run_sync(lambda sync_db: crud.create_match(sync_db, payload))


@router.put("/{match_id}", response_model=schemas.Match)
async def update_match(
    match_id: int,
    payload: schemas.MatchUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """更新比赛"""
    match = await db.run_sync(lambda sync_db: crud.update_match(sync_db, match_id, payload))
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match(
    match_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN.value)),
):
    """删除比赛"""
    success = await db.run_sync(crud.delete_match, match_id)
    if not success:
        raise HTTPException(status_code=404, detail="Match not found")
    return None


@router.post("/{match_id}/start", response_model=schemas.Match)
async def start_match(
    match_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """开始比赛"""
    match = await db.run_sync(crud.start_match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.post("/{match_id}/finish", response_model=schemas.Match)
async def finish_match(
    match_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """结束比赛"""
    match = await db.run_sync(crud.finish_match, match_id)
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
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """从 CSV 导入小分（ScoreEvent）并可选重算标准分"""
    content = await file.read()
    try:
        result = await db.run_sync(
            lambda sync_db: import_score_events_from_csv(
                db=sync_db,
                match_id=match_id,
                file_bytes=content,
                tournament_stage=tournament_stage,
                event_type=event_type,
                clear_existing=clear_existing,
                dry_run=preview,
            )
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"导入失败: {exc}") from exc

    if recalc and not preview:
        await db.run_sync(crud.recalculate_match_standard_scores, match_id)

    return result


# --- 视频管理接口 ---

@router.post("/{match_id}/videos", response_model=schemas.MatchVideo, status_code=status.HTTP_201_CREATED)
async def create_match_video(
    match_id: int,
    video: schemas.MatchVideoCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """添加比赛视频（管理员）"""
    db_match = await db.run_sync(crud.get_match, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")

    def _create(sync_db):
        created = crud.create_match_video(sync_db, match_id=match_id, video=video)
        return crud.get_match_video(sync_db, created.id)

    return await db.run_sync(_create)


@router.put("/videos/{video_id}", response_model=schemas.MatchVideo)
async def update_match_video(
    video_id: int,
    video_update: schemas.MatchVideoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """更新视频信息（管理员）"""
    def _update(sync_db):
        updated = crud.update_match_video(sync_db, video_id=video_id, video_update=video_update)
        if not updated:
            return None
        return crud.get_match_video(sync_db, updated.id)

    db_video = await db.run_sync(_update)
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")
    return db_video


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match_video(
    video_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """删除视频（管理员）"""
    success = await db.run_sync(crud.delete_match_video, video_id)
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


@router.post("/videos/{video_id}/refresh-views", status_code=status.HTTP_200_OK)
async def refresh_video_views(
    video_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.EDITOR.value)),
):
    """刷新视频观看数（仅支持Bilibili）"""
    from app.utils.bilibili import BilibiliAPI

    # 获取视频
    video = await db.run_sync(crud.get_match_video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")

    # 仅支持Bilibili
    if video.platform != models.VideoPlatform.BILIBILI:
        raise HTTPException(status_code=400, detail="仅支持Bilibili视频")

    # 获取最新视频信息
    video_info = await BilibiliAPI.get_video_info_from_url(video.url)
    if not video_info:
        raise HTTPException(status_code=400, detail="无法获取视频信息")

    # 更新观看数
    old_views = video.view_count
    new_views = video_info.get('view_count', 0)

    def _update(sync_db):
        video_obj = crud.get_match_video(sync_db, video_id)
        if not video_obj:
            return None
        video_obj.view_count = new_views
        sync_db.commit()
        sync_db.refresh(video_obj)
        return video_obj

    video = await db.run_sync(_update)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")

    return {
        "message": "观看数已更新",
        "old_views": old_views,
        "new_views": new_views,
        "video": video
    }
