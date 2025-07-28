"""
数据库连接池监控和优化中间件
"""
import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.db import engine

logger = logging.getLogger(__name__)


class DatabaseConnectionMiddleware(BaseHTTPMiddleware):
    """数据库连接池监控中间件"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # 记录请求开始前的连接池状态
        pool = engine.pool
        pool_status_before = {
            "size": pool.size(),
            "checked_out": pool.checkedout(),
            "checked_in": pool.checkedin(),
            "overflow": pool.overflow()
        }
        
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Request failed: {e}")
            raise
        finally:
            # 记录请求完成后的连接池状态
            pool_status_after = {
                "size": pool.size(),
                "checked_out": pool.checkedout(),
                "checked_in": pool.checkedin(),
                "overflow": pool.overflow()
            }
            
            duration = time.time() - start_time
            
            # 如果连接池状态异常或请求时间过长，记录警告
            if (pool_status_after["checked_out"] > 3 or 
                duration > 5.0 or 
                pool_status_after["overflow"] > 0):
                logger.warning(
                    f"DB Pool Status - Path: {request.url.path} | "
                    f"Duration: {duration:.2f}s | "
                    f"Before: {pool_status_before} | "
                    f"After: {pool_status_after}"
                )
