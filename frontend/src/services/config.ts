import { getApiBaseUrl } from '@/config/env';

export function getPublicApiBaseUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}/api`;
}
