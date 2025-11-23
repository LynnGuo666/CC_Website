# -*- coding: utf-8 -*-
"""
Bilibili视频信息获取模块
"""
import re
import httpx
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi.responses import StreamingResponse


class BilibiliAPI:
    """Bilibili API封装类"""

    BASE_URL = "https://api.bilibili.com"

    @staticmethod
    def extract_video_id(url: str) -> Optional[Dict[str, str]]:
        """
        从URL中提取视频ID
        支持格式：
        - https://www.bilibili.com/video/BV1xx411c7mD
        - https://www.bilibili.com/video/av170001
        - https://b23.tv/BV1xx411c7mD

        Returns:
            {"type": "bvid", "id": "BV1xx411c7mD"} 或
            {"type": "aid", "id": "170001"}
        """
        # BV号匹配
        bv_pattern = r'(BV[a-zA-Z0-9]+)'
        bv_match = re.search(bv_pattern, url)
        if bv_match:
            return {"type": "bvid", "id": bv_match.group(1)}

        # AV号匹配
        av_pattern = r'av(\d+)'
        av_match = re.search(av_pattern, url, re.IGNORECASE)
        if av_match:
            return {"type": "aid", "id": av_match.group(1)}

        return None

    @staticmethod
    async def get_video_info(video_id: str, id_type: str = "bvid") -> Optional[Dict[str, Any]]:
        """
        获取视频详细信息

        Args:
            video_id: 视频ID (BV号或AV号)
            id_type: ID类型 ("bvid" 或 "aid")

        Returns:
            视频信息字典，包含标题、封面、时长、UP主等信息
        """
        url = f"{BilibiliAPI.BASE_URL}/x/web-interface/view"
        params = {id_type: video_id}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.bilibili.com"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params, headers=headers)
                response.raise_for_status()
                data = response.json()

                if data.get("code") != 0:
                    return None

                video_data = data.get("data", {})

                # 提取关键信息
                thumbnail_url = video_data.get("pic")
                # 将Bilibili图片URL转换为代理URL
                if thumbnail_url:
                    from urllib.parse import quote
                    thumbnail_url = f"/api/admin/matches/videos/proxy-image?url={quote(thumbnail_url)}"

                return {
                    "bvid": video_data.get("bvid"),
                    "aid": video_data.get("aid"),
                    "title": video_data.get("title"),
                    "description": video_data.get("desc"),
                    "thumbnail_url": thumbnail_url,
                    "duration": video_data.get("duration"),  # 秒
                    "view_count": video_data.get("stat", {}).get("view", 0),
                    "uploader_name": video_data.get("owner", {}).get("name"),
                    "uploader_mid": video_data.get("owner", {}).get("mid"),
                    "published_at": datetime.fromtimestamp(video_data.get("pubdate", 0)),
                    "cid": video_data.get("cid"),  # 第一个分P的cid
                }
        except Exception as e:
            print(f"获取Bilibili视频信息失败: {e}")
            return None

    @staticmethod
    async def get_video_info_from_url(url: str) -> Optional[Dict[str, Any]]:
        """
        从URL获取视频信息

        Args:
            url: Bilibili视频URL

        Returns:
            视频信息字典
        """
        video_id_info = BilibiliAPI.extract_video_id(url)
        if not video_id_info:
            return None

        return await BilibiliAPI.get_video_info(
            video_id_info["id"],
            video_id_info["type"]
        )


# 同步版本（用于非异步环境）
def get_bilibili_video_info_sync(url: str) -> Optional[Dict[str, Any]]:
    """
    同步获取Bilibili视频信息

    Args:
        url: Bilibili视频URL

    Returns:
        视频信息字典
    """
    video_id_info = BilibiliAPI.extract_video_id(url)
    if not video_id_info:
        return None

    api_url = f"{BilibiliAPI.BASE_URL}/x/web-interface/view"
    params = {video_id_info["type"]: video_id_info["id"]}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://www.bilibili.com"
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(api_url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()

            if data.get("code") != 0:
                return None

            video_data = data.get("data", {})

            thumbnail_url = video_data.get("pic")
            # 将Bilibili图片URL转换为代理URL
            if thumbnail_url:
                from urllib.parse import quote
                thumbnail_url = f"/api/admin/matches/videos/proxy-image?url={quote(thumbnail_url)}"

            return {
                "bvid": video_data.get("bvid"),
                "aid": video_data.get("aid"),
                "title": video_data.get("title"),
                "description": video_data.get("desc"),
                "thumbnail_url": thumbnail_url,
                "duration": video_data.get("duration"),
                "view_count": video_data.get("stat", {}).get("view", 0),
                "uploader_name": video_data.get("owner", {}).get("name"),
                "uploader_mid": video_data.get("owner", {}).get("mid"),
                "published_at": datetime.fromtimestamp(video_data.get("pubdate", 0)) if video_data.get("pubdate") else None,
                "cid": video_data.get("cid"),
            }
    except Exception as e:
        print(f"获取Bilibili视频信息失败: {e}")
        return None


async def proxy_bilibili_image(image_url: str) -> Optional[StreamingResponse]:
    """
    代理Bilibili图片请求

    Args:
        image_url: Bilibili图片URL

    Returns:
        StreamingResponse 或 None
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://www.bilibili.com"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(image_url, headers=headers)
            response.raise_for_status()

            # 返回图片流
            return StreamingResponse(
                iter([response.content]),
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers={
                    "Cache-Control": "public, max-age=86400",  # 缓存1天
                }
            )
    except Exception as e:
        print(f"代理图片失败: {e}")
        return None
