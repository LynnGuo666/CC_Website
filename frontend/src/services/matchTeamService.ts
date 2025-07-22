import apiFetch from './api';
import { 
  MatchTeamSchema, 
  TeamMemberSchema, 
  GameLineupSchema, 
  MatchTeamCreateSchema, 
  TeamMemberCreateSchema 
} from '@/types/schemas';
import { z } from 'zod';

// Infer the TypeScript types from the schemas
export type MatchTeam = z.infer<typeof MatchTeamSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type GameLineup = z.infer<typeof GameLineupSchema>;
export type MatchTeamCreate = z.infer<typeof MatchTeamCreateSchema>;
export type TeamMemberCreate = z.infer<typeof TeamMemberCreateSchema>;

// Response schemas
const MatchTeamsApiResponseSchema = z.array(MatchTeamSchema);
const TeamMembersApiResponseSchema = z.array(TeamMemberSchema);
const GameLineupsApiResponseSchema = z.array(GameLineupSchema);

/**
 * 创建比赛专属队伍
 * @param matchId 比赛ID
 * @param teamData 队伍数据
 * @returns 创建的队伍
 */
export async function createMatchTeam(matchId: number, teamData: MatchTeamCreate): Promise<MatchTeam> {
  const validatedData = MatchTeamCreateSchema.parse(teamData);
  
  return await apiFetch<MatchTeam>(`/matches/${matchId}/teams`, {
    method: 'POST',
    body: validatedData,
    schema: MatchTeamSchema,
  });
}

/**
 * 获取比赛的所有队伍
 * @param matchId 比赛ID
 * @returns 队伍列表
 */
export async function getMatchTeams(matchId: number): Promise<MatchTeam[]> {
  return await apiFetch<MatchTeam[]>(`/matches/${matchId}/teams`, {
    method: 'GET',
    schema: MatchTeamsApiResponseSchema,
    next: {
      revalidate: 300,
      tags: ['matches', `match:${matchId}`, 'teams'],
    },
  });
}

/**
 * 获取单个比赛队伍详情
 * @param teamId 队伍ID
 * @returns 队伍详情
 */
export async function getMatchTeam(teamId: number): Promise<MatchTeam> {
  return await apiFetch<MatchTeam>(`/matches/teams/${teamId}`, {
    method: 'GET',
    schema: MatchTeamSchema,
    next: {
      revalidate: 300,
      tags: ['teams', `team:${teamId}`],
    },
  });
}

/**
 * 更新比赛队伍信息
 * @param teamId 队伍ID
 * @param teamData 更新数据
 * @returns 更新后的队伍
 */
export async function updateMatchTeam(teamId: number, teamData: Partial<MatchTeamCreate>): Promise<MatchTeam> {
  return await apiFetch<MatchTeam>(`/matches/teams/${teamId}`, {
    method: 'PUT',
    body: teamData,
    schema: MatchTeamSchema,
  });
}

/**
 * 删除比赛队伍
 * @param teamId 队伍ID
 * @returns 删除结果
 */
export async function deleteMatchTeam(teamId: number): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(`/matches/teams/${teamId}`, {
    method: 'DELETE',
    schema: z.object({ message: z.string() }),
  });
}

/**
 * 添加队员到队伍
 * @param teamId 队伍ID
 * @param memberData 队员数据
 * @returns 队员信息
 */
export async function addTeamMember(teamId: number, memberData: TeamMemberCreate): Promise<TeamMember> {
  const validatedData = TeamMemberCreateSchema.parse(memberData);
  
  return await apiFetch<TeamMember>(`/matches/teams/${teamId}/members`, {
    method: 'POST',
    body: validatedData,
    schema: TeamMemberSchema,
  });
}

/**
 * 移除队员
 * @param teamId 队伍ID
 * @param userId 用户ID
 * @returns 移除结果
 */
export async function removeTeamMember(teamId: number, userId: number): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(`/matches/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    schema: z.object({ message: z.string() }),
  });
}

/**
 * 更新队员角色
 * @param teamId 队伍ID
 * @param userId 用户ID
 * @param role 新角色
 * @returns 更新后的队员信息
 */
export async function updateMemberRole(teamId: number, userId: number, role: string): Promise<TeamMember> {
  return await apiFetch<TeamMember>(`/matches/teams/${teamId}/members/${userId}/role`, {
    method: 'PUT',
    body: { role },
    schema: TeamMemberSchema,
  });
}

/**
 * 设置游戏出战阵容
 * @param matchGameId 赛程ID
 * @param teamLineups 队伍阵容设置
 * @returns 设置结果
 */
export async function setGameLineups(
  matchGameId: number, 
  teamLineups: Record<number, number[]>, 
  substituteInfo?: Record<string, string>
): Promise<{ message: string }> {
  return await apiFetch<{ message: string }>(`/matches/games/${matchGameId}/lineups`, {
    method: 'POST',
    body: {
      team_lineups: teamLineups,
      substitute_info: substituteInfo,
    },
    schema: z.object({ message: z.string() }),
  });
}

/**
 * 获取游戏出战阵容
 * @param matchGameId 赛程ID
 * @param teamId 可选，指定队伍ID
 * @returns 阵容列表
 */
export async function getGameLineups(matchGameId: number, teamId?: number): Promise<GameLineup[]> {
  const url = teamId 
    ? `/matches/games/${matchGameId}/lineups?team_id=${teamId}`
    : `/matches/games/${matchGameId}/lineups`;
    
  return await apiFetch<GameLineup[]>(url, {
    method: 'GET',
    schema: GameLineupsApiResponseSchema,
    next: {
      revalidate: 300,
      tags: ['matches', `match-game:${matchGameId}`, 'lineups'],
    },
  });
}

/**
 * 批量创建队伍
 * @param matchId 比赛ID
 * @param teams 队伍数据数组
 * @returns 创建结果
 */
export async function createTeamsBatch(matchId: number, teams: MatchTeamCreate[]): Promise<{
  message: string;
  teams: MatchTeam[];
}> {
  return await apiFetch<{ message: string; teams: MatchTeam[] }>(`/matches/${matchId}/teams/batch`, {
    method: 'POST',
    body: { teams },
    schema: z.object({
      message: z.string(),
      teams: z.array(MatchTeamSchema),
    }),
  });
}

/**
 * 获取用户在指定比赛中的所有队伍
 * @param matchId 比赛ID
 * @param userId 用户ID
 * @returns 用户的队伍列表
 */
export async function getUserTeamsInMatch(matchId: number, userId: number): Promise<MatchTeam[]> {
  return await apiFetch<MatchTeam[]>(`/matches/users/${userId}/teams?match_id=${matchId}`, {
    method: 'GET',
    schema: MatchTeamsApiResponseSchema,
    next: {
      revalidate: 300,
      tags: ['matches', `match:${matchId}`, `user:${userId}`, 'teams'],
    },
  });
}

/**
 * 获取用户参与的所有比赛
 * @param userId 用户ID
 * @returns 比赛列表
 */
export async function getUserMatches(userId: number): Promise<any[]> {
  return await apiFetch<any[]>(`/matches/users/${userId}/matches`, {
    method: 'GET',
    schema: z.array(z.any()), // Using any since match schema might be different here
    next: {
      revalidate: 300,
      tags: ['matches', `user:${userId}`],
    },
  });
}