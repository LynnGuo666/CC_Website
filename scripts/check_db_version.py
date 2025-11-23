#!/usr/bin/env python3
"""
检查数据库迁移版本的脚本
显示当前数据库版本和最新可用版本
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine
from app.core.config import settings


def check_db_version():
    """检查数据库版本"""
    print("=" * 70)
    print("📊 数据库迁移版本检查")
    print("=" * 70)

    try:
        # 配置 Alembic
        alembic_cfg = Config(str(project_root / "alembic.ini"))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)

        # 获取当前数据库版本
        engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
        with engine.connect() as connection:
            context = MigrationContext.configure(connection)
            current_rev = context.get_current_revision()

        # 获取最新版本
        script = ScriptDirectory.from_config(alembic_cfg)
        head_rev = script.get_current_head()

        # 显示信息
        print(f"\n数据库连接: {settings.SQLALCHEMY_DATABASE_URI}")
        print(f"\n当前版本: {current_rev or '(空数据库 - 未运行任何迁移)'}")
        print(f"最新版本: {head_rev}")

        if current_rev == head_rev:
            print("\n✅ 状态: 数据库已是最新版本")
        elif current_rev is None:
            print("\n⚠️  状态: 数据库为空，需要运行迁移")
            print("\n运行以下命令来初始化数据库:")
            print("  alembic upgrade head")
            print("  或")
            print("  python run_server.py  (启动服务器时会自动迁移)")
        else:
            print("\n⚠️  状态: 数据库版本落后，需要更新")
            print("\n运行以下命令来更新数据库:")
            print("  alembic upgrade head")
            print("  或")
            print("  python run_server.py  (启动服务器时会自动迁移)")

            # 显示待执行的迁移
            print("\n待执行的迁移:")
            for rev in script.iterate_revisions(head_rev, current_rev):
                if rev.revision != current_rev:
                    print(f"  - {rev.revision}: {rev.doc}")

        print("\n" + "=" * 70)

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    check_db_version()
