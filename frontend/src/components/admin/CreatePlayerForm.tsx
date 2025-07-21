"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createUser } from "@/services/userService"
import { useState } from "react"

const formSchema = z.object({
  nickname: z.string().min(2, {
    message: "选手昵称至少需要2个字符。",
  }),
  source: z.string().optional(),
})

export function CreatePlayerForm() {
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      source: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus(null);
    try {
      const newUser = await createUser(values);
      setStatus({ type: 'success', message: `成功创建选手: ${newUser.nickname} (ID: ${newUser.id})` });
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
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>选手昵称</FormLabel>
              <FormControl>
                <Input placeholder="例如：Faker" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>来源 (可选)</FormLabel>
              <FormControl>
                <Input placeholder="例如：Twitch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">创建选手</Button>
        {status && (
          <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.message}
          </p>
        )}
      </form>
    </Form>
  )
}