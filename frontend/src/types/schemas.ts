import { z } from 'zod';

// OpenAPI Schema: User
export const UserSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  display_name: z.string().nullable(),
  source: z.string(),
  total_matches: z.number(),
  total_wins: z.number(),
  total_points: z.number(),
  total_standard_score: z.number().optional(),
  average_standard_score: z.number().optional(),
  win_rate: z.number().optional(),
  average_score: z.number().optional(),
  game_level: z.string().optional(),
  level_progress: z.number().optional(),
  created_at: z.string(),
  last_active: z.string(),
});

// Represents MatchTeamMembership
export const MatchTeamMembershipSchema = z.object({
    id: z.number(),
    match_team_id: z.number(),
    user_id: z.number(),
    role: z.string(), // Assuming role is a string from enum
    joined_at: z.string(),
    user: UserSchema,
});

// Represents MatchTeam
export const MatchTeamSchema = z.object({
    id: z.number(),
    match_id: z.number(),
    name: z.string(),
    color: z.string().nullable(),
    total_score: z.number(),
    games_played: z.number(),
    team_rank: z.number().nullable(),
    created_at: z.string(),
    memberships: z.array(MatchTeamMembershipSchema).optional(),
});

// MatchTeam with match information
export const MatchTeamWithMatchSchema = z.object({
    id: z.number(),
    match_id: z.number(),
    name: z.string(),
    color: z.string().nullable(),
    total_score: z.number(),
    games_played: z.number(),
    created_at: z.string(),
    match_name: z.string(),
    match_status: z.string(),
    memberships: z.array(MatchTeamMembershipSchema).optional(),
});

// OpenAPI Schema: Game
export const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
});

// Represents Score (simplified for API responses)
export const ScoreSchema = z.object({
  id: z.number(),
  points: z.number(),
  user_id: z.number(),
  team_id: z.number(),  // 注意：前端使用team_id，后端model中为match_team_id
  match_game_id: z.number(),
  event_data: z.any().nullable(),
  recorded_at: z.string(),
  user: UserSchema,
  team: MatchTeamSchema,
});

// Represents MatchGame (simplified for API responses)
export const MatchGameSchema = z.object({
  id: z.number(),
  match_id: z.number(),
  game_id: z.number(),
  game_order: z.number(),
  structure_type: z.string().nullable(),
  structure_details: z.record(z.string(), z.any()).nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  created_at: z.string(),
});

// Simplified Match schema for list endpoints (matches MatchList in backend)
export const MatchListSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  status: z.string(), // Assuming status is a string from enum
  prize_pool: z.string().nullable(),
  max_teams: z.number().nullable(),
  max_players_per_team: z.number(),
  allow_substitutes: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// The full Match schema for detailed endpoints 
export const MatchSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  status: z.string(), // Assuming status is a string from enum
  prize_pool: z.string().nullable(),
  max_teams: z.number().nullable(),
  max_players_per_team: z.number(),
  allow_substitutes: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  winning_team_id: z.number().nullable().optional(),
  is_archived: z.boolean().optional(),
});

// --- API Response Schemas ---
export const MatchesApiResponseSchema = z.array(MatchListSchema);

// --- WebSocket Schemas (from previous knowledge) ---
export const TeamSubScoreSchema = z.object({
  team_id: z.number(),
  team_name: z.string(),
  score: z.number(),
});


// --- Create Schemas for API ---

export const TeamMemberCreateSchema = z.object({
  user_id: z.number(),
  role: z.string().default('main'),
});

export const MatchTeamCreateSchema = z.object({
  name: z.string().min(2),
  color: z.string().optional(),
  members: z.array(TeamMemberCreateSchema).optional(),
});

export const TeamMemberSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  role: z.string(),
  joined_at: z.string(),
  user: UserSchema.optional(),
});

export const GameLineupSchema = z.object({
  id: z.number(),
  match_game_id: z.number(),
  match_team_id: z.number(),
  user_id: z.number(),
  is_starting: z.boolean(),
  substitute_reason: z.string().nullable(),
  created_at: z.string(),
  user: UserSchema.optional(),
});

// User Stats Schema
export const UserStatsSchema = z.object({
  user: z.object({
    id: z.number(),
    nickname: z.string(),
    display_name: z.string().nullable(),
    total_points: z.number(),
    win_rate: z.number(),
    created_at: z.string().nullable(),
    last_active: z.string().nullable(),
  }),
  current_team: z.any().nullable(),
  historical_teams: z.array(z.any()).default([]),
  match_history: z.array(z.object({
    match_id: z.number(),
    match_name: z.string(),
    total_points: z.number(),
    games_played: z.number(),
    team_name: z.string(),
  })).default([]),
  recent_scores: z.array(z.object({
    points: z.number(),
    game_name: z.string(),
    team_name: z.string(),
    recorded_at: z.string(),
  })).default([]),
  // 按站成绩时间线（用于折线图与变化显示）
  score_timeline: z.array(z.object({
    match_id: z.number(),
    match_name: z.string(),
    timestamp: z.string().nullable(),
    avg_standard_score: z.number(),
    rank: z.number().nullable(),
    rank_change: z.number().nullable(),
    score_delta: z.number().nullable(),
  })).default([]),
  game_scores: z.record(z.string(), z.object({
    total_score: z.number(),
    games_played: z.number(),
    game_name: z.string(),  // 添加游戏名称用于显示
    total_standard_score: z.number().optional(),
    average_standard_score: z.number().optional(),
    level: z.string().optional(),
    level_progress: z.number().optional(),
  })).default({}),
});