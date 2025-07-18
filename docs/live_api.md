# API 文档 (v4 - Final)

## 1. 核心概念

- **`Game` (项目)**: 静态定义，如“英雄联盟5v5”。
- **`Match` (比赛)**: 顶级事件，如“2025夏季杯”。
- **`MatchGame` (赛程)**: **核心**。代表某场比赛中的某个项目。**对战结构**和**子项目得分**都与它关联。

## 2. 认证

所有 `POST` 请求都必须在 HTTP 请求头中包含一个有效的 API 密钥。
- **Header Name**: `X-API-Key`

---

## 3. API 端点与使用流程

### 场景A: 导入历史比赛数据 (一次性操作)

使用 `/matches` 端点，可以在一个请求中创建一场完整的比赛，包括其所有赛程。

#### `POST /matches`
- **Description**: 创建一场新比赛。**推荐用于导入历史数据**。
- **Request Body (`MatchCreate`):**
  ```json
  {
    "name": "2024冬季杯 (历史数据)",
    "match_games": [
      {
        "game_id": 1,
        "structure_type": "小组赛",
        "structure_details": { "info": "..." }
      },
      {
        "game_id": 2,
        "structure_type": "淘汰赛",
        "structure_details": { "info": "..." }
      }
    ]
  }
  ```

#### `POST /matches/games/{match_game_id}/scores`
- **Description**: 为已创建的赛程录入分数。
- **Request Body (`ScoreCreate`):**
  ```json
  { "points": 100, "user_id": 1, "team_id": 1 }
  ```

### 场景B: 举办一场新的实时直播比赛 (分步操作)

#### 步骤1: `POST /matches`
- **Description**: 创建一个顶级的比赛“容器”。
- **Request Body**: `{"name": "2025夏季杯"}`
- **Response**: 获取 `match_id`。

#### 步骤2: `POST /live/matches/{match_id}/games`
- **Description**: 在比赛中添加一个项目，并定义其对战结构。**这是开启一个项目直播的关键**。
- **Request Body (`MatchGameCreate`):**
  ```json
  { "game_id": 1, "structure_type": "5v5对战", "structure_details": { ... } }
  ```
- **Response**: 获取 `match_game_id`。

#### 步骤3: `POST /live/events`
- **Description**: **直播事件上报**。此端点会自动记录分数并**触发WebSocket广播**。
- **Request Body (`EventPost`):**
  ```json
  { "match_game_id": 1, "user_id": 101, "team_id": 1, "event_data": { "points": 10 } }
  ```

#### 步骤4: `WS /ws/live/{match_id}`
- **Description**: 客户端订阅此端点以接收实时更新。
- **接收数据 (`LiveUpdate`):**
  ```json
  {
    "match_id": 1,
    "match_name": "2025夏季杯",
    "total_leaderboard": [ ... ],
    "current_match_game": { ... },
    "last_event": { ... }
  }