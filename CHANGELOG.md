# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.6] - 2025-11-17

### Fixed
- **管理后台页面顶部 padding 移除**：修复管理后台页面仍然继承主站布局的 `pt-20 sm:pt-24` padding 问题，AdminLayout 的 useEffect 现在直接操作 DOM 将 `main > div` 的 paddingTop 设置为 0，确保管理后台页面内容从顶部开始显示
- **站点配置页面鉴权统一**：修复站点配置页面 401 错误，从直接使用 fetch + context token 改为使用 adminAPI 统一鉴权机制。在 adminAPI 中新增 `getSiteConfig()` 和 `updateSiteConfig()` 方法，与其他管理页面保持一致的 token 管理方式

### Technical Details
- 前端版本: 2.7.5 → 2.7.6
- 后端版本: 2.7.5 → 2.7.6
- AdminLayout 通过 `document.querySelector('main > div')` 直接移除根布局的顶部 padding
- config 页面不再从 useAdminAuth context 直接获取 token，改用 adminAPI 的内部 token 管理

## [2.7.5] - 2025-11-17

### Fixed
- **管理后台导航缺失**：站点配置页补齐管理导航及顶部留白，滚动时导航保持固定且与其他管理页一致
- **主站导航隔离**：管理员路由仅隐藏主站导航与页脚，不再误伤后台导航，同时自动收紧全局顶部偏移避免空白

### Technical Details
- 前端版本: 2.7.4 → 2.7.5
- 后端版本: 2.7.4 → 2.7.5
- MainNav/Footer 增加 data 标记，AdminLayout 读写 `--page-top-offset` 并在卸载时恢复；站点配置页复用登录校验和顶部间距，提交时校验管理员 token

## [2.7.4] - 2025-11-17

### Fixed
- **导航背景融入页面**：顶部导航新增渐变蒙层与全局背景同步过渡，消除最上方的白色条带，在浅色和深色模式下都保持自然融合

### Technical Details
- 前端版本: 2.7.3 → 2.7.4
- 后端版本: 2.7.2 → 2.7.4
- 导航容器增加全幅背景渐变层，避免透明区域与页面背景产生分割

## [2.7.3] - 2025-11-17

### Fixed
- **移动端安全区域适配**：修复手机导航条遮挡内容问题，添加 `safe-area-inset` 支持，自动适配刘海屏和底部导航条
- **背景渐变显示**：修复顶部出现异色分割线问题，确保渐变背景正确覆盖全屏

### Technical Details
- 前端版本: 2.7.2 → 2.7.3
- 添加 `viewport-fit=cover` meta 标签
- 优化 body/html 背景层级关系

## [2.7.2] - 2025-11-17

### Changed
- **小分 CSV 导入确认**：赛事管理页的“小分导入”新增结果对话框，导入后立即展示成功/跳过数量及所有错误行明细，便于复核 `数据测试.csv` 等文件的导入情况

### Technical Details
- 前端版本: 2.7.1 → 2.7.2
- 后端版本: 2.7.1 → 2.7.2

## [2.7.1] - 2025-11-17

### Added
- **管理员密码重置脚本**：新增 `scripts/reset_admin_password.py`，可通过 `.venv/bin/python scripts/reset_admin_password.py --username admin --password <新密码>` 快速重置任意管理员密码，便于线上应急

### Fixed
- **管理员登录兼容旧密码**：登录校验自动识别旧版 bcrypt 哈希，保证从老环境迁移的管理员账号可正常登录；与现有 PBKDF2 存储保持兼容
- **缺失 API Key 自动补齐**：老账户在登录时若 `api_key` 为空，后端自动生成唯一密钥，避免 `/api/admin/me` 等接口序列化 `None` 导致 500 错误

### Technical Details
- 前端版本: 2.7.0 → 2.7.1
- 后端版本: 2.7.0 → 2.7.1

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

## [2.7.0] - 2025-11-17

### Added
- **锦标赛后台管理**: 新增 `/api/admin/matches` 系列端点和前端管理页面，可创建、编辑、删除、开始/结束赛事，并直接查看赛事列表
- **小分 CSV 导入入口**: 后台支持上传 CSV 创建 `ScoreEvent` 细粒度小分记录，可选清空已有数据和导入后自动重算标准分

### Changed
- **脚本逻辑复用**: 将原 CSV 导入脚本的映射与校验逻辑下沉至 `app/modules/matches/importer.py`，供 API 与 CLI 共用，避免重复维护

### Technical Details
- 前端版本: 2.6.0 → 2.7.0
- 后端版本: 2.6.0 → 2.7.0

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
