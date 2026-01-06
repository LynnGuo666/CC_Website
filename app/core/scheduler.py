# -*- coding: utf-8 -*-
"""
定时任务调度器
"""
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select

from app.core.db import AsyncSessionLocal
from app.modules.matches import models
from app.utils.bilibili import BilibiliAPI

logger = logging.getLogger(__name__)

# 创建调度器实例
scheduler = AsyncIOScheduler()


async def update_all_video_views():
    """
    更新所有Bilibili视频的观看数
    每天凌晨3点执行
    """
    logger.info("开始定时更新视频观看数...")
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(models.MatchVideo).where(
                    models.MatchVideo.platform == models.VideoPlatform.BILIBILI
                )
            )
            videos = result.scalars().all()

            logger.info(f"找到 {len(videos)} 个Bilibili视频")

            updated_count = 0
            failed_count = 0

            for video in videos:
                try:
                    # 获取视频信息
                    video_info = await BilibiliAPI.get_video_info_from_url(video.url)

                    if video_info and video_info.get('view_count'):
                        old_views = video.view_count
                        new_views = video_info['view_count']

                        video.view_count = new_views

                        logger.info(f"更新视频 [{video.title}]: {old_views} -> {new_views}")
                        updated_count += 1
                    else:
                        logger.warning(f"无法获取视频信息: {video.title}")
                        failed_count += 1

                except Exception as e:
                    logger.error(f"更新视频失败 [{video.title}]: {e}")
                    failed_count += 1

            await db.commit()

            logger.info(f"视频观看数更新完成 - 成功: {updated_count}, 失败: {failed_count}, 总计: {len(videos)}")

        except Exception as e:
            logger.error(f"定时任务执行失败: {e}")
            await db.rollback()


def start_scheduler():
    """启动定时任务调度器"""
    # 添加每天凌晨3点执行的任务
    scheduler.add_job(
        update_all_video_views,
        trigger=CronTrigger(hour=3, minute=0),  # 每天凌晨3点
        id='update_video_views',
        name='更新视频观看数',
        replace_existing=True
    )

    scheduler.start()
    logger.info("定时任务调度器已启动")
    logger.info("- 视频观看数更新任务: 每天凌晨3点执行")


def shutdown_scheduler():
    """关闭定时任务调度器"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("定时任务调度器已关闭")
