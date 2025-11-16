/**
 * 管理后台 API 客户端
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

class AdminAPI {
  private token: string | null = null;

  constructor() {
    // 从 localStorage 加载 token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
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
    const response = await fetch(`${API_BASE_URL}/api/admin/import-export/games/export/csv`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async exportGamesJSON(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/admin/import-export/games/export/json`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async importGamesCSV(file: File): Promise<{ success: boolean; created: number; updated: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/admin/import-export/games/import/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }

  async exportUsersCSV(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/admin/import-export/users/export/csv`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async exportUsersJSON(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/admin/import-export/users/export/json`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async importUsersCSV(file: File): Promise<{ success: boolean; created: number; updated: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/admin/import-export/users/import/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }
}

export const adminAPI = new AdminAPI();
