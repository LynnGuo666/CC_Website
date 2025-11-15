"use client";

import { useState, useEffect } from 'react';
import { getMatches, MatchList } from '@/services/matchService';
import Link from 'next/link';
import { HeroSection } from '@/components/hero-section';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 比赛状态映射
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'preparing':
      return {
        text: '筹办中',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        dotColor: 'bg-yellow-500'
      };
    case 'ongoing':
      return {
        text: '进行中',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        dotColor: 'bg-green-500'
      };
    case 'finished':
      return {
        text: '已结束',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        dotColor: 'bg-gray-500'
      };
    case 'cancelled':
      return {
        text: '已取消',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        dotColor: 'bg-red-500'
      };
    default:
      return {
        text: '未知',
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
        dotColor: 'bg-gray-400'
      };
  }
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await getMatches();
        setMatches(data);
      } catch (e) {
        setError('无法加载赛事列表。后端服务是否正在运行？');
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  // 按状态分组比赛，并在各分组内按开赛时间倒序排序
  const sortMatchesByStartTime = (matches: MatchList[]) => {
    return matches.sort((a, b) => {
      // 如果都有开赛时间，按时间倒序排序（最新的在前）
      if (a.start_time && b.start_time) {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      }
      // 有开赛时间的排在前面
      if (a.start_time && !b.start_time) return -1;
      if (!a.start_time && b.start_time) return 1;
      // 都没有开赛时间，按创建时间降序排序
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const ongoingMatches = sortMatchesByStartTime(matches.filter(m => m.status === 'ongoing'));
  const preparingMatches = sortMatchesByStartTime(matches.filter(m => m.status === 'preparing'));
  const finishedMatches = sortMatchesByStartTime(matches.filter(m => m.status === 'finished'));
  
  return (
    <div className="min-h-screen">
      <HeroSection
        title="MC 小游戏竞技赛事"
        subtitle="探索精彩的 Minecraft 小游戏竞赛，追踪赛程、观众热度与选手表现。"
      />

      <section className="section-shell">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="glass-card text-center p-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground">正在加载赛事...</h3>
              <p className="text-muted-foreground">请稍候</p>
            </div>
          ) : error ? (
            <div className="glass-card border border-destructive/40 text-destructive p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Ongoing Matches */}
              {ongoingMatches.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]"></div>
                    <h2 className="text-2xl font-semibold text-foreground">正在进行的赛事</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ongoingMatches.map((match) => (
                      <MatchCard key={match.id} match={match} priority={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* Preparing Matches */}
              {preparingMatches.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold mb-8 text-foreground">筹办中的赛事</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {preparingMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              {/* Finished Matches */}
              {finishedMatches.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold mb-8 text-foreground">已结束的赛事</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {finishedMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {matches.length === 0 && (
                <div className="glass-card text-center p-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <h3 className="text-2xl font-semibold mb-2">暂无赛事</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    还没有创建任何赛事。等待管理员添加新的比赛项目吧！
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// Match Card Component
function MatchCard({ match, priority = false }: { match: MatchList; priority?: boolean }) {
  const statusInfo = getStatusInfo(match.status);
  
  return (
    <Link href={`/matches/${match.id}`} className="group">
      <Card
        className={`glass-card h-full transition-all duration-300 ${
          priority ? 'ring-2 ring-green-400/30' : ''
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                {match.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor} ${
                  match.status === 'ongoing' ? 'animate-pulse' : ''
                }`}></div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              {match.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {match.description}
                </p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pb-4">
          <div className="space-y-4">
            {/* 显示开赛和结束时间 */}
            {(match.start_time || match.end_time) && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                {match.start_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">开赛时间</span>
                    <span className="font-semibold text-sm">
                      {new Date(match.start_time).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {match.end_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">结束时间</span>
                    <span className="font-semibold text-sm">
                      {new Date(match.end_time).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {match.prize_pool && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">奖金池</span>
                <span className="font-semibold">{match.prize_pool}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="w-full text-center">
            <span className="text-sm font-medium text-primary group-hover:underline">
              查看详情 →
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
