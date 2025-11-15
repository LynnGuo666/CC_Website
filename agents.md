# Agent 操作要求

1. **始终使用项目根目录下的虚拟环境 `.venv`**：如需运行 Python、Pip 或 Alembic 命令，请使用 `.venv/bin/python`、`.venv/bin/pip`、`.venv/bin/alembic`，避免引用系统 Python。
2. **初始化 / 同步数据库**：
   - 如果 `test.db` 不存在或需要重建，可以直接删除旧文件；
   - 运行 `python create_db.py`（实质触发 Alembic `upgrade head`）或直接执行 `.venv/bin/alembic upgrade head`，确保表结构与模型一致。
3. **导入业务数据**：当前仓库不附带示例数据，需要根据 `docs.md` 中的导入脚本（以“步骤 1~8”形式）手动执行 API 请求来创建用户、比赛、队伍、分数等。
4. **任何脚本/服务运行前**，确认 `.env`（或相关环境变量）配置好数据库连接字符串 `SQLALCHEMY_DATABASE_URI`，默认是 `sqlite:///./test.db`。
