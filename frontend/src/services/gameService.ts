import apiFetch from './api';
import { GameSchema } from '@/types/schemas';
import { z } from 'zod';

export type Game = z.infer<typeof GameSchema>;

const GamesApiResponseSchema = z.array(GameSchema);
const GameApiResponseSchema = GameSchema;

/**
 * 获取所有比赛项目的列表
 * @returns A promise that resolves to an array of games.
 */
export async function getGames(): Promise<Game[]> {
  return await apiFetch<Game[]>('/api/games/', {
    method: 'GET',
    schema: GamesApiResponseSchema,
  });
}

/**
 * 获取单个比赛项目
 * @param id 游戏ID
 */
export async function getGame(id: number): Promise<Game> {
  return await apiFetch<Game>(`/api/games/${id}`, {
    method: 'GET',
    schema: GameApiResponseSchema,
  });
}
