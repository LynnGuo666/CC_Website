"use client";

import { useEffect, useMemo, useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { getGames, type Game } from "@/services/gameService";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles, Tags } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [seasonalOnly, setSeasonalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getGames();
        setGames(list ?? []);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("无法加载游戏列表。请确认后端服务已启动。");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredGames = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return games.filter((game) => {
      if (seasonalOnly && !game.seasonal) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      const target = `${game.name ?? ""} ${game.code ?? ""} ${
        game.description ?? ""
      }`.toLowerCase();
      return target.includes(keyword);
    });
  }, [games, search, seasonalOnly]);

  return (
    <div className="relative min-h-screen">
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

      <HeroSection title="游戏介绍" subtitle="直接浏览后台配置的小游戏项目。">
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="glass-panel glass-spectrum">
            {loading ? "正在读取 /api/games 数据..." : `共 ${games.length} 个项目`}
          </Badge>
          <Badge variant="secondary" className="glass-panel glass-spectrum">
            数据来源：后端 /api/games
          </Badge>
        </div>
      </HeroSection>

      <section className="section-shell pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="glass-panel rounded-2xl p-5 shadow-md backdrop-blur-apple">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2 w-full md:max-w-xl">
                <p className="text-sm font-semibold text-foreground">搜索项目</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="输入名称、代码或简介关键字..."
                    className="pl-9 bg-white/80 dark:bg-slate-900/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  关键词将同时匹配项目名称、代码以及描述字段。
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setSeasonalOnly((v) => !v)}
                variant={seasonalOnly ? "default" : "outline"}
                className="w-full md:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                {seasonalOnly ? "显示全部项目" : "仅看季节限定"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>正在从后端读取数据...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
              {error}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-muted p-8 text-center text-muted-foreground">
              暂无匹配的项目，可在后台创建数据或调整筛选条件。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {filteredGames.map((game) => (
                <Link key={game.id} href={`/games/${game.id}`} className="block">
                  <Card className="glass-card relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                      {game.image_url ? (
                        <Image
                          src={game.image_url}
                          alt={game.name}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                          暂无封面图
                        </div>
                      )}
                      {game.seasonal && (
                        <div className="absolute right-3 top-3">
                          <Badge className="flex items-center gap-1 rounded-full bg-amber-500/25 text-amber-900 shadow-sm dark:bg-amber-500/15 dark:text-amber-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            {game.season_label || "季节限定"}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="relative z-10 space-y-3 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-foreground">
                          {game.name}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Tags className="h-3.5 w-3.5" />
                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-foreground/80 dark:bg-white/5">
                            {game.code || "未设置"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">ID #{game.id}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-3 pt-0">
                      <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3 min-h-[3rem]">
                        {game.tagline?.trim() ||
                          game.description?.trim() ||
                          "暂无简介，点击查看详情。"}
                      </p>
                      <div className="text-[12px] text-muted-foreground">
                        {game.seasonal
                          ? (game.season_label || "季节限定")
                          : "常驻项目"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
