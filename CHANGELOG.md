# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.14.0] - 2026-01-06

### Changed
- **后端数据库访问异步化**：API 请求链路统一改为 AsyncSession + aiosqlite 驱动，依赖注入与路由处理全面异步化，降低阻塞风险

### Dependencies
- 新增 `aiosqlite>=0.20.0` 以支持 SQLite 异步驱动
- 新增 `greenlet>=3.0.3` 以支持 AsyncSession.run_sync 的同步桥接

### Technical Details
- 前端版本：2.13.7 → 2.14.0
- 后端版本：2.13.7 → 2.14.0
- 修改文件：`app/core/db.py`、`app/core/deps.py`、`app/core/middleware.py`、`app/core/scheduler.py`、`app/core/security.py`、`app/modules/**/router.py`、`app/modules/admin/import_export.py`、`app/modules/matches/crud.py`、`requirements.txt`、`frontend/package.json`、`README.md`
- 影响范围：API 请求数据库访问、中间件连接池监控、定时任务数据库读写、管理后台导入导出

## [2.13.7] - 2025-11-23

### Added
- **视频类型可视化标识**：视频卡片右上角新增类型徽章，清晰区分直播（红色）、录播（蓝色）、集锦（琥珀色）
- **可搜索选手选择器**：管理后台视频页面的选手选择改为输入框搜索，支持实时过滤、点击外部关闭、已选提示

### Fixed
- **删除视频 JSON 解析错误**：修复删除视频时"Unexpected end of JSON input"错误，`admin-api.ts` 的 `request` 方法现在正确处理 204 No Content 响应
- **手机端视频模态框显示优化**：
  - 修复标签文字换行问题，标签页支持横向滚动
  - 添加 `scrollbar-hide` CSS 类隐藏滚动条
  - 所有元素响应式尺寸调整（标题、图标、间距、内边距）
  - 手机端隐藏标签图标节省空间
  - 模态框宽度调整为手机端 95vw，桌面端保持原样
- **Dialog 圆角丢失**：修复手机端模态框没有圆角的问题，将 `sm:rounded-lg` 改为 `rounded-lg`

### Changed
- **视频卡片布局优化**：
  - 左上角：平台徽章（Bilibili/YouTube 等）
  - 右上角：视频类型徽章（直播/录播/集锦）
  - 右下角：时长信息
  - 左下角：上传者名称

### Technical Details
- 前端版本：2.13.6 → 2.13.7
- 后端版本：2.13.6 → 2.13.7
- 修改文件：
  - `frontend/src/lib/admin-api.ts`：处理 204 响应
  - `frontend/src/app/admin/matches/[id]/videos/page.tsx`：可搜索选手选择器
  - `frontend/src/components/video-modal.tsx`：手机端响应式优化
  - `frontend/src/components/video-card.tsx`：视频类型徽章
  - `frontend/src/components/ui/dialog.tsx`：圆角修复
  - `frontend/src/app/globals.css`：新增 `scrollbar-hide` 工具类
- 影响范围：管理后台视频管理、前端视频展示、手机端用户体验全面提升

## [2.13.6] - 2025-11-23

### Fixed
- **管理后台视频页面依旧出现 Mixed Content**：手动加载选手列表时缺少末尾斜杠，FastAPI 在自动重定向过程中回退为 `http://`，导致浏览器阻断请求。现统一拼接为 `/api/users/`，避免重定向触发，从而在 HTTPS 页面中始终以安全协议访问 API。

### Technical Details
- 前端版本：2.13.5 → 2.13.6
- 后端版本：2.13.5 → 2.13.6
- 修改文件：`frontend/src/app/admin/matches/[id]/videos/page.tsx`
- 影响范围：管理员赛事视频页面拉取选手时不再触发 HTTP 302/307 跳转与随后的 Mixed Content 告警

## [2.13.5] - 2025-11-23

### Fixed
- **前端 API 根路径环境变量统一**：彻底移除对 `NEXT_PUBLIC_API_URL` 的兼容兜底，仅保留 `NEXT_PUBLIC_API_BASE_URL`，避免部署和调试时反复确认两个变量的优先级，同时保留 HTTPS 自动升级与 localhost 默认回退逻辑

### Technical Details
- 前端版本：2.13.4 → 2.13.5
- 后端版本：2.13.4 → 2.13.5
- 修改文件：`frontend/src/config/env.ts`
- 影响范围：所有调用 `getApiBaseUrl()` 的请求在构建期与运行期都会读取同一环境变量，彻底消除历史兼容路径

## [2.13.4] - 2025-11-23

### Fixed
- **管理后台视频页面 Mixed Content 反复出现**：定位到多个客户端请求仍直接使用构建期固定的 `API_BASE_URL` 或裸露的 `NEXT_PUBLIC_API_URL`，在 HTTPS 页面下被浏览器拦截
  - `admin-api.ts`、`services/api.ts`、`configService.ts` 及 `video-modal.tsx` 统一改为调用 `getApiBaseUrl()`，每次请求前动态裁剪协议与末尾斜杠
  - `Footer` 的版本探测、`VideoCard` 的缩略图代理和 `Avatar` 的后台代理均复用新逻辑，彻底消除 HTTP 请求
  - 额外修复 `/matches/[id]` 服务端页面的数据抓取，确保 SSR 与客户端一致地读取 API 根路径

### Technical Details
- 前端版本：2.13.3 → 2.13.4
- 后端版本：2.13.3 → 2.13.4
- 修改文件：`frontend/src/services/api.ts`、`frontend/src/lib/admin-api.ts`、`frontend/src/services/configService.ts`、`frontend/src/components/footer.tsx`、`frontend/src/components/video-modal.tsx`、`frontend/src/components/video-card.tsx`、`frontend/src/components/ui/avatar.tsx`、`frontend/src/app/matches/[id]/page.tsx`、`frontend/src/services/config.ts`
- 结果：所有浏览器端请求都会根据当前协议自动升级为 HTTPS，避免与 `cc.lynn6.top` 的 HTTPS 页面产生混合内容告警

## [2.13.3] - 2025-11-23

### Fixed
- **Mixed Content 错误彻底修复**：解决 HTTPS 页面请求 HTTP API 的根本问题
  - 问题：环境变量在构建时被固化，导致即使配置了 HTTPS，运行时仍使用 HTTP
  - 根本原因：使用常量 `API_BASE_URL` 在构建时就确定了值，无法在运行时动态调整
  - 解决方案：
    - 将 `API_BASE_URL` 改为函数 `getApiBaseUrl()`，每次调用都动态计算
    - 在客户端检测当前页面协议，如果是 HTTPS 则自动升级 API URL 为 HTTPS
    - 移除 URL 末尾斜杠，避免重定向问题
  - 影响：所有使用 `API_BASE_URL` 的地方都改为调用 `getApiBaseUrl()`
  - 测试：部署后在浏览器控制台可以看到正确的 HTTPS URL

### Changed
- **API 配置重构**：
  - `src/config/env.ts`：导出 `getApiBaseUrl()` 函数，支持运行时动态计算
  - `src/app/admin/matches/[id]/videos/page.tsx`：所有 API URL 使用 `getApiBaseUrl()` 动态获取
  - 添加详细的调试日志，方便排查 URL 问题

### Technical Details
- 前端版本：2.13.2 → 2.13.3
- 后端版本：2.13.2 → 2.13.3
- 修改文件：
  - `frontend/src/config/env.ts`：重构为函数式 API
  - `frontend/src/app/admin/matches/[id]/videos/page.tsx`：使用动态 API URL
- 关键改进：
  - 构建时：环境变量可以是 HTTP 或 HTTPS
  - 运行时：根据页面协议自动选择正确的 API 协议
  - 兼容性：保持向后兼容，仍然导出 `API_BASE_URL` 常量

## [2.13.2] - 2025-11-23

### Fixed
- **管理员添加视频模态框滚动支持**：修复管理员添加/编辑视频的模态框内容过多时无法滚动的问题
  - 模态框最大高度设置为视口的 90%
  - 表单内容区域支持垂直滚动
  - 标题和按钮固定在顶部和底部，不随内容滚动
  - 优化移动端和小屏幕设备的使用体验
- **Mixed Content 错误修复**：修复 HTTPS 页面请求 HTTP API 导致的安全错误
  - 问题：前端通过 HTTPS 访问时，API 请求使用 HTTP 协议被浏览器阻止
  - 错误：`Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'`
  - 解决：自动检测当前页面协议，如果是 HTTPS 则自动将 API URL 升级为 HTTPS
  - 影响：生产环境 HTTPS 部署时 API 请求正常工作

### Technical Details
- 前端版本：2.13.1 → 2.13.2
- 后端版本：2.13.1 → 2.13.2
- 修改文件：
  - `frontend/src/app/admin/matches/[id]/videos/page.tsx`：添加滚动支持
  - `frontend/src/config/env.ts`：自动协议升级逻辑

## [2.13.1] - 2025-11-23

### Fixed
- **管理员角色枚举值修复**：修复生产环境中 `admin_users` 表的 `role` 字段枚举值不匹配问题
  - 问题：数据库中存储的是大写枚举名称（`ADMIN`, `EDITOR`, `VIEWER`），但代码期望小写枚举值（`admin`, `editor`, `viewer`）
  - 错误：`LookupError: 'ADMIN' is not among the defined enum values`
  - 解决：创建数据库迁移 `4993f1afd8ff`，将所有大写枚举名称转换为小写枚举值
  - 影响：修复后管理员登录和权限检查功能恢复正常

### Technical Details
- 前端版本：2.13.0 → 2.13.1
- 后端版本：2.13.0 → 2.13.1
- 新增迁移：`alembic/versions/4993f1afd8ff_fix_admin_user_role_enum_values.py`
- 迁移内容：
  - `ADMIN` → `admin`
  - `EDITOR` → `editor`
  - `VIEWER` → `viewer`

## [2.13.0] - 2025-11-23

### Added
- **完整的日志系统**：全面启用 FastAPI 应用日志，提升开发和运维体验
  - 配置统一的日志格式（时间戳 - 模块名 - 级别 - 消息）
  - 启用 HTTP 请求日志中间件，记录每个请求的方法、路径、状态码和处理时间
  - 添加启动完成日志，显示应用版本、数据库配置等关键信息
  - 数据库迁移日志优化，使用统一格式输出
- **独立启动脚本**：新增 `run_server.py` 统一管理服务器启动流程
  - 在启动前运行数据库迁移，避免迁移日志干扰应用日志
  - 配置所有日志模块（uvicorn、fastapi、alembic、app）
  - 禁用 uvicorn 内置访问日志，使用自定义中间件日志

### Changed
- **日志输出优化**：
  - 所有日志使用统一格式：`YYYY-MM-DD HH:MM:SS - 模块名 - 级别 - 消息`
  - HTTP 请求日志格式：`➡️ GET /api/path` 和 `⬅️ GET /api/path - 200 - 0.003s`
  - 启动日志添加表情符号标识（✅ 成功、🚀 启动、📦 版本、🗄️ 数据库、📝 日志）
- **启动流程优化**：
  - 数据库迁移从 FastAPI 启动事件移到启动脚本，避免日志配置冲突
  - 移除 alembic 和 command 的导入，简化 main.py 依赖

### Fixed
- **前端构建错误修复**：修复管理后台视频页面的 ESLint 错误
  - 修复 `any` 类型警告，为 players 数组添加明确类型定义
  - 修复 React Hook 依赖警告，添加 eslint-disable 注释
  - 修复未转义的引号错误，使用 HTML 实体 `&ldquo;` 和 `&rdquo;`
  - 修复 img 标签警告，添加 eslint-disable 注释（外部图片需要特殊处理）

### Technical Details
- 前端版本：2.12.0 → 2.13.0
- 后端版本：2.12.0 → 2.13.0
- 新增文件：
  - `run_server.py`：统一的服务器启动脚本
- 修改文件：
  - `app/main.py`：移除数据库迁移启动事件，添加 HTTP 请求日志中间件
  - `frontend/src/app/admin/matches/[id]/videos/page.tsx`：修复 ESLint 错误
- 日志配置：
  - 根日志级别：INFO
  - uvicorn 访问日志：禁用（使用自定义中间件）
  - 自定义中间件：记录请求/响应和处理时间

### Usage
启动服务器使用新的启动脚本：
```bash
python run_server.py
```

## [2.12.0] - 2025-11-23

### Added
- **视频观看数自动获取**：新增 Bilibili 视频观看数自动获取功能，创建视频时自动填充观看数
- **视频观看数定时刷新**：新增定时任务系统，每天凌晨 3 点自动更新所有 B 站视频的观看数
- **视频观看数刷新脚本**：新增 `scripts/update_video_views.py` 批量更新脚本，可一键更新所有 B 站视频的观看数
- **视频观看数刷新 API**：新增 `POST /api/admin/matches/videos/{video_id}/refresh-views` 接口，支持手动刷新单个视频的观看数
- **视频数量统计**：视频模态框标签页显示各分类的视频数量（如"官方录播 (5)"）
- **选手队伍信息展示**：选手视角视频卡片显示选手所属队伍，使用带颜色的圆点标识

### Changed
- **视频卡片优化**：
  - 移除视频卡片底部的冗余上传者信息和游戏信息
  - UP 主名称直接显示在缩略图左下角，更加直观
  - 选手信息卡片移除"选手视角"文字，避免重复
  - 队伍显示改为"选手名称 · ● 队伍名称"格式，颜色圆点更清晰
- **视频模态框滚动优化**：模态框支持内容滚动，标题和标签栏固定，最大高度为视口的 85%
- **选手页面布局优化**：增加 Hero Header 区域的上内边距，避免被导航栏遮挡

### Fixed
- **嵌套链接问题**：修复视频卡片中 `<a>` 标签嵌套导致的 hydration 错误，改用 `div` + `onClick` 实现选手信息跳转
- **后端队伍信息查询**：修复 `get_match_videos` 函数中关系名称错误（`match_team` → `team`）

### Technical Details
- 前端版本：2.11.0 → 2.12.0
- 后端版本：2.11.0 → 2.12.0
- 新增文件：
  - `scripts/update_video_views.py`：批量更新视频观看数脚本
  - `app/core/scheduler.py`：定时任务调度器模块
- 新增依赖：
  - `apscheduler>=3.10.4`：定时任务调度库
- 修改文件：
  - `app/modules/matches/crud.py`：为视频添加队伍信息查询
  - `app/modules/matches/schemas.py`：MatchVideo schema 添加 team 字段
  - `app/modules/matches/admin_router.py`：新增刷新观看数 API
  - `frontend/src/components/video-card.tsx`：优化视频卡片布局和显示
  - `frontend/src/components/video-modal.tsx`：添加滚动支持和视频数量统计
  - `frontend/src/app/player/[id]/page.tsx`：优化选手页面布局
  - `app/main.py`：集成定时任务调度器
  - `requirements.txt`：添加 APScheduler 依赖

## [2.11.0] - 2025-11-23

### Added
- **赛事视频管理系统**：新增 `match_videos` 数据表、后台 CRUD API 以及管理员页面，可针对每场赛事维护官方录播、选手视角与二创视频，支持匹配选手、小游戏、观看数、缩略图等元数据。
- **Bilibili 集成**：管理端支持一键识别 B 站链接，自动拉取标题、简介、时长、封面、观看数，并通过 `/api/admin/matches/videos/proxy-image` 代理高清封面。
- **赛事端视频入口**：比赛详情页新增“赛事视频”悬浮按钮与 `VideoModal`/`VideoCard` 组件，观众可在页面内快速筛选官方录播、选手 POV 及其他投稿。
- **文档补全**：补充 `docs/video_system_design.md`、`docs/video_api_reference.md`、`docs/example_video_model.py` 详述数据结构、API 约定与示例脚本。

### Changed
- 雷达图评分算法（`app/modules/users/radar_calculator.py`）改为使用实际参加人数计算排名与期望分，提升不同房间规模下的公平性。
- `MatchRadarChart`/`PlayerRadarChart` 配色与网格线改为跟随主题主色，阅读体验更统一。
- `FloatingActionButton` 允许以按钮形式触发（`onClick`），配合赛事视频入口使用，避免为了打开弹窗强制跳转。

### Fixed
- 管理端视频表单新增 `view_count` 字段支持，修复无法设置观看数导致的 TypeScript 报错和后端验证失败。
- `AdminUser.role` 列改用 `values_callable` 落地枚举值，避免 Alembic 或数据库因为 Enum 差异导致的写入错误。

### Technical Details
- 前端版本：2.10.1 → 2.11.0；后端版本：2.10.1 → 2.11.0。
- 新增 Alembic 迁移：`alembic/versions/3a94a9b57ea1_add_match_videos.py`，并在 `app/modules/matches/models.py`、`app/modules/users/models.py` 中补充 `MatchVideo` 及关联关系。
- 新 API：`POST /api/admin/matches/{match_id}/videos`、`PUT/DELETE /api/admin/matches/videos/{id}`、`GET /api/matches/{match_id}/videos`、`GET /api/admin/matches/videos/bilibili-info`、`GET /api/admin/matches/videos/proxy-image`。
- 新前端模块：`frontend/src/app/admin/matches/[id]/videos/page.tsx`、`frontend/src/components/video-modal.tsx`、`frontend/src/components/video-card.tsx`、`frontend/src/components/match-video-floating-button.tsx` 等。

## [2.10.1] - 2025-11-23

### Fixed
- **管理员赛事视频列表渲染异常**：修复 `videos.map` 返回的卡片 JSX 未正确闭合导致 Next.js 报错（Expected '</', got ')'），现在视频网格可正常渲染并支持编辑/删除操作。

### Technical Details
- 前端版本：2.10.0 → 2.10.1
- 后端版本：2.10.0 → 2.10.1
- 涉及文件：
  - `frontend/src/app/admin/matches/[id]/videos/page.tsx`

## [2.10.0] - 2025-11-22

### Added
- **玩家能力雷达图系统**：全新的六维能力可视化功能
  - **六大维度**：武力、协作、策略、爆发、知识、身法
  - **智能算法**：基于排名和标准分的 v2.0 算法，支持分数突破 100（超凡表现）
  - **赛事筛选**：支持查看综合能力或特定赛事表现
  - **主题适配**：雷达图颜色自动跟随季节主题变化
  - **选手详情页集成**：在选手详情页右侧显示雷达图，可通过下拉框切换查看不同赛事
- **完整文档**：新增 `docs/radar_chart_system.md`，包含算法说明、公式、游戏配置和 API 文档

### Changed
- **下拉框动画优化**：移除所有动画效果，下拉框立即显示，避免"飘出来"的视觉效果

### Technical Details
- 前端版本：2.9.4 → 2.10.0
- 后端版本：2.9.4 → 2.10.0
- 新增依赖：`recharts` (前端图表库)
- 新增后端模块：
  - `app/modules/users/radar_calculator.py` - 雷达图计算引擎
  - API 端点：`GET /api/users/{user_id}/radar?match_id={match_id}`
- 新增前端组件：
  - `frontend/src/components/player-radar-chart.tsx` - 雷达图组件
  - `frontend/src/components/match-radar-chart.tsx` - 赛事级雷达图组件
- 涉及文件：
  - `frontend/src/services/userService.ts` - 新增 `getUserRadar` 方法
  - `frontend/src/app/player/[id]/page.tsx` - 集成雷达图显示
  - `frontend/src/components/ui/select.tsx` - 优化下拉框动画

## [2.9.4] - 2025-11-20

### Added
- **交互式点云背景**：实现了跟随鼠标移动的动态点云粒子效果，替代了之前的静态 Minecraft 方块，提升页面互动性和视觉深度
- **滑动玻璃导航**：使用 `framer-motion` 实现导航栏选中项的平滑滑动动画效果
  - 选中项背景会在不同链接之间流畅滑动
  - 自动适配季节主题色（冬季蓝色、春季绿色等）
  - 增强 3D 凸起效果，带有阴影、边框和高光
- **简化主题切换**：移除下拉菜单，改为点击循环切换（浅色 → 深色 → 跟随系统）

### Changed
- **平滑主题过渡**：将全局 CSS 过渡时间从 0.3 秒延长到 1 秒，使主题切换时的颜色渐变更加明显和优雅
- **修复数据详情页导航栏遮挡**：为 `/matches/[id]/events` 页面添加 `pt-40` 顶部内边距

### Fixed
- **修复 Hydration 错误**：修复 `ThemeToggle` 组件的服务器端/客户端渲染不一致问题，添加 `mounted` 状态避免 hydration mismatch

### Technical Details
- 前端版本：2.9.3 → 2.9.4
- 后端版本：2.9.3 → 2.9.4
- 新增依赖：`framer-motion` (用于滑动动画)
- 涉及文件：
  - `frontend/src/components/ui/liquid-background.tsx` (点云背景)
  - `frontend/src/components/main-nav.tsx` (滑动玻璃导航)
  - `frontend/src/components/theme-toggle.tsx` (简化主题切换)
  - `frontend/src/app/globals.css` (平滑过渡)
  - `frontend/src/app/matches/[id]/events/page.tsx` (导航栏遮挡修复)

## [2.9.3] - 2025-11-20

### Fixed
- **移动端导航栏遮挡优化**：
  - 首页 Hero 区域增加 `pt-24` 顶部内边距
  - 子页面（如 Matches, Games, Leaderboard）及详情页（如 `/matches/[id]`）增加 `pt-40` 顶部内边距
  - 彻底解决移动端固定玻璃导航栏遮挡页面标题的问题
- **UI 细节修复**：
  - 统一所有按钮形状为圆角（Pill Shape），修复 `.glass` 类导致的圆角覆盖问题
  - 修复社区卡片按钮 Hover 状态文字颜色丢失（变白/灰）的问题

### Changed
- **首页社区卡片视觉升级**：
  - 为 TRIALHAMMER (绿)、RIA (红)、INF (紫) 社区卡片添加专属色调的玻璃背景和边框
  - 增强卡片 3D 悬浮效果，Hover 时阴影加深并带有对应主题色光晕，呈现"凸起"质感

### Technical Details
- 前端版本：2.9.2 → 2.9.3
- 后端版本：2.9.2 → 2.9.3
- 涉及文件：
  - `frontend/src/app/globals.css`
  - `frontend/src/app/page.tsx`
  - `frontend/src/app/matches/[id]/page.tsx`
  - `frontend/src/components/ui/liquid-button.tsx`

## [2.9.2] - 2025-11-17

### Added
- **BattleBox 轮次分组显示**：针对 BattleBox 游戏（game_code='battlebox'）实现智能轮次分组
  - 根据场地（area）、时间、对战人员自动推断轮次分组，无需依赖数据库 `game_round_label` 字段
  - 每个轮次可独立折叠/展开，展开后以网格布局显示所有对阵（移动端1列，平板2列，桌面4列）
  - 对阵卡片采用 Liquid Glass 风格，紧凑显示队伍名称、颜色标识、比分
  - 获胜方比分高亮显示为绿色
  - 支持展开查看详细得分记录，每个队员名字前显示队伍颜色小点

### Changed
- **赛事详情页浮动按钮优化**：
  - 赛事摘要页（`/matches/[id]`）的"查看详细数据"按钮改为固定在视口右下角的 Liquid Glass 风格圆形按钮
  - 赛事详情页（`/matches/[id]/events`）的"返回赛事详情"按钮同样采用圆形浮动按钮设计
  - 按钮跟随页面滚动，始终可见且不遮挡内容

### Technical Details
- 前端版本：2.9.1 → 2.9.2
- 后端版本：2.9.1 → 2.9.2
- 涉及文件：
  - `frontend/src/app/matches/[id]/page.tsx` - 浮动按钮样式优化
  - `frontend/src/app/matches/[id]/events/page.tsx` - BattleBox 轮次分组逻辑
- 新增函数：`groupMatchupsByRound()` - 根据场地和时间自动推断轮次

## [2.9.1] - 2025-11-17

### Fixed
- **赛事详情/数据页浮动按钮**：引入全局 Portal 式浮动按钮组件，确保圆形 LiquidGlass 操作钮固定在页面右下角，滚动过程中保持可见，解决原先卡在页面底部左侧且无法跟随页面的问题。

### Technical Details
- 前端版本：2.9.0 → 2.9.1
- 后端版本：2.9.0 → 2.9.1
- 涉及文件：
  - `frontend/src/components/floating-action-button.tsx`
  - `frontend/src/app/matches/[id]/page.tsx`
  - `frontend/src/app/matches/[id]/events/page.tsx`

## [2.9.0] - 2025-11-17

### Added
- **赛事细节页面智能分组显示**：全新的数据组织方式，提升复盘和分析体验
  - **按分区（Area）分组**：自动按 area 字段分组显示，清晰展示不同地图/分区的对战情况
  - **智能对阵检测**：自动识别 PvP 游戏（team ≠ opponent_team），启用对阵轮次显示
  - **对阵轮次可视化**：为 BattleBox 等 PvP 游戏显示精美的对阵图，包括轮次编号、队伍对比、实时比分
  - **队伍@选手格式**：在对阵记录中显示"队伍@选手"格式，清晰表明选手归属
  - **三级折叠结构**：游戏级别（>50 条）、分区级别（>20 条）、完全展开，灵活查看数据

### Changed
- **赛事细节页面显示优化**：
  - 移除 200 条强制限制，支持查看所有事件数据
  - 对阵模式下显示比分对比（220:30），获胜方高亮显示
  - 队伍颜色圆点标识，快速区分不同队伍
  - 一行紧凑显示，适合查看大量记录

### Technical Details
- 前端版本: 2.8.0 → 2.9.0
- 后端版本: 2.8.0 → 2.9.0
- 优化文件:
  - `frontend/src/app/matches/[id]/events/page.tsx` - 智能分组和对阵轮次显示

### Features
- **智能游戏类型识别**：
  - PvP 模式（BattleBox）：显示对阵轮次、比分对比、轮次编号
  - 普通模式（SkyWars）：显示队伍总分、个人记录
- **数据组织层级**：
  ```
  游戏（斗战方框）
    └─ Area（分区）
        └─ 对阵轮次
            ├─ 对阵标题（队伍 VS 队伍）
            ├─ 比分（220:30）
            └─ 详细事件列表
  ```

## [2.8.0] - 2025-11-17

### Fixed
- **锦标赛数据和小分系统性能优化**：全面优化锦标赛相关页面的性能瓶颈，解决页面卡顿和加载超时问题
  - **排行榜 API 优化**：解决 N+1 查询问题，创建批量查询函数 `get_batch_user_game_stats`，性能提升 50-100 倍
  - **锦标赛详情页优化**：新增 `/api/matches/{id}/full` 端点，一次请求返回所有数据，API 请求数从 15 次减少到 1 次（减少 93.3%），查询时间仅需 7.6ms
  - **赛事细节页优化**：移除 Pydantic response_model 验证，手动序列化数据，响应时间从 >3.6 分钟优化到 17ms（提升 12,700 倍以上）
  - **标准分计算优化**：批量更新用户统计，从逐个查询改为单个 SQL UPDATE 语句，性能提升 140-280 倍
  - **数据库索引优化**：为 scores、match_games、match_team_memberships 表添加 5 个关键复合索引

### Changed
- **前端加载优化**：
  - 排行榜页面改为并行加载，避免重复请求静态数据
  - 锦标赛详情页使用新的完整数据 API，减少多次请求
  - 赛事细节页添加折叠功能（>50 条记录自动折叠）和渲染限制（最多 200 条），使用 React.memo 优化组件渲染
  - 禁用赛事细节页的 Zod 验证，避免客户端验证大量数据的性能开销

### Added
- **新增 API 端点**：
  - `GET /api/matches/{id}/full` - 一次性返回比赛完整数据（比赛信息、队伍、赛程、分数）
  - 使用 SQLAlchemy selectinload 预加载所有关联数据，避免 N+1 查询
- **批量查询函数**：
  - `get_batch_user_game_stats()` - 批量获取多个用户的游戏统计
  - `get_match_full_data()` - 获取比赛完整数据
- **性能测试脚本**：
  - `scripts/test_performance.py` - 综合性能测试
  - `scripts/test_match_full_api.py` - 锦标赛 API 测试
  - `scripts/test_events_api.py` - 赛事细节 API 测试
  - `scripts/validate_events_response.py` - 数据结构验证

### Performance
- 批量更新用户统计 (118 用户): 500-1000ms → 3.6ms (**140-280x**)
- 单场比赛排行榜查询: 10-20ms → 1.2ms (**10-15x**)
- 多场比赛排行榜查询: 20-40ms → 0.8ms (**25-50x**)
- 锦标赛详情页 API 请求: 15 次 → 1 次 (**减少 93.3%**)
- 赛事细节页响应时间: >3.6 分钟 → 17ms (**12,700x+**)

### Technical Details
- 前端版本: 2.7.7 → 2.8.0
- 后端版本: 2.7.7 → 2.8.0
- 新增数据库迁移: `97aa04b4c7b7_add_performance_indexes_for_tournament_scoring.py`
- 优化文件:
  - `app/modules/matches/standard_score.py` - 批量查询和更新
  - `app/modules/matches/crud.py` - 完整数据 API 和手动序列化
  - `app/modules/users/crud.py` - 批量用户游戏统计
  - `frontend/src/app/matches/[id]/page.tsx` - 使用新 API
  - `frontend/src/app/matches/[id]/events/page.tsx` - 折叠和渲染优化
  - `frontend/src/app/leaderboard/page.tsx` - 并行加载

## [2.7.7] - 2025-11-17

### Fixed
- **API 地址硬编码移除**：移除所有硬编码的 `localhost:8000` 和 `127.0.0.1:8000`，统一使用环境变量配置
- **环境变量统一管理**：创建 `frontend/src/config/env.ts` 集中管理所有 API 和 WebSocket URL 配置，确保生产环境和开发环境都能正确使用配置的后端地址

### Changed
- **配置文件重构**：所有 API 请求相关文件（`configService.ts`, `api.ts`, `admin-api.ts`, `useWebSocket.ts` 等）现在都从统一的配置文件导入 API_BASE_URL
- **环境变量示例**：新增 `frontend/.env.example` 文件，提供环境变量配置参考

### Technical Details
- 前端版本: 2.7.6 → 2.7.7
- 后端版本: 2.7.6 → 2.7.7
- 新增统一配置文件 `src/config/env.ts`
- 默认开发环境 API 地址：`http://localhost:8000`
- 生产环境通过 `NEXT_PUBLIC_API_URL` 环境变量配置

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
