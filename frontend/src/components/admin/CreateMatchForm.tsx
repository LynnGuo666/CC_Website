"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMatch, MatchCreate } from "@/services/matchService"
import { Game, getGames } from "@/services/gameService"
import { useEffect, useState } from "react"
import { Card } from "../ui/card"

// Schema for the form state
const formSchema = z.object({
  name: z.string().min(2, { message: "赛事名称至少需要2个字符。" }),
  match_games: z.array(
    z.object({
      game_id: z.string().min(1, "请选择一个游戏项目"),
      structure_type: z.string().min(1, "赛制类型不能为空。"),
      structure_details: z.string().refine((val) => {
        try {
          JSON.parse(val);
          return true;
        } catch (e) {
          return false;
        }
      }, { message: "必须是有效的JSON格式。" }),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateMatchForm() {
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  
  useEffect(() => {
    getGames().then(setGames).catch(() => setStatus({ type: 'error', message: '无法加载游戏列表' }));
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", match_games: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "match_games"
  });

  async function onSubmit(values: FormValues) {
    setStatus(null);
    
    // Transform data to match the API payload schema
    const payload: MatchCreate = {
      name: values.name,
      match_games: values.match_games.map(game => ({
        game_id: parseInt(game.game_id, 10),
        structure_type: game.structure_type,
        structure_details: JSON.parse(game.structure_details),
      })),
    };

    try {
      const newMatch = await createMatch(payload);
      setStatus({ type: 'success', message: `成功创建赛事: ${newMatch.name} (ID: ${newMatch.id})` });
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: "创建失败，请检查API Key或后端服务是否正常。" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>赛事名称</FormLabel>
            <FormControl><Input placeholder="例如：2025夏季杯" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div>
          <h3 className="text-lg font-medium mb-2">赛程列表</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4 bg-gray-50 dark:bg-gray-800">
                <FormField name={`match_games.${index}.game_id`} control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>游戏项目</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="选择一个游戏" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {games.map(game => <SelectItem key={game.id} value={String(game.id)}>{game.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name={`match_games.${index}.structure_type`} control={form.control} render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>赛制类型</FormLabel>
                    <FormControl><Input placeholder="例如：5v5对战" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name={`match_games.${index}.structure_details`} control={form.control} render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>赛制详情 (JSON格式)</FormLabel>
                    <FormControl><Textarea placeholder='{ "info": "..." }' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="mt-4">
                  移除赛程
                </Button>
              </Card>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ game_id: "", structure_type: "", structure_details: "{}" })} className="mt-4">
            添加赛程
          </Button>
        </div>

        <Button type="submit">创建赛事</Button>
        {status && (
          <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.message}
          </p>
        )}
      </form>
    </Form>
  )
}