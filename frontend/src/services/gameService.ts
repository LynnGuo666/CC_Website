import apiFetch from './api';
import { GameSchema } from '@/types/schemas';
import { z } from 'zod';

export type Game = z.infer<typeof GameSchema>;

const GamesApiResponseSchema = z.array(GameSchema);

/**
 * 获取所有比赛项目的列表
 * @returns A promise that resolves to an array of games.
 */
export async function getGames(): Promise<Game[]> {
  return await apiFetch<Game[]>('/games', {
    method: 'GET',
    schema: GamesApiResponseSchema,
  });
}