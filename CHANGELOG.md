# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.1] - 2025-11-17

### Fixed
- **赛事加载错误**: 修正 `/api/games/{id}` 的赛程关联加载，避免游戏详情请求异常导致前端 “Failed to fetch”
- **时间显示**: 游戏详情页 “入选锦标赛” 开赛时间增加年份，避免跨年数据误读

### Technical Details
- 前端版本: 2.4.0 → 2.4.1
- 后端版本: 2.4.0 → 2.4.1

---

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
