/**
 * 管理后台 API 客户端
 */

import { getApiBaseUrl } from '@/config/env';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  last_login?: string;
  api_key: string;
}

export type AdminMatchStatus = 'preparing' | 'ongoing' | 'finished' | 'cancelled';

export interface AdminMatch {
  id: number;
  name: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: AdminMatchStatus;
  prize_pool?: string | null;
  max_teams?: number | null;
  max_players_per_team: number;
  allow_substitutes: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminMatchPayload {
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status?: AdminMatchStatus;
  prize_pool?: string;
  max_teams?: number;
  max_players_per_team?: number;
  allow_substitutes?: boolean;
}

export interface Game {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  seasonal: boolean;
  season_label?: string | null;
  tagline?: string | null;
  rule?: string | null;
  image_url?: string | null;
}

export type GamePayload = Omit<Game, 'id'>;

export interface User {
  id: number;
  nickname: string;
  display_name?: string;
  source?: string;
  total_matches: number;
  total_wins: number;
  total_points: number;
  total_standard_score: number;
  average_standard_score: number;
  created_at: string;
  last_active: string;
  win_rate: number;
  average_score: number;
  game_level: string;
  level_progress: number;
}

export interface AdminUserUpdatePayload {
  email?: string;
  full_name?: string;
  role?: AdminUser['role'];
  password?: string;
  is_active?: boolean;
}

class AdminAPI {
  private token: string | null = null;

  constructor() {
    // 从 localStorage 加载 token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  private getBaseUrl(): string {
    const baseUrl = getApiBaseUrl();
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized');
      }
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // ==================== 认证相关 ====================

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<AdminUser> {
    return this.request<AdminUser>('/api/admin/me');
  }

  logout() {
    this.clearToken();
  }

  // ==================== 比赛项目管理 ====================

  async getGames(): Promise<Game[]> {
    return this.request<Game[]>('/api/admin/games/');
  }

  async getGame(id: number): Promise<Game> {
    return this.request<Game>(`/api/admin/games/${id}`);
  }

  async createGame(game: GamePayload): Promise<Game> {
    return this.request<Game>('/api/admin/games/', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  }

  async updateGame(id: number, game: Partial<GamePayload>): Promise<Game> {
    return this.request<Game>(`/api/admin/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(game),
    });
  }

  async deleteGame(id: number): Promise<void> {
    await this.request<void>(`/api/admin/games/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== 管理员账户 ====================

  async updateAdminUser(id: number, payload: AdminUserUpdatePayload): Promise<AdminUser> {
    return this.request<AdminUser>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // ==================== 选手管理 ====================

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/admin/users/');
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/api/admin/users/${id}`);
  }

  async createUser(user: { nickname: string; display_name?: string; source?: string }): Promise<User> {
    return this.request<User>('/api/admin/users/', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    return this.request<User>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: number): Promise<void> {
    await this.request<void>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== 导入/导出 ====================

  async exportGamesCSV(): Promise<Blob> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/import-export/games/export/csv`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async exportGamesJSON(): Promise<Blob> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/import-export/games/export/json`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async importGamesCSV(file: File): Promise<{ success: boolean; created: number; updated: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/import-export/games/import/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }

  async exportUsersCSV(): Promise<Blob> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/import-export/users/export/csv`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async exportUsersJSON(): Promise<Blob> {
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/import-export/users/export/json`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async importUsersCSV(file: File): Promise<{ success: boolean; created: number; updated: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/import-export/users/import/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }

  // ==================== 锦标赛管理与小分导入 ====================

  async getMatches(params?: { status?: AdminMatchStatus; skip?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status_filter', params.status);
    if (params?.skip !== undefined) qs.append('skip', String(params.skip));
    if (params?.limit !== undefined) qs.append('limit', String(params.limit));
    const query = qs.toString();
    return this.request<AdminMatch[]>(`/api/admin/matches/${query ? `?${query}` : ''}`);
  }

  async createMatch(payload: AdminMatchPayload) {
    return this.request<AdminMatch>('/api/admin/matches/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMatch(id: number, payload: Partial<AdminMatchPayload>) {
    return this.request<AdminMatch>(`/api/admin/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteMatch(id: number) {
    await this.request<void>(`/api/admin/matches/${id}`, {
      method: 'DELETE',
    });
  }

  async startMatch(id: number) {
    return this.request<AdminMatch>(`/api/admin/matches/${id}/start`, {
      method: 'POST',
    });
  }

  async finishMatch(id: number) {
    return this.request<AdminMatch>(`/api/admin/matches/${id}/finish`, {
      method: 'POST',
    });
  }

  async importScoreEvents(
    matchId: number,
    file: File,
    options?: { clearExisting?: boolean; tournamentStage?: string; eventType?: string; recalc?: boolean }
  ): Promise<{ inserted: number; skipped: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const qs = new URLSearchParams();
    if (options?.clearExisting) qs.append('clear_existing', 'true');
    if (options?.tournamentStage) qs.append('tournament_stage', options.tournamentStage);
    if (options?.eventType) qs.append('event_type', options.eventType);
    if (options?.recalc) qs.append('recalc', 'true');

    const baseUrl = this.getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/admin/matches/${matchId}/score-events/import${qs.toString() ? `?${qs.toString()}` : ''}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '导入失败' }));
      throw new Error(error.detail || '导入失败');
    }

    return response.json();
  }

  // ==================== 站点配置管理 ====================

  async getSiteConfig(): Promise<any> {
    return this.request<any>('/api/config');
  }

  async updateSiteConfig(config: any): Promise<any> {
    return this.request<any>('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // ==================== 视频管理 ====================

  async getMatchVideos(matchId: number, params?: { video_type?: string; is_official?: boolean; platform?: string }): Promise<MatchVideo[]> {
    const qs = new URLSearchParams();
    if (params?.video_type) qs.append('video_type', params.video_type);
    if (params?.is_official !== undefined) qs.append('is_official', String(params.is_official));
    if (params?.platform) qs.append('platform', params.platform);
    const query = qs.toString();
    return this.request<MatchVideo[]>(`/api/matches/${matchId}/videos${query ? `?${query}` : ''}`);
  }

  async createMatchVideo(matchId: number, payload: MatchVideoPayload): Promise<MatchVideo> {
    return this.request<MatchVideo>(`/api/admin/matches/${matchId}/videos`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMatchVideo(videoId: number, payload: Partial<MatchVideoPayload>): Promise<MatchVideo> {
    return this.request<MatchVideo>(`/api/admin/matches/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteMatchVideo(videoId: number): Promise<void> {
    await this.request<void>(`/api/admin/matches/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  async getBilibiliVideoInfo(url: string): Promise<BilibiliVideoInfo> {
    const params = new URLSearchParams({ url });
    return this.request<BilibiliVideoInfo>(`/api/admin/matches/videos/bilibili-info?${params.toString()}`);
  }
}

export const adminAPI = new AdminAPI();

export interface BilibiliVideoInfo {
  bvid: string;
  aid: number;
  title: string;
  description: string;
  thumbnail_url: string;
  duration: number;
  view_count: number;
  uploader_name: string;
  uploader_mid: number;
  published_at: string;
  cid: number;
}

export interface MatchVideo {
  id: number;
  match_id: number;
  match_game_id?: number | null;
  user_id?: number | null;
  title: string;
  url: string;
  platform: 'bilibili' | 'youtube' | 'twitch' | 'douyu' | 'huya' | 'other';
  video_type: 'livestream' | 'replay' | 'highlight';
  is_official: boolean;
  uploader_name?: string | null;
  description?: string | null;
  duration?: number | null;
  thumbnail_url?: string | null;
  view_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    nickname: string;
    display_name?: string;
  } | null;
  match_game?: {
    id: number;
    game_name: string;
  } | null;
}

export interface MatchVideoPayload {
  title: string;
  url: string;
  platform: string;
  video_type?: string;
  is_official?: boolean;
  uploader_name?: string;
  match_game_id?: number;
  user_id?: number;
  description?: string;
  duration?: number;
  thumbnail_url?: string;
  view_count?: number;
}
