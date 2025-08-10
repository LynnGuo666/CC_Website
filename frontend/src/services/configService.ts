export interface SiteConfig {
  notification_text?: string;
  notification_link?: string;
  handbook_text?: string;
  handbook_url?: string;
}

class ConfigService {
  async getConfig(): Promise<SiteConfig> {
    try {
      // 这里可以从 API 获取配置，现在先返回默认值
      return {
        notification_text: "🏆 S2CC夏季锦标赛已结束，下次再见！",
        notification_link: "/matches/4",
        handbook_text: "查看数据",
        handbook_url: "/matches/4"
      };
    } catch (error) {
      console.error('Failed to fetch site config:', error);
      return {};
    }
  }
}

export const configService = new ConfigService(); 