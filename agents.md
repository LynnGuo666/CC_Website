# Agent 操作要求

## 1. 环境与数据库

1. **始终使用项目根目录下的虚拟环境 `.venv`**：如需运行 Python、Pip 或 Alembic 命令，请使用 `.venv/bin/python`、`.venv/bin/pip`、`.venv/bin/alembic`，避免引用系统 Python。
2. **初始化 / 同步数据库**：
   - 如果 `test.db` 不存在或需要重建，可以直接删除旧文件；
   - 运行 `python create_db.py`（实质触发 Alembic `upgrade head`）或直接执行 `.venv/bin/alembic upgrade head`，确保表结构与模型一致。
3. **导入业务数据**：当前仓库不附带示例数据，需要根据 `docs.md` 中的导入脚本（以"步骤 1~8"形式）手动执行 API 请求来创建用户、比赛、队伍、分数等。
4. **任何脚本/服务运行前**，确认 `.env`（或相关环境变量）配置好数据库连接字符串 `SQLALCHEMY_DATABASE_URI`，默认是 `sqlite:///./test.db`。

## 2. 版本管理规范

### 2.1 版本号更新
当完成重要功能开发或修复后，需要同步更新前后端版本号：

1. **前端版本号**
   - 文件位置：`frontend/package.json`
   - 字段：`"version": "x.y.z"`

2. **后端版本号**
   - 文件位置：`app/core/config.py`
   - 字段：`BACKEND_VERSION: str = "x.y.z"`

3. **版本号规则**（遵循语义化版本）
   - 主版本号（x）：重大架构变更或不兼容的 API 修改
   - 次版本号（y）：新增功能，向后兼容
   - 修订号（z）：问题修复和小改进

### 2.2 CHANGELOG.md 维护
每次版本更新必须在项目根目录的 `CHANGELOG.md` 中记录：

1. **格式要求**
   - 遵循 [Keep a Changelog](https://keepachangelog.com/) 标准
   - 日期格式：`YYYY-MM-DD`（**注意使用正确的当前日期**）
   - 版本号格式：`## [x.y.z] - YYYY-MM-DD`

2. **分类标签**
   - `Added`: 新增功能
   - `Changed`: 功能变更
   - `Deprecated`: 即将废弃的功能
   - `Removed`: 已移除的功能
   - `Fixed`: 问题修复
   - `Security`: 安全相关更新
   - `Dependencies`: 依赖项变更
   - `Technical Details`: 技术细节说明

3. **内容要求**
   - 使用清晰的中文描述
   - 重要功能使用粗体标记
   - 包含技术实现细节和影响范围
   - 记录依赖项的添加或更新
   - 注明前后端版本号变化

### 2.3 更新流程
```bash
# 1. 完成功能开发
# 2. 更新前端版本号（frontend/package.json）
# 3. 更新后端版本号（app/core/config.py）
# 4. 在 CHANGELOG.md 顶部添加新版本记录
# 5. 提交代码并创建版本标签
git add .
git commit -m "chore: bump version to x.y.z"
git tag -a vx.y.z -m "Release version x.y.z"
```

### 2.4 注意事项
- **确保使用正确的当前日期**（参考系统环境中的 "Today's date"）
- 前后端版本号应保持同步
- 每个版本的更新内容应详细且准确
- 重大更新应在 CHANGELOG 中突出说明影响范围
