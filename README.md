# 比赛服务器后端 API

[![CodeTime Badge](https://shields.jannchie.com/endpoint?style=flat-square&color=222&url=https%3A%2F%2Fapi.codetime.dev%2Fv3%2Fusers%2Fshield%3Fuid%3D31631%26project%3DCC_Backend)](https://codetime.dev)

这是一个基于 FastAPI 构建的高度模块化的比赛服务器后端项目。它为管理用户、队伍、比赛项目、具体比赛及其分数提供了完整的 RESTful API 接口。

## ✨ 功能特性

- **用户管理**: 创建和查询用户信息。
- **队伍管理**: 创建和查询队伍信息，支持添加/移除队员，并能追溯队员的历史队伍记录。
- **比赛项目管理**: 定义不同类型的比赛，例如“锦标赛”或“挑战赛”。
- **比赛管理**: 创建和查询具体的比赛，关联比赛项目和参赛队伍。
- **分数管理**: 记录和查询每场比赛中每个用户的得分。
- **高度模块化**: 每个核心功能都封装在独立的模块中，易于维护和扩展。
- **自动 API 文档**: 内置 Swagger UI 和 ReDoc，提供交互式 API 文档。

## 🛠️ 技术栈

- **后端框架**: [FastAPI](https://fastapi.tiangolo.com/)
- **数据库**: [SQLite](https://www.sqlite.org/index.html) (通过 [SQLAlchemy](https://www.sqlalchemy.org/) ORM 进行交互)
- **数据校验**: [Pydantic](https://docs.pydantic.dev/)
- **依赖管理**: Pip + requirements.txt

## 🚀 安装与运行

请按照以下步骤在本地环境中设置并运行本项目。

### 1. 克隆项目 (如果需要)
```bash
git clone <your-repo-url>
cd competition-server
```

### 2. (推荐) 创建并激活虚拟环境
为了保持项目依赖的隔离，建议使用虚拟环境。
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境 (macOS/Linux)
source venv/bin/activate

# 激活虚拟环境 (Windows)
.\venv\Scripts\activate
```

### 3. 安装项目依赖
在项目根目录运行以下命令，安装 `requirements.txt` 中列出的所有库：
```bash
pip install -r requirements.txt
```

### 4. 初始化数据库
在首次运行前，你需要创建数据库和所有数据表。运行我们提供的脚本：
```bash
python create_db.py
```
这会在项目根目录下生成一个 `test.db` 文件。

### 5. 启动服务
使用 `uvicorn` ASGI 服务器来启动应用：
```bash
uvicorn app.main:app --reload
```
`--reload` 参数会使服务在代码变更后自动重启，非常适合开发环境。

## 📚 API 文档

服务启动后，你可以通过浏览器访问由 FastAPI 自动生成的交互式 API 文档。

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

在这些页面上，你可以清晰地看到所有的 API 接口、请求参数、响应格式，并能直接进行接口测试。

## 🧩 如何扩展

得益于项目的模块化设计，添加一个新功能（例如“博客”或“直播”）非常简单：

1.  在 `app/modules/` 目录下，为你的新功能创建一个新的目录，例如 `blogs/`。
2.  在新目录中，仿照 `users` 或 `teams` 模块，创建你自己的 `models.py`, `schemas.py`, `crud.py` 和 `router.py`。
3.  在 `app/main.py` 中，导入你的新路由并使用 `app.include_router()` 将其注册到主应用中。
4.  在 `create_db.py` 中，导入你的新数据模型，以便在初始化时创建对应的数据库表。

---
*这份文档由 Roo 自动生成。*
