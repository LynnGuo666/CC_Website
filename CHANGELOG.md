# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2025-11-17

### Added
- **管理员 API Key 绑定**: `admin_users` 表新增 `api_key` 字段，通过 Alembic 迁移为既有账号生成唯一密钥，管理员列表/详情接口可直接查看该密钥并用于脚本调用

### Changed
- **接口鉴权方式**: `get_api_key` 依赖现在校验管理员激活状态与 **Editor** 以上权限，并使用数据库中的密钥进行校验，彻底移除 `.env` 中的全局 API Key
- **导入与自动化脚本**: `scripts/import_score_events.py` 触发重算时必须显式传入 `--api-key`，`import/*.py` 示例以及 `docs/docs.md` 全部更新为提示从管理员账号详情页复制密钥
- **管理员接口体验**: 管理员创建/更新接口增加 API Key 唯一性校验，可选择传入自定义密钥，留空则自动生成新密钥并在响应中返回

### Technical Details
- 前端版本: 2.5.0 → 2.6.0
- 后端版本: 2.5.0 → 2.6.0
- 数据库迁移: `833c185998bb_add_admin_api_keys.py`

## [2.4.2] - 2025-11-17

### Fixed
- **比赛事件用户引用**: 修复 `ScoreEvent` 中 `user` 字段的 Pydantic 前向引用解析问题，解决后端启动时报 `PydanticUndefinedAnnotation: name 'User' is not defined` 的错误，保障赛事事件列表可正常返回用户信息

### Technical Details
- 前端版本: 2.4.1 → 2.4.2
- 后端版本: 2.4.1 → 2.4.2

## [2.4.1] - 2025-11-17

### Fixed
- **赛事加载错误**: 修正 `/api/games/{id}` 的赛程关联加载，避免游戏详情请求异常导致前端 “Failed to fetch”
- **时间显示**: 游戏详情页 “入选锦标赛” 开赛时间增加年份，避免跨年数据误读

### Technical Details
- 前端版本: 2.4.0 → 2.4.1
- 后端版本: 2.4.0 → 2.4.1

---

## [2.5.0] - 2025-11-17

### Added
- **细粒度小分表**: 新建 `score_events` 表，记录锦标赛与小游戏的轮次、对阵、选手、倍率等详细小分；提供 `/api/matches/{id}/events` 接口返回分组数据
- **导入工具**: 新增 `scripts/import_score_events.py`，支持从 CSV 映射 `external_team_id`、导入细分记录并可触发标准分重算
- **前端数据页**: 新增 `/matches/[id]/events` 子页面展示详细赛事数据，主赛事页提供入口按钮跳转

### Changed
- **赛事页互跳**: 主赛事页仅保留概览，详细数据迁移到子页面，避免加载冗余信息

### Technical Details
- 前端版本: 2.4.2 → 2.5.0
- 后端版本: 2.4.2 → 2.5.0

## [2.4.0] - 2025-11-17

### Added
- **赛事关联展示**: 游戏详情页新增被选中的锦标赛列表，可直接跳转查看赛程详情
- **API 输出强化**: `/api/games/{id}` 现在返回 `selected_matches` 列表，包含赛事状态与时间信息，便于前端复用

### Changed
- **加载体验统一**: 游戏详情页的加载动画改为玻璃拟态骨架，与其他页面风格保持一致
- **赛事互跳**: 锦标赛详情中的赛程标题支持点击跳转到对应游戏详情，提升导航一致性

### Technical Details
- 前端版本: 2.3.0 → 2.4.0
- 后端版本: 2.3.0 → 2.4.0

---

## [2.3.0] - 2025-11-17

### Added
- **头像反代功能**: 添加后端头像反代 API 端点 `/api/users/avatar/{identifier}/{size}`
  - 当 mc-heads.net 服务不可用时，通过后端反代获取头像
  - 支持自动降级：直接获取 → 后端反代 → 字母头像
  - 后端缓存头设置为 48 小时
- **智能缓存策略**: 优化前端头像缓存逻辑
  - 成功加载的头像缓存 48 小时
  - 失败的头像不缓存，每次重新尝试获取
  - 使用 localStorage 存储缓存状态和时间戳

### Changed
- **游戏页面优化**: 更新游戏介绍页面副标题
  - 从"直接浏览后台配置的小游戏项目。"改为"查看所有游戏项目及详情"
  - 移除"数据来源：后端 /api/games"徽章，简化界面

### Dependencies
- 添加 `httpx>=0.27.0` 用于后端异步 HTTP 请求

### Technical Details
- 前端版本: 2.2.0 → 2.3.0
- 后端版本: 2.2.0 → 2.3.0

---

## [2.2.0] - 2025-11-16

### Added
- 队伍系统功能
- 管理后台增强
- 用户管理功能优化

### Changed
- 优化页面样式和季节主题切换功能
- 改进导入 CSV 按钮的交互体验

---

## [2.1.0] - 2024-XX-XX

### Added
- 季节主题支持
- 排行榜系统
- 用户统计功能

---

## [2.0.0] - 2024-XX-XX

### Added
- 初始版本发布
- 基础游戏管理功能
- 比赛记录系统
- 用户管理系统
