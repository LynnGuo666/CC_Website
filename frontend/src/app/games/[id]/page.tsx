"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Tags } from "lucide-react";
import { getGame, type Game } from "@/services/gameService";
import { MarkdownViewer } from "@/components/markdown-viewer";

const getMatchStatusBadge = (status?: string | null) => {
  switch (status) {
    case "preparing":
      return { label: "筹办中", className: "bg-amber-500/15 text-amber-800 dark:text-amber-100" };
    case "ongoing":
      return { label: "进行中", className: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-100" };
    case "finished":
      return { label: "已结束", className: "bg-slate-500/15 text-slate-800 dark:text-slate-100" };
    case "cancelled":
      return { label: "已取消", className: "bg-red-500/15 text-red-800 dark:text-red-100" };
    default:
      return { label: "未知状态", className: "bg-muted text-muted-foreground" };
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "未排期";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未排期";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
      <div className="relative min-h-screen pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 -z-10"></div>
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

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-16 md:px-6">
          <div className="flex items-center justify-between">
            <div className="h-9 w-24 rounded-full bg-muted/60 animate-pulse" />
            <Badge variant="outline" className="glass-panel animate-pulse">加载中</Badge>
          </div>
          <div className="glass-card relative overflow-hidden rounded-3xl shadow-xl">
            <div className="h-64 w-full bg-muted/60 animate-pulse" />
            <div className="p-6 space-y-5">
              <div className="h-8 w-1/3 rounded-lg bg-muted/70 animate-pulse" />
              <div className="h-4 w-24 rounded-full bg-muted/50 animate-pulse" />
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="h-4 w-full rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-5/6 rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-4/6 rounded-md bg-muted/40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
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

  const selectedMatches = game.selected_matches ?? [];

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

              <div className="border-t border-white/20 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">入选锦标赛</h2>
                  <Badge variant="outline" className="rounded-full">
                    {selectedMatches.length} 个赛事
                  </Badge>
                </div>

                {selectedMatches.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {selectedMatches.map((match) => {
                      const badge = getMatchStatusBadge(match.status);
                      return (
                        <Link
                          key={match.id}
                          href={`/matches/${match.id}`}
                          className="group rounded-2xl border border-white/5 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-slate-950/50"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {match.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(match.start_time)} 开赛
                              </p>
                            </div>
                            <Badge className={badge.className} variant="secondary">
                              {badge.label}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-muted/80 p-4 text-sm text-muted-foreground">
                    暂无赛事选择该项目。
                  </div>
                )}
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
