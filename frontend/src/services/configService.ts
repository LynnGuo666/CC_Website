import { getApiBaseUrl } from '@/config/env';

export interface SiteConfig {
  notification_text?: string;
  notification_link?: string;
  handbook_text?: string;
  handbook_url?: string;
  logo_filename?: string; // 例如: "scc.png", "wcc.png"
  site_name?: string; // 例如: "S2CC", "WCC"
  site_abbr?: string; // 例如: "SC", "WC" (用于导航栏图标)
}

class ConfigService {
  async getConfig(): Promise<SiteConfig> {
    try {
      const baseUrl = getApiBaseUrl();
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const response = await fetch(`${normalizedBase}/api/config`);
      if (!response.ok) throw new Error('Failed to fetch config');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch site config:', error);
      return {
        notification_text: "欢迎来到W3CC 联合锦标赛！",
        notification_link: "/matches",
        handbook_text: "查看赛事",
        handbook_url: "/matches",
        logo_filename: "scc.png",
        site_name: "W3CC",
        site_abbr: "W3"
      };
    }
  }
}

export const configService = new ConfigService(); 
