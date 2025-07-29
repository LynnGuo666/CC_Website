import apiFetch from './api';
import { UserSchema, UserStatsSchema } from '@/types/schemas';
import { z } from 'zod';

// Infer the TypeScript type from the schema
export type User = z.infer<typeof UserSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;

const UserCreateSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空"),
  source: z.string().optional(),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;

const UsersApiResponseSchema = z.array(UserSchema);

/**
 * 获取所有用户的列表
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
  return await apiFetch<User[]>('/api/users/', {
    method: 'GET',
    schema: UsersApiResponseSchema,
  });
}

/**
 * 创建一个新用户/选手
 * @param userData The data for the new user.
 * @returns A promise that resolves to the newly created user object.
 */
export async function createUser(userData: UserCreate): Promise<User> {
  const validatedData = UserCreateSchema.parse(userData);

  return await apiFetch<User>('/api/users/', {
    method: 'POST',
    body: validatedData,
    schema: UserSchema,
  });
}

/**
 * 根据 ID 获取单个用户的详细信息
 * @param id The ID of the user.
 * @returns A promise that resolves to a single user object.
 */
export async function getUserById(id: number): Promise<User> {
  return await apiFetch<User>(`/api/users/${id}`, {
    method: 'GET',
    schema: UserSchema,
  });
}

/**
 * 获取玩家详细统计信息
 * @param id The ID of the user.
 * @returns A promise that resolves to user statistics.
 */
export async function getUserStats(id: number): Promise<UserStats> {
  return await apiFetch<UserStats>(`/api/users/${id}/stats`, {
    method: 'GET',
    schema: UserStatsSchema,
  });
}

/**
 * 获取玩家历史比赛记录
 * @param id The ID of the user.
 * @param skip Number of records to skip.
 * @param limit Maximum number of records to return.
 * @returns A promise that resolves to user match history.
 */
export async function getUserMatchHistory(id: number, skip: number = 0, limit: number = 50): Promise<any[]> {
  return await apiFetch<any[]>(`/api/users/${id}/matches?skip=${skip}&limit=${limit}`, {
    method: 'GET',
    schema: z.array(z.any()),
  });
}

/**
 * 获取玩家队伍历史
 * @param id The ID of the user.
 * @returns A promise that resolves to user team history.
 */
export async function getUserTeamHistory(id: number): Promise<{current_team: any, historical_teams: any[]}> {
  return await apiFetch<{current_team: any, historical_teams: any[]}>(`/api/users/${id}/teams`, {
    method: 'GET',
    schema: z.object({
      current_team: z.any().nullable(),
      historical_teams: z.array(z.any()),
    }),
  });
}