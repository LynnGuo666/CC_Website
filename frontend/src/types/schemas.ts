import { z } from 'zod';

// Match Status Enum
export const MatchStatusSchema = z.enum(['preparing', 'ongoing', 'finished', 'cancelled']);

// OpenAPI Schema: User (Enhanced)
export const UserSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  display_name: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  total_matches: z.number().default(0),
  total_wins: z.number().default(0),
  total_points: z.number().default(0),
  created_at: z.string(),
  last_active: z.string(),
  win_rate: z.number().default(0),
  average_score: z.number().default(0),
});

// UserInfo - Simplified version for nested usage
export const UserInfoSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  display_name: z.string().nullable().optional(),
  total_points: z.number().default(0),
  win_rate: z.number().default(0),
});

// OpenAPI Schema: Team
export const TeamInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().nullable().optional(),
});

export const TeamSchema = TeamInfoSchema.extend({});

// Team with Members
export const TeamWithMembersSchema = TeamSchema.extend({
  current_members: z.array(UserInfoSchema).default([]),
  historical_members: z.array(UserInfoSchema).default([]),
  total_members: z.number().default(0),
});

// OpenAPI Schema: Game
export const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

// OpenAPI Schema: Score (Enhanced)
export const ScoreSchema = z.object({
  id: z.number(),
  points: z.number(),
  user_id: z.number(),
  team_id: z.number(),
  user: UserSchema,
  team: TeamInfoSchema,
  event_data: z.record(z.string(), z.any()).nullable().optional(),
  recorded_at: z.string(),
});

// OpenAPI Schema: MatchGame (Enhanced)
export const MatchGameSchema = z.object({
  id: z.number(),
  match_id: z.number(),
  game_id: z.number(),
  game_order: z.number().default(1),
  structure_type: z.string(),
  structure_details: z.record(z.string(), z.any()),
  game: GameSchema,
  scores: z.array(ScoreSchema).default([]),
  is_live: z.boolean().default(false),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  created_at: z.string(),
});

// OpenAPI Schema: Match (Enhanced)
export const MatchSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  status: MatchStatusSchema.default('preparing'),
  prize_pool: z.string().nullable().optional(),
  max_teams: z.number().nullable().optional(),
  winning_team_id: z.number().nullable().optional(),
  participants: z.array(TeamSchema).default([]),
  match_games: z.array(MatchGameSchema).default([]),
  created_at: z.string(),
  updated_at: z.string(),
  can_start_live: z.boolean().default(false),
  is_archived: z.boolean().default(false),
});

// Player Statistics
export const PlayerMatchStatsSchema = z.object({
  match_id: z.number(),
  match_name: z.string(),
  total_points: z.number(),
  games_played: z.number(),
  team_name: z.string().nullable().optional(),
});

export const PlayerStatsSchema = z.object({
  user_id: z.number(),
  nickname: z.string(),
  total_matches: z.number(),
  total_wins: z.number(),
  total_points: z.number(),
  win_rate: z.number(),
  average_score: z.number(),
  current_team: z.string().nullable().optional(),
  match_history: z.array(PlayerMatchStatsSchema).default([]),
});

// Enhanced User Statistics with Game Scores
export const UserStatsSchema = z.object({
  user: UserSchema,
  current_team: z.record(z.string(), z.any()).nullable().optional(),
  historical_teams: z.array(z.record(z.string(), z.any())).default([]),
  match_history: z.array(z.record(z.string(), z.any())).default([]),
  recent_scores: z.array(z.record(z.string(), z.any())).default([]),
  game_scores: z.record(z.string(), z.object({
    total_score: z.number(),
    games_played: z.number(),
  })).default({}),
});

// Team Statistics
export const TeamStatsSchema = z.object({
  team: TeamSchema,
  total_matches: z.number().default(0),
  total_wins: z.number().default(0),
  total_points: z.number().default(0),
  win_rate: z.number().default(0),
  average_score_per_match: z.number().default(0),
  current_members: z.array(UserInfoSchema).default([]),
  historical_members: z.array(UserInfoSchema).default([]),
  recent_matches: z.array(z.any()).default([]),
});

// --- API Response Schemas ---
export const MatchesApiResponseSchema = z.array(MatchSchema);
export const TeamsApiResponseSchema = z.array(TeamSchema);
export const UsersApiResponseSchema = z.array(UserSchema);

// --- WebSocket Schemas (from previous knowledge) ---
export const TeamSubScoreSchema = z.object({
  team_id: z.number(),
  team_name: z.string(),
  score: z.number(),
});

export const MatchGameLiveSchema = z.object({
  match_game_id: z.number(),
  game_name: z.string(),
  structure_type: z.string(),
  teams: z.array(TeamSubScoreSchema),
});

export const TeamTotalScoreSchema = z.object({
  rank: z.number(),
  team_id: z.number(),
  team_name: z.string(),
  total_points: z.number(),
});

export const LastEventSchema = z.object({
  match_game_id: z.number(),
  user_id: z.number(),
  description: z.string(),
});

export const LiveUpdateSchema = z.object({
  match_id: z.number(),
  match_name: z.string(),
  total_leaderboard: z.array(TeamTotalScoreSchema),
  current_match_game: MatchGameLiveSchema,
  last_event: LastEventSchema.nullable(),
});

// TypeScript types
export type MatchStatus = z.infer<typeof MatchStatusSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type TeamInfo = z.infer<typeof TeamInfoSchema>;
export type TeamWithMembers = z.infer<typeof TeamWithMembersSchema>;
export type Game = z.infer<typeof GameSchema>;
export type Score = z.infer<typeof ScoreSchema>;
export type MatchGame = z.infer<typeof MatchGameSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type PlayerStats = z.infer<typeof PlayerStatsSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type TeamStats = z.infer<typeof TeamStatsSchema>;
export type LiveUpdate = z.infer<typeof LiveUpdateSchema>;