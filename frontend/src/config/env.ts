/**
 * 统一的环境变量配置
 * 所有 API 请求都应该使用这里的配置
 */

// 获取 API Base URL
function getApiBaseUrl(): string {
  // 服务端渲染时使用内部 URL
  if (typeof window === 'undefined' && process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }

  // 使用环境变量配置
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    // 如果当前页面是 HTTPS，自动将 API URL 也改为 HTTPS
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
      return envUrl.replace('http://', 'https://');
    }
    return envUrl;
  }

  // 默认本地开发地址
  return 'http://localhost:8000';
}

// API Base URL - 默认指向 localhost:8000 用于本地开发
export const API_BASE_URL = getApiBaseUrl();

// WebSocket URL
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  'ws://localhost:8000';

// API Key (用于某些需要鉴权的公开接口)
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
