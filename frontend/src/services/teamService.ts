import apiFetch from './api';
import { MatchTeamSchema } from '@/types/schemas';
import { getMatchTeam } from './matchTeamService';
import { z } from 'zod';

// 兼容性：使用MatchTeam作为Team的别名
export const TeamSchema = MatchTeamSchema;
export const TeamWithMembersSchema = MatchTeamSchema;
export const TeamStatsSchema = z.object({
  team_id: z.number(),
  team_name: z.string(),
  total_points: z.number(),
  games_played: z.number(),
  wins: z.number(),
  losses: z.number(),
});

// Infer the TypeScript type from the schema
export type Team = z.infer<typeof TeamSchema>;
export type TeamWithMembers = z.infer<typeof TeamWithMembersSchema>;
export type TeamStats = z.infer<typeof TeamStatsSchema>;

// Define the schema for the create request body
const TeamCreateSchema = z.object({
  name: z.string().min(1, "队伍名称不能为空"),
  color: z.string().optional(),
});

export type TeamCreate = z.infer<typeof TeamCreateSchema>;

const TeamsApiResponseSchema = z.array(TeamSchema);

/**
 * 获取所有队伍的列表
 * @returns A promise that resolves to an array of teams.
 */
export async function getTeams(): Promise<Team[]> {
  return await apiFetch<Team[]>('/teams', {
    method: 'GET',
    schema: TeamsApiResponseSchema,
    next: {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['teams'],
    },
  });
}

/**
 * 根据 ID 获取单个队伍的详细信息 (包含成员) - 兼容性函数，重定向到matchTeamService
 * @param id The ID of the team.
 * @returns A promise that resolves to a single team object with members.
 */
export async function getTeamById(id: number): Promise<TeamWithMembers> {
  return await getMatchTeam(id);
}

/**
 * 获取队伍统计信息
 * @param id The ID of the team.
 * @returns A promise that resolves to team statistics.
 */
export async function getTeamStats(id: number): Promise<TeamStats> {
  return await apiFetch<TeamStats>(`/teams/${id}/stats`, {
    method: 'GET',
    schema: TeamStatsSchema,
    next: {
      revalidate: 60, // Revalidate every minute
      tags: ['teams', `team:${id}`, 'stats'],
    },
  });
}

/**
 * 创建一个新队伍
 * @param teamData The data for the new team.
 * @returns A promise that resolves to the newly created team object.
 */
export async function createTeam(teamData: TeamCreate): Promise<Team> {
  // Validate the data with our schema before sending
  const validatedData = TeamCreateSchema.parse(teamData);
  
  return await apiFetch<Team>('/teams', {
    method: 'POST',
    body: validatedData,
    schema: TeamSchema,
  });
}

/**
 * 向队伍添加成员
 * @param teamId The ID of the team.
 * @param userId The ID of the user to add.
 * @returns A promise that resolves to the team membership object.
 */
export async function addTeamMember(teamId: number, userId: number): Promise<any> {
  return await apiFetch<any>(`/teams/${teamId}/members/${userId}`, {
    method: 'POST',
    schema: z.any(), // Using any for now since we don't have the exact schema
  });
}

/**
 * 从队伍移除成员
 * @param teamId The ID of the team.
 * @param userId The ID of the user to remove.
 * @returns A promise that resolves to the team membership object.
 */
export async function removeTeamMember(teamId: number, userId: number): Promise<any> {
  return await apiFetch<any>(`/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    schema: z.any(), // Using any for now since we don't have the exact schema
  });
}

/**
 * 获取队伍成员列表
 * @param teamId The ID of the team.
 * @param includeHistorical Whether to include historical members.
 * @returns A promise that resolves to the team members list.
 */
export async function getTeamMembers(teamId: number, includeHistorical: boolean = false): Promise<any[]> {
  return await apiFetch<any[]>(`/teams/${teamId}/members?include_historical=${includeHistorical}`, {
    method: 'GET',
    schema: z.array(z.any()),
    next: {
      revalidate: 300,
      tags: ['teams', `team:${teamId}`, 'members'],
    },
  });
}

/**
 * 获取队伍历史比赛记录
 * @param teamId The ID of the team.
 * @param skip Number of records to skip.
 * @param limit Maximum number of records to return.
 * @returns A promise that resolves to team match history.
 */
export async function getTeamMatchHistory(teamId: number, skip: number = 0, limit: number = 50): Promise<any[]> {
  return await apiFetch<any[]>(`/teams/${teamId}/matches?skip=${skip}&limit=${limit}`, {
    method: 'GET',
    schema: z.array(z.any()),
    next: {
      revalidate: 300,
      tags: ['teams', `team:${teamId}`, 'matches'],
    },
  });
}