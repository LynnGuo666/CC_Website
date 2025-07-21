import apiFetch from './api';
import { MatchSchema, MatchesApiResponseSchema } from '@/types/schemas';
import { z } from 'zod';

// Zod can infer the TypeScript type from the schema
export type Match = z.infer<typeof MatchSchema>;

const MatchGameCreateSchema = z.object({
  game_id: z.number(),
  structure_type: z.string().min(1),
  structure_details: z.record(z.string(), z.any()),
});

const MatchCreateSchema = z.object({
  name: z.string().min(1, "赛事名称不能为空"),
  participant_team_ids: z.array(z.number()).optional(),
  match_games: z.array(MatchGameCreateSchema).optional(),
});

export type MatchCreate = z.infer<typeof MatchCreateSchema>;

/**
 * 获取所有比赛的列表
 * @returns A promise that resolves to an array of matches.
 */
export async function getMatches(): Promise<Match[]> {
  return await apiFetch<Match[]>('/matches', {
    method: 'GET',
    schema: MatchesApiResponseSchema,
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['matches'], // Cache tag for on-demand revalidation
    },
  });
}

/**
 * 根据 ID 获取单个比赛的详细信息
 * @param id The ID of the match.
 * @returns A promise that resolves to a single match object.
 */
export async function getMatchById(id: number): Promise<Match> {
  return await apiFetch<Match>(`/matches/${id}`, {
    method: 'GET',
    schema: MatchSchema,
    next: {
      revalidate: 60,
      tags: ['matches', `match:${id}`],
    },
  });
}

/**
 * 创建一个新赛事
 * @param matchData The data for the new match.
 * @returns A promise that resolves to the newly created match object.
 */
export async function createMatch(matchData: MatchCreate): Promise<Match> {
  const validatedData = MatchCreateSchema.parse(matchData);

  return await apiFetch<Match>('/matches', {
    method: 'POST',
    body: validatedData,
    schema: MatchSchema,
  });
}