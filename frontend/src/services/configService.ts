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
        notification_text: "🏆 S2CC夏季锦标赛正在进行中",
        notification_link: "/matches",
        handbook_text: "访问秩序册",
        handbook_url: "https://docs.qq.com/doc/DU2NTV3BsR0hwbWNn"
      };
    } catch (error) {
      console.error('Failed to fetch site config:', error);
      return {};
    }
  }
}

export const configService = new ConfigService(); 