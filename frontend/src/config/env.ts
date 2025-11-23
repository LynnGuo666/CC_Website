/**
 * 统一的环境变量配置
 * 所有 API 请求都应该使用这里的配置
 *
 * 重要：使用函数而不是常量，确保在客户端运行时动态计算
 */

// 获取 API Base URL - 每次调用都重新计算
export function getApiBaseUrl(): string {
  // 客户端：根据当前页面协议动态决定
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';

    // 从环境变量获取配置的 URL
    let envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

    if (envUrl) {
      // 移除末尾斜杠
      envUrl = envUrl.replace(/\/$/, '');

      // 如果当前页面是 HTTPS，强制 API 也使用 HTTPS
      if (isHttps && envUrl.startsWith('http://')) {
        envUrl = envUrl.replace('http://', 'https://');
        console.log('[ENV] Upgraded to HTTPS:', envUrl);
      }

      console.log('[ENV] Client API URL:', envUrl);
      return envUrl;
    }

    // 没有配置环境变量，使用当前协议的 localhost
    const protocol = isHttps ? 'https:' : 'http:';
    return `${protocol}//localhost:8000`;
  }

  // 服务端：优先使用内部 URL
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/$/, '');
  }

  // 服务端：使用环境变量
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // 默认值
  return 'http://localhost:8000';
}

// 导出常量（为了向后兼容），但实际上每次都会重新计算
export const API_BASE_URL = getApiBaseUrl();

// WebSocket URL
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  'ws://localhost:8000';

// API Key (用于某些需要鉴权的公开接口)
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
