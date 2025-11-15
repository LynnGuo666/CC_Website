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
      // 这里可以从 API 获取配置，现在先返回默认值
      return {
        notification_text: "🏆 S2CC夏季锦标赛已结束，下次再见！",
        notification_link: "/matches/4",
        handbook_text: "查看数据",
        handbook_url: "/matches/4",
        logo_filename: "scc.png",
        site_name: "S2CC",
        site_abbr: "SC"
      };
    } catch (error) {
      console.error('Failed to fetch site config:', error);
      return {};
    }
  }
}

export const configService = new ConfigService(); 