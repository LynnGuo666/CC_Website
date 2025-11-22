/**
 * 统一的环境变量配置
 * 所有 API 请求都应该使用这里的配置
 */

// API Base URL - 默认指向 localhost:8000 用于本地开发
export const API_BASE_URL =
  (typeof window === 'undefined' && process.env.INTERNAL_API_URL) ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

// WebSocket URL
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  'ws://localhost:8000';

// API Key (用于某些需要鉴权的公开接口)
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
