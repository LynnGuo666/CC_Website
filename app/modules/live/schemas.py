# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

# --- 用于接收上报数据的模型 ---

class EventPost(BaseModel):
    """
    从赛事服务器接收的单个事件数据。
    """
    match_game_id: int  # 关联的赛程ID
    user_id: int
    team_id: int
    event_type: str
    event_data: Dict[str, Any]

# --- 用于 WebSocket 广播的模型 ---

class TeamSubScore(BaseModel):
    """队伍在子项目中的得分"""
    team_id: int
    team_name: str
    score: int

class MatchGameLive(BaseModel):
    """赛程的实时状态"""
    match_game_id: int
    game_name: str
    structure_type: str
    teams: List[TeamSubScore]

class TeamTotalScore(BaseModel):
    """队伍在整个比赛中的总分"""
    rank: int
    team_id: int
    team_name: str
    total_points: int

class LastEvent(BaseModel):
    """最新发生的事件的简报"""
    match_game_id: int
    user_id: int
    description: str

class LiveUpdate(BaseModel):
    """
    通过 WebSocket 推送给客户端的完整实时数据。
    """
    match_id: int
    match_name: str
    total_leaderboard: List[TeamTotalScore]
    current_match_game: MatchGameLive
    last_event: Optional[LastEvent] = None