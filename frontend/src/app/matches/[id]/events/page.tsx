"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMatchEvents, getMatchById, type Match, type MatchEventsResponse } from "@/services/matchService";

export default function MatchEventsPage() {
  const params = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEventsResponse["games"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          events.map((group) => (
            <Card key={group.match_game_id}>
              <CardHeader>
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.events.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center gap-3 text-sm border-b border-muted/30 pb-2"
                  >
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
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
