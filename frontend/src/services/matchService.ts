import apiFetch from './api';
import { MatchSchema, MatchListSchema, MatchesApiResponseSchema, MatchGameSchema } from '@/types/schemas';
import { z } from 'zod';

// Zod can infer the TypeScript type from the schema
export type Match = z.infer<typeof MatchSchema>;
export type MatchList = z.infer<typeof MatchListSchema>;
export type MatchGame = z.infer<typeof MatchGameSchema>;

/**
 * 获取所有比赛的列表
 * @returns A promise that resolves to an array of matches.
 */
export async function getMatches(): Promise<MatchList[]> {
  return await apiFetch<MatchList[]>('/api/matches/', {
    method: 'GET',
    schema: MatchesApiResponseSchema,
    cache: 'no-store' // 强制不缓存，确保数据实时性
  });
}

/**
 * 根据 ID 获取单个比赛的详细信息
 * @param id The ID of the match.
 * @returns A promise that resolves to a single match object.
 */
export async function getMatchById(id: number): Promise<Match> {
  return await apiFetch<Match>(`/api/matches/${id}`, {
    method: 'GET',
    schema: MatchSchema,
  });
}

/**
 * 获取比赛的所有游戏/赛程
 * @param matchId 比赛ID
 * @returns A promise that resolves to an array of match games.
 */
export async function getMatchGames(matchId: number): Promise<MatchGame[]> {
  return await apiFetch<MatchGame[]>(`/api/matches/${matchId}/games`, {
    method: 'GET',
    schema: z.array(MatchGameSchema),
  });
}

/**
 * 获取游戏分数（包含关联的用户和队伍数据）
 * @param matchGameId 赛程ID
 * @returns A promise that resolves to an array of scores with user data.
 */
export async function getMatchGameScores(matchGameId: number) {
  const scores = await apiFetch<any[]>(`/api/matches/games/${matchGameId}/scores`, {
    method: 'GET',
    schema: z.array(z.any()), // 暂时使用any
  });
  
  // 获取涉及的用户信息
  const userIds = [...new Set(scores.map((score: any) => score.user_id))];
  const users = await Promise.all(
    userIds.map(async (userId) => {
      try {
        const user = await apiFetch(`/api/users/${userId}`, {
          method: 'GET',
          schema: z.any(),
        });
        return { id: userId, ...(user as object) };
      } catch (err) {
        console.warn(`Failed to fetch user ${userId}:`, err);
        return { id: userId, nickname: `用户 ${userId}` };
      }
    })
  );
  
  // 将用户数据附加到分数上
  return scores.map((score: any) => ({
    ...score,
    user: users.find((u: any) => u.id === score.user_id) || { id: score.user_id, nickname: `用户 ${score.user_id}` },
  }));
}

/**
 * 获取游戏信息
 * @param gameId 游戏ID
 * @returns A promise that resolves to game info.
 */
export async function getGameById(gameId: number) {
  return await apiFetch(`/api/games/${gameId}`, {
    method: 'GET',
    schema: z.any(), // 暂时使用any
  });
}

