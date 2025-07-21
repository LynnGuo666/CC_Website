import apiFetch from './api';
import { TeamSchema } from '@/types/schemas';
import { z } from 'zod';

// Infer the TypeScript type from the schema
export type Team = z.infer<typeof TeamSchema>;

// Define the schema for the create request body
const TeamCreateSchema = z.object({
  name: z.string().min(1, "队伍名称不能为空"),
  color: z.string().optional(),
  team_number: z.number().int().positive("队伍编号必须为正整数"),
});

export type TeamCreate = z.infer<typeof TeamCreateSchema>;

const TeamsApiResponseSchema = z.array(TeamSchema);

/**
 * 获取所有队伍的列表
 * @returns A promise that resolves to an array of teams.
 */
export async function getTeams(): Promise<Team[]> {
  return await apiFetch<Team[]>('/teams', {
    method: 'GET',
    schema: TeamsApiResponseSchema,
    next: {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['teams'],
    },
  });
}

/**
 * 根据 ID 获取单个队伍的详细信息
 * @param id The ID of the team.
 * @returns A promise that resolves to a single team object.
 */
export async function getTeamById(id: number): Promise<Team> {
  return await apiFetch<Team>(`/teams/${id}`, {
    method: 'GET',
    schema: TeamSchema,
    next: {
      revalidate: 300,
      tags: ['teams', `team:${id}`],
    },
  });
}

/**
 * 创建一个新队伍
 * @param teamData The data for the new team.
 * @returns A promise that resolves to the newly created team object.
 */
export async function createTeam(teamData: TeamCreate): Promise<Team> {
  // Validate the data with our schema before sending
  const validatedData = TeamCreateSchema.parse(teamData);
  
  return await apiFetch<Team>('/teams', {
    method: 'POST',
    body: validatedData,
    schema: TeamSchema,
  });
}