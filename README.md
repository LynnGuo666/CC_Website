# Championship Website

[![CodeTime Badge](https://shields.jannchie.com/endpoint?style=flat-square&color=222&url=https%3A%2F%2Fapi.codetime.dev%2Fv3%2Fusers%2Fshield%3Fuid%3D31631%26project%3DchampionshipWebsite)](https://codetime.dev)

这是一个基于 FastAPI + Next.js 构建的高度模块化的比赛管理系统。它为管理用户、队伍、比赛项目、具体比赛及其分数提供了完整的 Web 应用和 RESTful API 接口。

## 功能特性

- **用户管理**: 创建和查询用户信息，支持用户统计和排行榜
- **队伍管理**: 创建和查询队伍信息，支持添加/移除队员，并能追溯队员的历史队伍记录
- **比赛项目管理**: 定义不同类型的比赛，支持季节限定项目
- **比赛管理**: 创建和查询具体的比赛，关联比赛项目和参赛队伍
- **分数管理**: 记录和查询每场比赛中每个用户的得分
- **管理后台**: 完整的管理界面，支持数据导入导出
- **季节主题**: 支持春夏秋冬四季主题切换
- **头像系统**: 集成 Minecraft 头像，支持后端反代
- **高度模块化**: 前后端分离，每个核心功能都封装在独立的模块中

## 技术栈

### 后端
- **框架**: FastAPI
- **数据库**: SQLite (通过 SQLAlchemy ORM)
- **数据校验**: Pydantic
- **认证**: JWT
- **迁移**: Alembic

### 前端
- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS v4
- **UI 组件**: Radix UI
- **主题**: next-themes
- **类型检查**: TypeScript

## 安装与运行

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd CC_Website
```

### 2. 后端设置
```bash
# 创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 初始化数据库
alembic upgrade head

# 启动后端服务
uvicorn app.main:app --reload
```

### 3. 前端设置
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
npm start
```

## API 文档

后端服务启动后，可以访问自动生成的 API 文档：

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## 项目结构

```
CC_Website/
├── app/                    # 后端代码
│   ├── core/              # 核心配置
│   ├── modules/           # 功能模块
│   └── main.py            # 应用入口
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── app/          # 页面路由
│   │   ├── components/   # UI 组件
│   │   ├── contexts/     # React 上下文
│   │   └── services/     # API 服务
│   └── package.json
├── alembic/              # 数据库迁移
├── requirements.txt      # Python 依赖
└── CHANGELOG.md         # 版本更新日志
```

## 如何扩展

1. 在 `app/modules/` 目录下创建新的功能模块
2. 定义 `models.py`, `schemas.py`, `crud.py` 和 `router.py`
3. 在 `app/main.py` 中注册新路由
4. 在前端 `frontend/src/app/` 中添加对应页面
5. 更新版本号和 CHANGELOG.md

详细的开发规范请参考 `agents.md` 和 `AGENTS_STYLE.md`。

## 版本信息

- 前端版本: 2.14.0
- 后端版本: 2.14.0

查看完整的更新历史请参考 [CHANGELOG.md](./CHANGELOG.md)。
