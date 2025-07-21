import { z } from 'zod';

// --- 基础配置 ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''; // 在 .env.local 中配置

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  schema?: z.ZodSchema<any>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

/**
 * 通用的 API 请求函数
 * @param endpoint API 端点 (e.g., '/matches')
 * @param options 请求选项
 */
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, schema, ...restOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 为 POST, PUT, DELETE 请求添加 API Key
  if (['POST', 'PUT', 'DELETE'].includes(method) && API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const config: RequestInit = {
    method,
    headers,
    ...restOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // 如果提供了 Zod schema，进行数据校验
    if (schema) {
      const validationResult = schema.safeParse(data);
      if (!validationResult.success) {
        console.error('Zod validation failed. Errors:', validationResult.error.flatten());
        console.log('Raw data received from API:', data);
        throw new Error('API response validation failed. Check console for details.');
      }
      return validationResult.data;
    }

    return data;

  } catch (error) {
    console.error(`Fetch error for endpoint ${endpoint}:`, error);
    throw error;
  }
}

export default apiFetch;