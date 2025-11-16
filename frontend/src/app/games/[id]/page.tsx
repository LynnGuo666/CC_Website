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
    <div className="relative min-h-screen pb-20">
      {/* Liquid Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 -z-10"></div>

      {/* Animated liquid glass orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          aria-hidden="true"
          className="refraction-blob top-1/4 left-1/4 w-96 h-96"
          style={{
            animation: 'liquid-flow 15s ease-in-out infinite',
          } as React.CSSProperties}
        ></div>
        <div
          aria-hidden="true"
          className="refraction-blob bottom-1/4 right-1/4 w-96 h-96"
          style={{
            animation: 'liquid-flow 18s ease-in-out infinite reverse',
          } as React.CSSProperties}
        ></div>
      </div>

      <div className="relative isolate overflow-hidden">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-12 md:px-6 md:pt-16">
          <Button asChild variant="ghost" size="sm" className="w-fit glass-panel backdrop-blur-apple">
            <Link href="/games" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
          </Button>

          {/* 主卡片 - 包含封面、标题和基本信息 */}
          <div className="glass-card relative overflow-hidden rounded-3xl shadow-xl">
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

            <div className="p-6 space-y-6">
              {/* 标题和简介 */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">{game.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tags className="h-4 w-4" />
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-foreground/80 dark:bg-white/5">
                      {game.code || "未设置"}
                    </span>
                    <span className="text-[12px] text-muted-foreground">ID #{game.id}</span>
                  </div>
                </div>
                <p className="text-base text-foreground/80 leading-relaxed">
                  {game.tagline?.trim() ||
                    game.description?.trim() ||
                    "暂无简介，可在后台补充。"}
                </p>
              </div>

              {/* 基本信息 */}
              <div className="border-t border-white/20 pt-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">基本信息</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex justify-between items-center rounded-xl glass-panel px-4 py-3">
                    <span className="text-foreground/70">项目代码</span>
                    <span className="font-semibold text-foreground">{game.code || "未设置"}</span>
                  </div>
                  <div className="flex justify-between items-center rounded-xl glass-panel px-4 py-3">
                    <span className="text-foreground/70">季节属性</span>
                    <span className="font-semibold text-foreground">
                      {game.seasonal ? (game.season_label || "季节限定") : "常驻项目"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 规则说明卡片 */}
          <Card className="glass-card shadow-lg mb-12">
            <CardHeader>
              <CardTitle className="text-xl">规则 / 玩法说明</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
              <MarkdownViewer content={game.rule || game.description || "暂无详细规则说明。"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
