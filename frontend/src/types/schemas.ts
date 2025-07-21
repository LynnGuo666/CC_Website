import { z } from 'zod';

// OpenAPI Schema: User
export const UserSchema = z.object({
  nickname: z.string(),
  source: z.string().nullable(),
  id: z.number(),
});

// OpenAPI Schema: Team
// Note: We define TeamInfo first to be used in Score, then extend it for the full Team schema.
export const TeamInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().nullable(),
  team_number: z.number(),
});

export const TeamSchema = TeamInfoSchema.extend({
  members: z.array(UserSchema).default([]),
});

// OpenAPI Schema: Game
export const GameSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

// OpenAPI Schema: Score
// Note: The backend returns a full Team object in the Score, not TeamInfo.
export const ScoreSchema = z.object({
  id: z.number(),
  points: z.number(),
  user_id: z.number(),
  team_id: z.number(),
  user: UserSchema,
  team: TeamSchema, // Corrected from TeamInfoSchema to full TeamSchema
});

// OpenAPI Schema: MatchGame
export const MatchGameSchema = z.object({
  id: z.number(),
  game_id: z.number(),
  structure_type: z.string(),
  structure_details: z.record(z.string(), z.any()),
  game: GameSchema,
  scores: z.array(ScoreSchema).default([]),
});

// OpenAPI Schema: Match
export const MatchSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_time: z.string().nullable(), // Relaxed validation from .datetime()
  end_time: z.string().nullable(),   // Relaxed validation from .datetime()
  winning_team_id: z.number().nullable(),
  participants: z.array(TeamSchema).default([]),
  match_games: z.array(MatchGameSchema).default([]),
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