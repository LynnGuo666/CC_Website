import apiFetch from './api';
import { z } from 'zod';
import { getGameLevelStyle } from '@/lib/status';

// 基础玩家数据Schema
const BasePlayerSchema = z.object({
  rank: z.number(),
  user_id: z.number(),
  nickname: z.string(),
  display_name: z.string().nullable(),
  average_standard_score: z.number(),
  total_standard_score: z.number(),
  game_level: z.string(),
  level_progress: z.number()
});

// 全局排行榜玩家数据Schema
const GlobalLeaderboardPlayerSchema = BasePlayerSchema.extend({
  total_matches: z.number(),
  total_games_played: z.number(),
  best_game: z.object({
    game_code: z.string(),
    game_name: z.string(),
    average_standard_score: z.number(),
    games_played: z.number()
  }).nullable(),
  game_count: z.number()
});

// 游戏特定排行榜玩家数据Schema
const GameLeaderboardPlayerSchema = BasePlayerSchema.extend({
  games_played: z.number(),
  total_raw_score: z.number(),
  average_raw_score: z.number(),
  game_code: z.string(),
  game_name: z.string()
});

// 排行榜玩家数据Schema (联合类型)
const LeaderboardPlayerSchema = z.union([
  GlobalLeaderboardPlayerSchema,
  GameLeaderboardPlayerSchema
]);

// 排行榜响应Schema
const LeaderboardResponseSchema = z.object({
  leaderboard: z.array(LeaderboardPlayerSchema),
  total_displayed: z.number(),
  game_code: z.string().nullable()
});

// 等级分布Schema
const LevelDistributionSchema = z.object({
  distribution: z.object({
    S: z.object({ count: z.number(), percentage: z.number() }),
    A: z.object({ count: z.number(), percentage: z.number() }),
    B: z.object({ count: z.number(), percentage: z.number() }),
    C: z.object({ count: z.number(), percentage: z.number() }),
    D: z.object({ count: z.number(), percentage: z.number() })
  }),
  total_users: z.number()
});

// 游戏信息Schema
const GameInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  total_scores: z.number(),
  unique_players: z.number()
});

const AvailableGamesResponseSchema = z.object({
  games: z.array(GameInfoSchema)
});

// TypeScript类型定义
export type BasePlayer = z.infer<typeof BasePlayerSchema>;
export type GlobalLeaderboardPlayer = z.infer<typeof GlobalLeaderboardPlayerSchema>;
export type GameLeaderboardPlayer = z.infer<typeof GameLeaderboardPlayerSchema>;
export type LeaderboardPlayer = z.infer<typeof LeaderboardPlayerSchema>;
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;
export type LevelDistribution = z.infer<typeof LevelDistributionSchema>;
export type GameInfo = z.infer<typeof GameInfoSchema>;
export type AvailableGamesResponse = z.infer<typeof AvailableGamesResponseSchema>;

/**
 * 获取排行榜数据
 * @param options 查询选项
 * @returns 排行榜数据
 */
export async function getLeaderboard(options: {
  skip?: number;
  limit?: number;
  gameCode?: string;
} = {}): Promise<LeaderboardResponse> {
  const { skip = 0, limit = 100, gameCode } = options;
  
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString()
  });
  
  if (gameCode) {
    params.append('game_code', gameCode);
  }
  
  return await apiFetch<LeaderboardResponse>(`/api/users/leaderboard?${params}`, {
    method: 'GET',
    schema: LeaderboardResponseSchema,
    cache: 'no-store' // 强制不缓存，避免导航时的数据卖问题
  });
}

/**
 * 获取等级分布统计
 * @returns 等级分布数据
 */
export async function getLevelDistribution(): Promise<LevelDistribution> {
  return await apiFetch<LevelDistribution>('/api/users/leaderboard/level-distribution', {
    method: 'GET',
    schema: LevelDistributionSchema,
    cache: 'no-store' // 强制不缓存
  });
}

/**
 * 获取有排行榜数据的游戏列表
 * @returns 游戏列表
 */
export async function getAvailableGamesForLeaderboard(): Promise<AvailableGamesResponse> {
  return await apiFetch<AvailableGamesResponse>('/api/users/leaderboard/games', {
    method: 'GET',
    schema: AvailableGamesResponseSchema,
    cache: 'no-store' // 强制不缓存
  });
}

/**
 * 获取等级对应的颜色和样式
 *
 * 内部委托给 `@/lib/status` 的 `getGameLevelStyle`，保持全局只有一份等级色映射。
 * 保留 `color / bgColor / borderColor / bgLight` 字段名以兼容现有调用点。
 * @param level 等级
 * @returns 样式对象
 */
export function getLevelStyle(level: string) {
  const style = getGameLevelStyle(level);
  return {
    color: style.text,
    bgColor: style.dot,
    borderColor: style.border ?? 'border-gray-400',
    bgLight: style.bg,
  };
}

/**
 * 获取排名对应的奖牌图标
 * @param rank 排名
 * @returns 奖牌图标
 */
export function getRankMedal(rank: number): string {
  switch (rank) {
    case 1: return '🏆';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}