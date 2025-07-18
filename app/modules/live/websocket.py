# -*- coding: utf-8 -*-
from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # 存储活跃的连接
        # 结构: {match_id: [WebSocket, WebSocket, ...]}
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, match_id: int):
        """接受一个新的 WebSocket 连接"""
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = []
        self.active_connections[match_id].append(websocket)

    def disconnect(self, websocket: WebSocket, match_id: int):
        """断开一个 WebSocket 连接"""
        if match_id in self.active_connections:
            self.active_connections[match_id].remove(websocket)
            # 如果一个赛事没有观众了，就从字典中移除
            if not self.active_connections[match_id]:
                del self.active_connections[match_id]

    async def broadcast(self, match_id: int, data: dict):
        """向指定赛事的所有连接广播数据"""
        if match_id in self.active_connections:
            connections = self.active_connections[match_id]
            for connection in connections:
                await connection.send_json(data)

# 创建一个单例的 ConnectionManager
manager = ConnectionManager()