"""
启动 FastAPI 服务器的脚本
使用 uvicorn 运行，并配置日志输出
"""
import uvicorn
import logging
import sys

if __name__ == "__main__":
    # 配置根日志记录器
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
        force=True  # 强制重新配置，覆盖已有的配置
    )

    # 设置各个模块的日志级别
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("app").setLevel(logging.INFO)

    # 配置 Alembic 的日志格式
    alembic_logger = logging.getLogger("alembic")
    alembic_logger.setLevel(logging.INFO)
    # 移除 alembic 的所有处理器
    alembic_logger.handlers = []
    # 添加我们自己的处理器
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    ))
    alembic_logger.addHandler(handler)
    alembic_logger.propagate = False

    # 自定义 uvicorn 日志配置
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "access": {
                "()": "uvicorn.logging.AccessFormatter",
                "fmt": '%(asctime)s - %(levelname)s - %(client_addr)s - "%(request_line)s" %(status_code)s',
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
            "access": {
                "formatter": "access",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
        },
        "loggers": {
            "uvicorn": {"handlers": ["default"], "level": "INFO"},
            "uvicorn.error": {"level": "INFO"},
            "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
        },
    }

    print("=" * 60)
    print("启动 Competition Server API")
    print("=" * 60)

    # 在启动服务器之前运行数据库迁移
    logger = logging.getLogger(__name__)
    logger.info("开始运行数据库迁移...")

    try:
        from pathlib import Path
        from alembic import command
        from alembic.config import Config
        from app.core.config import settings

        alembic_cfg = Config(str(Path(__file__).parent / "alembic.ini"))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)
        # 禁用 alembic 的日志配置文件，使用我们自己的日志配置
        alembic_cfg.attributes['configure_logger'] = False
        command.upgrade(alembic_cfg, "head")
        logger.info("✅ 数据库迁移完成")
    except Exception as e:
        logger.exception("❌ 数据库迁移失败")
        sys.exit(1)

    print("=" * 60)
    print("🚀 启动 FastAPI 服务器")
    print("📝 日志已启用 - 将显示所有 HTTP 请求")
    print("=" * 60)

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        log_config=log_config,
        access_log=False,  # 禁用 uvicorn 的访问日志，使用我们自己的中间件日志
    )
