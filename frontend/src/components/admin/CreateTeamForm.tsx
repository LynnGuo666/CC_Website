"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { createTeam } from "@/services/teamService"
import { useState } from "react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "队伍名称至少需要2个字符。",
  }),
  team_number: z.coerce.number().int().positive({ message: "队伍编号必须为正整数。" }),
  color: z.string().optional(),
})

export function CreateTeamForm() {
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      team_number: 1,
      color: "#ffffff",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus(null);
    try {
      const newTeam = await createTeam(values);
      setStatus({ type: 'success', message: `成功创建队伍: ${newTeam.name} (ID: ${newTeam.id})` });
      form.reset();
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
          name="team_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>队伍编号</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                一个用于识别队伍的唯一正整数。
              </FormDescription>
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
        <Button type="submit">创建队伍</Button>
        {status && (
          <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.message}
          </p>
        )}
      </form>
    </Form>
  )
}