"use client";

import { useEffect, useState, memo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMatchEvents, getMatchById, type Match, type MatchEventsResponse } from "@/services/matchService";

// 优化：使用 memo 避免不必要的重渲染
const EventRow = memo(({ event }: { event: any }) => (
  <div className="flex flex-wrap items-center gap-3 text-sm border-b border-muted/30 pb-2">
    <Badge variant="secondary">{event.event_type}</Badge>
    {event.team?.name && (
      <span className="font-semibold">{event.team.name}</span>
    )}
    {event.user?.nickname && (
      <span className="text-muted-foreground">@{event.user.nickname}</span>
    )}
    <span className="text-primary font-semibold">{event.points} 分</span>
    {event.game_round_label && (
      <span className="text-xs text-muted-foreground">
        局次: {event.game_round_label}
      </span>
    )}
    {event.area && (
      <span className="text-xs text-muted-foreground">
        分区: {event.area}
      </span>
    )}
    {event.opponent_team?.name && (
      <span className="text-xs text-muted-foreground">
        对阵: {event.opponent_team.name}
      </span>
    )}
    <span className="text-xs text-muted-foreground">
      记录时间: {new Date(event.created_at).toLocaleString("zh-CN")}
    </span>
  </div>
));

EventRow.displayName = "EventRow";

export default function MatchEventsPage() {
  const params = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEventsResponse["games"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGames, setExpandedGames] = useState<Set<number>>(new Set());

  const toggleGame = (gameId: number) => {
    setExpandedGames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const matchId = Number(params?.id);
    if (!matchId || Number.isNaN(matchId)) {
      setError("无效的赛事 ID");
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const [matchData, eventsData] = await Promise.all([
          getMatchById(matchId),
          getMatchEvents(matchId),
        ]);
        setMatch(matchData);
        setEvents(eventsData?.games || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("加载赛事数据失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        正在加载赛事细节...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>{error}</p>
        <Link href={`/matches/${params?.id}`} className="text-primary hover:underline">
          ← 返回赛事详情
        </Link>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>未找到该赛事</p>
        <Link href="/matches" className="text-primary hover:underline">
          ← 返回赛事列表
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{match.name} · 数据详情</h1>
            <p className="text-muted-foreground">
              按赛程展示细粒度小分记录，可用于复盘和分析。
            </p>
          </div>
          <Link href={`/matches/${match.id}`} className="text-primary hover:underline">
            ← 返回赛事详情
          </Link>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              暂无细分记录，可通过 CSV 导入脚本写入 score_events 表。
            </CardContent>
          </Card>
        ) : (
          events.map((group) => {
            const isExpanded = expandedGames.has(group.match_game_id);
            const hasMany = group.events.length > 50;

            return (
              <Card key={group.match_game_id}>
                <CardHeader
                  className={hasMany ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                  onClick={() => hasMany && toggleGame(group.match_game_id)}
                >
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    <span>{group.game_name}</span>
                    {group.game_code && (
                      <Badge variant="outline" className="text-xs">
                        {group.game_code}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      共 {group.events.length} 条
                    </span>
                    {hasMany && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {isExpanded ? "点击折叠 ▲" : "点击展开 ▼"}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                {(!hasMany || isExpanded) && (
                  <CardContent className="space-y-2">
                    {/* 优化：限制显示数量，避免渲染过多DOM元素导致卡顿 */}
                    {group.events.length > 200 ? (
                      <>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ 该游戏有 {group.events.length} 条记录，为提升性能仅显示前 200 条
                          </p>
                        </div>
                        {group.events.slice(0, 200).map((event: any) => (
                          <EventRow key={event.id} event={event} />
                        ))}
                      </>
                    ) : (
                      group.events.map((event: any) => (
                        <EventRow key={event.id} event={event} />
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
