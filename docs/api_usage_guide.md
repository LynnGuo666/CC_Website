# 比赛服务器 API 使用指南

这份文档将详细说明如何使用比赛服务器的各种 API 接口，包括具体的使用场景和数据修改操作。

## 📋 目录

1. [认证方式](#认证方式)
2. [核心概念](#核心概念)
3. [基础数据管理](#基础数据管理)
4. [常见使用场景](#常见使用场景)
5. [数据修改操作](#数据修改操作)
6. [错误处理](#错误处理)
7. [WebSocket 实时推送](#websocket-实时推送)

## 🔐 认证方式

所有的 `POST`、`PUT`、`DELETE` 请求都需要在请求头中包含 API 密钥：

```http
X-API-Key: your-api-key-here
```

查询操作（`GET` 请求）不需要认证。

## 🎯 核心概念

理解这些核心概念对正确使用 API 至关重要：

- **User (用户)**: 参赛选手，具有 `nickname` 和 `source`
- **Team (队伍)**: 参赛队伍，包含多个用户
- **Game (比赛项目)**: 静态的比赛类型定义，如"英雄联盟5v5"
- **Match (比赛)**: 顶级比赛事件，如"2025夏季杯"
- **MatchGame (赛程)**: **核心实体**，代表某场比赛中的某个项目，包含对战结构和分数
- **Score (分数)**: 用户在特定赛程中的得分记录

## 🏗️ 基础数据管理

### 用户管理

#### 创建用户
```http
POST /users
Content-Type: application/json
X-API-Key: your-key

{
  "nickname": "Player123",
  "source": "registration_system"
}
```

#### 查询用户
```http
GET /users           # 获取所有用户
GET /users/1         # 获取特定用户
GET /users?skip=0&limit=50  # 分页查询
```

### 队伍管理

#### 创建队伍
```http
POST /teams
Content-Type: application/json
X-API-Key: your-key

{
  "name": "猛虎队",
  "color": "#FF0000",
  "team_number": 1
}
```

#### 管理队伍成员
```http
# 添加成员
POST /teams/1/members/123
X-API-Key: your-key

# 移除成员
DELETE /teams/1/members/123
X-API-Key: your-key
```

### 比赛项目管理

#### 创建比赛项目
```http
POST /games
Content-Type: application/json
X-API-Key: your-key

{
  "name": "英雄联盟5v5",
  "description": "经典5v5对战模式"
}
```

## 🎮 常见使用场景

### 场景1: 举办新的实时比赛

**步骤1: 创建比赛**
```http
POST /matches
Content-Type: application/json
X-API-Key: your-key

{
  "name": "2025春季杯",
  "start_time": "2025-03-01T10:00:00",
  "participant_team_ids": [1, 2, 3, 4]
}
```

**步骤2: 为比赛添加赛程**
```http
POST /live/matches/1/games
Content-Type: application/json
X-API-Key: your-key

{
  "game_id": 1,
  "structure_type": "小组赛",
  "structure_details": {
    "format": "单循环",
    "groups": ["A", "B"]
  }
}
```

**步骤3: 实时事件上报**
```http
POST /live/events
Content-Type: application/json
X-API-Key: your-key

{
  "match_game_id": 1,
  "user_id": 101,
  "team_id": 1,
  "event_type": "kill",
  "event_data": {
    "points": 10,
    "target": "enemy_player",
    "timestamp": "2025-03-01T10:30:00"
  }
}
```

### 场景2: 导入历史比赛数据

**一次性创建完整比赛**
```http
POST /matches
Content-Type: application/json
X-API-Key: your-key

{
  "name": "2024冬季杯 (历史数据)",
  "start_time": "2024-12-01T10:00:00",
  "end_time": "2024-12-01T18:00:00",
  "winning_team_id": 1,
  "participant_team_ids": [1, 2, 3, 4],
  "match_games": [
    {
      "game_id": 1,
      "structure_type": "小组赛",
      "structure_details": {"format": "单循环"}
    },
    {
      "game_id": 2,
      "structure_type": "决赛",
      "structure_details": {"format": "BO3"}
    }
  ]
}
```

**批量录入分数**
```http
POST /matches/games/1/scores
Content-Type: application/json
X-API-Key: your-key

{
  "points": 150,
  "user_id": 101,
  "team_id": 1
}
```

### 场景3: 查询比赛数据

**查询比赛总览**
```http
GET /matches/1
```

**查询特定赛程的分数**
```http
GET /matches/games/1/scores
```

**查询队伍信息**
```http
GET /teams/1
```

## ✏️ 数据修改操作

### 修改用户信息
目前API不直接支持用户信息修改，需要通过删除重建实现。

### 修改队伍信息
目前API不直接支持队伍信息修改，但可以管理队伍成员：

```http
# 移除成员
DELETE /teams/1/members/123
X-API-Key: your-key

# 重新添加成员
POST /teams/1/members/456
X-API-Key: your-key
```

### 修改分数记录
目前API不支持直接修改分数，如需修改分数：

1. **实时比赛**: 通过 `/live/events` 上报新的事件来累加分数
2. **历史数据**: 需要重新创建分数记录

### 修改比赛信息
目前API不直接支持比赛信息修改，建议在创建时仔细填写。

## 🚨 错误处理

常见错误响应格式：

```json
{
  "detail": "User not found"
}
```

常见错误码：
- `400`: 请求数据格式错误
- `401`: 缺少或无效的API密钥
- `404`: 资源不存在
- `422`: 数据验证失败

## 📡 WebSocket 实时推送

### 连接WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/live/1');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Live update:', data);
};
```

### 接收的数据格式
```json
{
  "match_id": 1,
  "match_name": "2025春季杯",
  "total_leaderboard": [
    {
      "rank": 1,
      "team_id": 1,
      "team_name": "猛虎队",
      "total_points": 250
    }
  ],
  "current_match_game": {
    "match_game_id": 1,
    "game_name": "英雄联盟5v5",
    "structure_type": "小组赛",
    "teams": [
      {
        "team_id": 1,
        "team_name": "猛虎队",
        "score": 150
      }
    ]
  },
  "last_event": {
    "match_game_id": 1,
    "user_id": 101,
    "description": "Team 1 scored 10 points."
  }
}
```

## 💡 最佳实践

1. **创建比赛前准备**：先创建所有必要的用户、队伍和比赛项目
2. **实时比赛**：使用 `/live/events` 接口上报事件，系统会自动计算分数和排名
3. **数据一致性**：删除或修改数据前，先查询相关依赖关系
4. **错误处理**：始终检查API响应的状态码和错误信息
5. **WebSocket连接**：在比赛开始前建立WebSocket连接，确保不错过任何更新

## 🔍 快速测试

启动服务器后，访问 [http://localhost:8000/docs](http://localhost:8000/docs) 可以使用Swagger UI进行交互式API测试。

---

如有疑问，请参考项目的 `README.md` 或查看源代码中的注释。