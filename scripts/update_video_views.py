#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新所有Bilibili视频的观看数
"""
import sys
import os
import asyncio

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.db import SessionLocal

# 导入所有模型以解决关系依赖
from app.modules.users import models as user_models
from app.modules.games import models as game_models
from app.modules.matches import models

from app.utils.bilibili import BilibiliAPI


async def update_video_views():
    """更新所有Bilibili视频的观看数"""
    db: Session = SessionLocal()

    try:
        # 获取所有Bilibili平台的视频
        videos = db.query(models.MatchVideo).filter(
            models.MatchVideo.platform == models.VideoPlatform.BILIBILI
        ).all()

        print(f"找到 {len(videos)} 个Bilibili视频")

        updated_count = 0
        failed_count = 0

        for video in videos:
            try:
                print(f"\n处理视频: {video.title}")
                print(f"  URL: {video.url}")

                # 获取视频信息
                video_info = await BilibiliAPI.get_video_info_from_url(video.url)

                if video_info and video_info.get('view_count'):
                    old_views = video.view_count
                    new_views = video_info['view_count']

                    video.view_count = new_views

                    print(f"  观看数: {old_views} -> {new_views}")
                    updated_count += 1
                else:
                    print(f"  ⚠️  无法获取视频信息")
                    failed_count += 1

            except Exception as e:
                print(f"  ❌ 更新失败: {e}")
                failed_count += 1

        # 提交更改
        db.commit()

        print(f"\n" + "="*50)
        print(f"更新完成！")
        print(f"  成功: {updated_count}")
        print(f"  失败: {failed_count}")
        print(f"  总计: {len(videos)}")

    except Exception as e:
        print(f"发生错误: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("开始更新Bilibili视频观看数...")
    asyncio.run(update_video_views())
