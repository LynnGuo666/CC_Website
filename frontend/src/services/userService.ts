import apiFetch from './api';
import { UserSchema } from '@/types/schemas';
import { z } from 'zod';

// Infer the TypeScript type from the schema
export type User = z.infer<typeof UserSchema>;

const UserCreateSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空"),
  source: z.string().optional(),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;

const UsersApiResponseSchema = z.array(UserSchema);

/**
 * 获取所有用户的列表
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
  return await apiFetch<User[]>('/users', {
    method: 'GET',
    schema: UsersApiResponseSchema,
    next: {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['users'],
    },
  });
}

/**
 * 创建一个新用户/选手
 * @param userData The data for the new user.
 * @returns A promise that resolves to the newly created user object.
 */
export async function createUser(userData: UserCreate): Promise<User> {
  const validatedData = UserCreateSchema.parse(userData);

  return await apiFetch<User>('/users', {
    method: 'POST',
    body: validatedData,
    schema: UserSchema,
  });
}

/**
 * 根据 ID 获取单个用户的详细信息
 * @param id The ID of the user.
 * @returns A promise that resolves to a single user object.
 */
export async function getUserById(id: number): Promise<User> {
  return await apiFetch<User>(`/users/${id}`, {
    method: 'GET',
    schema: UserSchema,
    next: {
      revalidate: 300,
      tags: ['users', `user:${id}`],
    },
  });
}