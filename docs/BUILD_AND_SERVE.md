# 构建与服务启动命令

## 后端服务

使用以下命令启动后端 FastAPI 服务，它将绑定到 `0.0.0.0`，允许局域网访问：

```bash
uvicorn app.main:app --host 0.0.0.0 --reload
```

## 前端服务

进入 `frontend` 目录，使用以下命令启动前端 Next.js 开发服务器：

```bash
cd frontend
npm run dev