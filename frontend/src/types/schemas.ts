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
    color: z.string(),
    total_score: z.number(),
    games_played: z.number(),
    created_at: z.string(),
    members: z.array(UserSchema), // This is a property on the model, let's see if it's in the schema
    memberships: z.array(MatchTeamMembershipSchema),
});

// OpenAPI Schema: Game
export const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

// Represents Score
export const ScoreSchema = z.object({
  id: z.number(),
  points: z.number(),
  user_id: z.number(),
  match_team_id: z.number(),
  match_game_id: z.number(),
  event_data: z.any().nullable(),
  recorded_at: z.string(),
  user: UserSchema,
  team: MatchTeamSchema,
});

// Represents MatchGame
export const MatchGameSchema = z.object({
  id: z.number(),
  match_id: z.number(),
  game_id: z.number(),
  game_order: z.number(),
  structure_type: z.string(),
  structure_details: z.record(z.string(), z.any()),
  is_live: z.boolean(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  created_at: z.string(),
  game: GameSchema,
  scores: z.array(ScoreSchema).default([]),
});

// The main Match schema, updated to match the backend
export const MatchSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  status: z.string(), // Assuming status is a string from enum
  prize_pool: z.string().nullable(),
  max_teams: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  winning_team_id: z.number().nullable(),
  participants: z.array(MatchTeamSchema), // participants is an alias for teams
  match_games: z.array(MatchGameSchema).default([]),
  can_start_live: z.boolean(),
  is_archived: z.boolean(),
});

// --- API Response Schemas ---
export const MatchesApiResponseSchema = z.array(MatchSchema);

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
  user_id: z.number(),
  nickname: z.string(),
  total_matches: z.number(),
  total_wins: z.number(),
  total_points: z.number(),
  win_rate: z.number(),
  average_score: z.number(),
  current_team: z.string().nullable(),
  match_history: z.array(z.object({
    match_id: z.number(),
    match_name: z.string(),
    total_points: z.number(),
    games_played: z.number(),
    team_name: z.string().nullable(),
  })).default([]),
});