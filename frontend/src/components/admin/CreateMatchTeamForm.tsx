"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createMatchTeam } from "@/services/matchTeamService"
import { getUsers } from "@/services/userService"
import type { User } from "@/types/schemas"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "队伍名称至少需要2个字符。",
  }),
  color: z.string().optional(),
  members: z.array(z.object({
    user_id: z.number(),
    role: z.string().default('main')
  })).optional(),
})

interface CreateMatchTeamFormProps {
  matchId: number;
  onSuccess?: (team: any) => void;
}

export function CreateMatchTeamForm({ matchId, onSuccess }: CreateMatchTeamFormProps) {
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ user_id: number; role: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      members: [],
    },
  })

  useEffect(() => {
    // 加载用户列表
    async function loadUsers() {
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
    loadUsers();
  }, []);

  const handleUserToggle = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, { user_id: userId, role: 'main' }]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.user_id !== userId));
    }
  };

  const handleRoleChange = (userId: number, role: string) => {
    setSelectedUsers(prev => 
      prev.map(u => u.user_id === userId ? { ...u, role } : u)
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus(null);
    try {
      const teamData = {
        ...values,
        members: selectedUsers.length > 0 ? selectedUsers : undefined,
      };
      
      const newTeam = await createMatchTeam(matchId, teamData);
      setStatus({ 
        type: 'success', 
        message: `成功创建队伍: ${newTeam.name} (ID: ${newTeam.id})，已添加 ${selectedUsers.length} 名队员` 
      });
      form.reset();
      setSelectedUsers([]);
      
      if (onSuccess) {
        onSuccess(newTeam);
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: "创建失败，请检查API Key或后端服务是否正常。" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>队伍名称</FormLabel>
              <FormControl>
                <Input placeholder="例如：Invictus Gaming" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>代表色</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>队员选择（可选）</FormLabel>
          <FormDescription>
            选择要加入此队伍的队员，可以设置角色（主力队员/替补队员/队长）
          </FormDescription>
          
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">正在加载用户列表...</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-4">
              {users.map((user) => {
                const isSelected = selectedUsers.some(u => u.user_id === user.id);
                const selectedUser = selectedUsers.find(u => u.user_id === user.id);
                
                return (
                  <div key={user.id} className="flex items-center space-x-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleUserToggle(user.id, !!checked)}
                    />
                    <span className="flex-1">{user.nickname}</span>
                    {isSelected && (
                      <Select
                        value={selectedUser?.role || 'main'}
                        onValueChange={(role) => handleRoleChange(user.id, role)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">主力</SelectItem>
                          <SelectItem value="substitute">替补</SelectItem>
                          <SelectItem value="captain">队长</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button type="submit" disabled={!form.formState.isValid}>
          创建比赛队伍
        </Button>
        
        {status && (
          <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.message}
          </p>
        )}
      </form>
    </Form>
  )
}