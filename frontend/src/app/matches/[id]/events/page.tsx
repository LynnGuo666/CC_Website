"use client";

import { useEffect, useState, memo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMatchEvents, getMatchById, type Match, type MatchEventsResponse } from "@/services/matchService";
import { FloatingActionButton } from "@/components/floating-action-button";

// 优化：使用 memo 避免不必要的重渲染
const EventRow = memo(({ event }: { event: any }) => {
  // 判断是否有对阵信息
  const hasMatchup = event.team && event.opponent_team && event.team.id !== event.opponent_team.id;

  if (hasMatchup) {
    // 对阵模式：显示对阵图（用于 BattleBox 等 PvP 游戏）
    return (
      <div className="flex items-center gap-3 text-sm border-b border-muted/30 pb-2">
        {/* 队伍@选手 */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: event.team.color || '#6b7280' }}
          />
          <span className="font-medium">
            {event.team.name}
            {event.user?.nickname && (
              <span className="text-muted-foreground">@{event.user.nickname}</span>
            )}
          </span>
        </div>

        {/* VS 对手队伍 */}
        <Badge variant="outline" className="text-xs">VS</Badge>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: event.opponent_team.color || '#6b7280' }}
          />
          <span className="font-medium">{event.opponent_team.name}</span>
        </div>

        {/* 得分 */}
        <span className="text-primary font-bold">{event.points} 分</span>

        {/* 其他信息 */}
        <Badge variant="secondary" className="text-xs">{event.event_type}</Badge>
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
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(event.created_at).toLocaleString("zh-CN")}
        </span>
      </div>
    );
  }

  // 普通模式：原有显示方式
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm border-b border-muted/30 pb-2">
      <Badge variant="secondary">{event.event_type}</Badge>
      {event.team?.name && (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: event.team.color || '#6b7280' }}
          />
          <span className="font-semibold">{event.team.name}</span>
        </div>
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
      <span className="text-xs text-muted-foreground">
        记录时间: {new Date(event.created_at).toLocaleString("zh-CN")}
      </span>
    </div>
  );
});

EventRow.displayName = "EventRow";

// 按 area 分组事件
const groupEventsByArea = (events: any[]) => {
  const grouped = new Map<string, any[]>();

  events.forEach(event => {
    const area = event.area || '未分区';
    if (!grouped.has(area)) {
      grouped.set(area, []);
    }
    grouped.get(area)!.push(event);
  });

  // 排序：有分区的在前，未分区的在后
  return Array.from(grouped.entries()).sort((a, b) => {
    if (a[0] === '未分区') return 1;
    if (b[0] === '未分区') return -1;
    return a[0].localeCompare(b[0]);
  });
};

// 按对阵分组（用于 BattleBox 等 PvP 游戏）
const groupEventsByMatchup = (events: any[]) => {
  const rounds = new Map<string, any[]>();

  events.forEach(event => {
    // 检查是否是真实对阵（team ≠ opponent_team）
    const isRealMatchup = event.team && event.opponent_team &&
                          event.team.id !== event.opponent_team.id;

    if (isRealMatchup) {
      // 创建对阵键（排序以确保 A vs B 和 B vs A 是同一场）
      const teamIds = [event.team.id, event.opponent_team.id].sort((a, b) => a - b);
      const matchupKey = `${teamIds[0]}-vs-${teamIds[1]}`;

      if (!rounds.has(matchupKey)) {
        rounds.set(matchupKey, []);
      }
      rounds.get(matchupKey)!.push(event);
    } else {
      // 非对阵模式，按队伍分组
      const teamKey = `team-${event.team?.id || 'unknown'}`;
      if (!rounds.has(teamKey)) {
        rounds.set(teamKey, []);
      }
      rounds.get(teamKey)!.push(event);
    }
  });

  return Array.from(rounds.entries());
};

// 按 round 分组对阵（用于 BattleBox）
// 根据场地(area)、时间、对战人员自动推断轮次
const groupMatchupsByRound = (events: any[]) => {
  // 先按对阵分组
  const matchups = new Map<string, any[]>();

  events.forEach(event => {
    const isRealMatchup = event.team && event.opponent_team &&
                          event.team.id !== event.opponent_team.id;

    if (isRealMatchup) {
      const teamIds = [event.team.id, event.opponent_team.id].sort((a, b) => a - b);
      const matchupKey = `${teamIds[0]}-vs-${teamIds[1]}`;

      if (!matchups.has(matchupKey)) {
        matchups.set(matchupKey, []);
      }
      matchups.get(matchupKey)!.push(event);
    }
  });

  // 将对阵按时间排序，然后按场地分组来推断轮次
  const matchupArray = Array.from(matchups.entries()).map(([key, events]) => ({
    key,
    events,
    // 使用该对阵最早的事件时间作为对阵开始时间
    startTime: new Date(events[0].created_at).getTime(),
    area: events[0].area || '未知场地'
  }));

  // 按时间排序
  matchupArray.sort((a, b) => a.startTime - b.startTime);

  // 根据场地和时间推断轮次
  const rounds = new Map<string, Array<[string, any[]]>>();
  const areaRoundMap = new Map<string, number>(); // 记录每个场地当前的轮次

  matchupArray.forEach(matchup => {
    const area = matchup.area;

    // 如果这个场地还没有轮次，从1开始
    if (!areaRoundMap.has(area)) {
      areaRoundMap.set(area, 1);
    }

    const currentRound = areaRoundMap.get(area)!;
    const roundLabel = `第 ${currentRound} 轮`;

    if (!rounds.has(roundLabel)) {
      rounds.set(roundLabel, []);
    }

    rounds.get(roundLabel)!.push([matchup.key, matchup.events]);

    // 每个场地的对阵完成后，该场地进入下一轮
    areaRoundMap.set(area, currentRound + 1);
  });

  return Array.from(rounds.entries()).map(([round, matchups]) => ({
    round,
    matchups
  }));
};

export default function MatchEventsPage() {
  const params = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEventsResponse["games"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGames, setExpandedGames] = useState<Set<number>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());

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

  const toggleArea = (areaKey: string) => {
    setExpandedAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaKey)) {
        newSet.delete(areaKey);
      } else {
        newSet.add(areaKey);
      }
      return newSet;
    });
  };

  const toggleRound = (roundKey: string) => {
    setExpandedRounds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roundKey)) {
        newSet.delete(roundKey);
      } else {
        newSet.add(roundKey);
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

            // 按 area 分组
            const areaGroups = groupEventsByArea(group.events);

            return (
              <Card key={group.match_game_id}>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGame(group.match_game_id)}
                >
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    <span>{group.game_name}</span>
                    {group.game_code && (
                      <Badge variant="outline" className="text-xs">
                        {group.game_code}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      共 {group.events.length} 条 · {areaGroups.length} 个分区
                    </span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {isExpanded ? "点击折叠 ▲" : "点击展开 ▼"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="space-y-4">
                    {/* 检测是否是 BattleBox（通过游戏 ID 判断） */}
                    {group.game_code?.toLowerCase() === 'battlebox' ? (
                      // BattleBox 模式：按 round 分组
                      (() => {
                        const roundGroups = groupMatchupsByRound(group.events);
                        return roundGroups.map(({ round, matchups }) => {
                          const roundKey = `${group.match_game_id}-${round}`;
                          const isRoundExpanded = expandedRounds.has(roundKey);

                          return (
                            <div key={roundKey} className="border rounded-lg overflow-hidden">
                              {/* Round Header */}
                              <div
                                className="px-4 py-3 bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => toggleRound(roundKey)}
                              >
                                <div className="flex items-center gap-3">
                                  <Badge variant="default" className="text-xs">
                                    {round}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {matchups.length} 场对阵
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {isRoundExpanded ? "收起 ▲" : "展开 ▼"}
                                </Badge>
                              </div>

                              {/* Round Content - Grid Layout */}
                              {isRoundExpanded && (
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                  {matchups.map(([matchupKey, matchupEvents]) => {
                                    const firstEvent = matchupEvents[0];
                                    const team1 = firstEvent.team;
                                    const team2 = firstEvent.opponent_team;

                                    // 计算双方总分
                                    const team1Score = matchupEvents
                                      .filter((e: any) => e.team?.id === team1?.id)
                                      .reduce((sum: number, e: any) => sum + e.points, 0);
                                    const team2Score = matchupEvents
                                      .filter((e: any) => e.team?.id === team2?.id)
                                      .reduce((sum: number, e: any) => sum + e.points, 0);

                                    return (
                                      <div key={matchupKey} className="glass p-4 rounded-lg hover:shadow-lg transition-all">
                                        {/* 对阵卡片 */}
                                        <div className="space-y-3">
                                          {/* 队伍1 */}
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: team1?.color || '#6b7280' }}
                                              />
                                              <span className="font-semibold truncate">{team1?.name}</span>
                                            </div>
                                            <span className={`text-xl font-bold ml-2 ${team1Score > team2Score ? 'text-green-600' : ''}`}>
                                              {team1Score}
                                            </span>
                                          </div>

                                          {/* VS 分隔线 */}
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 h-px bg-border"></div>
                                            <Badge variant="outline" className="text-xs">VS</Badge>
                                            <div className="flex-1 h-px bg-border"></div>
                                          </div>

                                          {/* 队伍2 */}
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: team2?.color || '#6b7280' }}
                                              />
                                              <span className="font-semibold truncate">{team2?.name}</span>
                                            </div>
                                            <span className={`text-xl font-bold ml-2 ${team2Score > team1Score ? 'text-green-600' : ''}`}>
                                              {team2Score}
                                            </span>
                                          </div>

                                          {/* 详细信息（可选，折叠显示） */}
                                          <details className="text-xs text-muted-foreground mt-2">
                                            <summary className="cursor-pointer hover:text-foreground">查看详情</summary>
                                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                              {matchupEvents.map((event: any) => (
                                                <div key={event.id} className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div
                                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                                      style={{ backgroundColor: event.team?.color || '#6b7280' }}
                                                    />
                                                    <span className="truncate">{event.user?.nickname || '未知'}</span>
                                                  </div>
                                                  <span className="font-medium">{event.points}分</span>
                                                </div>
                                              ))}
                                            </div>
                                          </details>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()
                    ) : (
                      // 非 BattleBox 游戏：按 area 分组
                      areaGroups.map(([area, areaEvents]) => {
                        const areaKey = `${group.match_game_id}-${area}`;
                        const isAreaExpanded = expandedAreas.has(areaKey);
                        const hasManyInArea = areaEvents.length > 20;

                        // 检测是否有真实对阵
                        const hasRealMatchups = areaEvents.some((e: any) =>
                          e.team && e.opponent_team && e.team.id !== e.opponent_team.id
                        );

                        const matchupGroups = hasRealMatchups ? groupEventsByMatchup(areaEvents) : null;

                      return (
                        <div key={areaKey} className="border rounded-lg overflow-hidden">
                          {/* Area Header */}
                          <div
                            className={`px-4 py-3 bg-muted/30 flex items-center justify-between ${
                              hasManyInArea ? 'cursor-pointer hover:bg-muted/50' : ''
                            }`}
                            onClick={() => hasManyInArea && toggleArea(areaKey)}
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="default" className="text-xs">
                                {area}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {areaEvents.length} 条记录
                                {matchupGroups && ` · ${matchupGroups.length} 场对阵`}
                              </span>
                            </div>
                            {hasManyInArea && (
                              <Badge variant="outline" className="text-xs">
                                {isAreaExpanded ? "收起 ▲" : "展开 ▼"}
                              </Badge>
                            )}
                          </div>

                          {/* Area Content */}
                          {(!hasManyInArea || isAreaExpanded) && (
                            <div className="p-4 space-y-4">
                              {matchupGroups ? (
                                // PvP 模式：按对阵分组显示
                                matchupGroups.map(([matchupKey, matchupEvents], idx) => {
                                  const firstEvent = matchupEvents[0];
                                  const team1 = firstEvent.team;
                                  const team2 = firstEvent.opponent_team;

                                  // 计算双方总分
                                  const team1Score = matchupEvents
                                    .filter((e: any) => e.team?.id === team1?.id)
                                    .reduce((sum: number, e: any) => sum + e.points, 0);
                                  const team2Score = matchupEvents
                                    .filter((e: any) => e.team?.id === team2?.id)
                                    .reduce((sum: number, e: any) => sum + e.points, 0);

                                  return (
                                    <div key={matchupKey} className="border rounded-lg p-4 bg-muted/10">
                                      {/* 对阵标题 */}
                                      <div className="flex items-center justify-between mb-3 pb-3 border-b">
                                        <div className="flex items-center gap-3 flex-1">
                                          <Badge variant="secondary" className="text-xs">
                                            第 {idx + 1} 场
                                          </Badge>
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-3 h-3 rounded-full"
                                              style={{ backgroundColor: team1?.color || '#6b7280' }}
                                            />
                                            <span className="font-semibold">{team1?.name}</span>
                                          </div>
                                          <Badge variant="outline" className="text-xs">VS</Badge>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold">{team2?.name}</span>
                                            <div
                                              className="w-3 h-3 rounded-full"
                                              style={{ backgroundColor: team2?.color || '#6b7280' }}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-lg font-bold">
                                          <span className={team1Score > team2Score ? 'text-green-600' : ''}>
                                            {team1Score}
                                          </span>
                                          <span className="text-muted-foreground">:</span>
                                          <span className={team2Score > team1Score ? 'text-green-600' : ''}>
                                            {team2Score}
                                          </span>
                                        </div>
                                      </div>

                                      {/* 详细事件 */}
                                      <div className="space-y-2">
                                        {matchupEvents.map((event: any) => (
                                          <EventRow key={event.id} event={event} />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                // 普通模式：直接显示所有事件
                                <div className="space-y-2">
                                  {areaEvents.map((event: any) => (
                                    <EventRow key={event.id} event={event} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
      <FloatingActionButton
        href={`/matches/${match.id}`}
        title="返回赛事详情"
        icon={
          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 5l-7 7 7 7" />
          </svg>
        }
      />
    </div>
  );
}
