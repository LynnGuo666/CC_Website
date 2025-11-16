"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, ArrowLeft, Tags } from "lucide-react";
import { getGame, type Game } from "@/services/gameService";
import { MarkdownViewer } from "@/components/markdown-viewer";

export default function GameDetailPage() {
  const params = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idNum = Number(params?.id);
    if (Number.isNaN(idNum)) {
      setError("无效的游戏 ID");
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await getGame(idNum);
        setGame(data);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("获取游戏详情失败，请检查后端服务。");
        setGame(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>正在加载...</span>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>{error || "未找到该游戏"}</p>
        <Button asChild variant="outline">
          <Link href="/games">返回列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-300/30 via-indigo-200/20 to-transparent dark:from-indigo-800/30 dark:via-slate-900/60" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-12 md:px-6 md:pt-16">
          <Button asChild variant="ghost" size="sm" className="w-fit border border-white/30 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-slate-900/40">
            <Link href="/games" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
          </Button>

          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/80 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <div className="relative h-64 w-full overflow-hidden border-b border-white/20 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                {game.image_url ? (
                  <Image
                    src={game.image_url}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 60vw, 100vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    暂无封面图
                  </div>
                )}
                {game.seasonal && (
                  <div className="absolute right-4 top-4">
                    <Badge className="flex items-center gap-1 rounded-full bg-amber-500/25 text-amber-900 shadow-sm dark:bg-amber-500/15 dark:text-amber-100">
                      <Sparkles className="h-3.5 w-3.5" />
                      {game.season_label || "季节限定"}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="space-y-3 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-foreground">{game.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tags className="h-4 w-4" />
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-foreground/80 dark:bg-white/5">
                      {game.code || "未设置"}
                    </span>
                    <span className="text-[12px] text-muted-foreground">ID #{game.id}</span>
                  </div>
                </div>
                <p className="text-sm text-foreground/80">
                  {game.tagline?.trim() ||
                    game.description?.trim() ||
                    "暂无简介，可在后台补充。"}
                </p>
                <div className="text-xs text-muted-foreground">
                  {game.seasonal ? (game.season_label || "季节限定") : "常驻项目"}
                </div>
              </div>
            </div>

            <Card className="border border-white/30 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between rounded-xl border border-white/40 bg-white/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                  <span className="text-foreground/80">代码</span>
                  <span className="font-semibold text-foreground">{game.code || "未设置"}</span>
                </div>
                <div className="flex justify-between rounded-xl border border-white/40 bg-white/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                  <span className="text-foreground/80">季节属性</span>
                  <span className="font-semibold text-foreground">
                    {game.seasonal ? (game.season_label || "季节限定") : "常驻"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-white/30 bg-white/90 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle>规则 / 玩法说明</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-3">
              <MarkdownViewer content={game.rule || game.description || ""} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
