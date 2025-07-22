'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export default function LivePage() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  // Mock data for development
  useEffect(() => {
    setLiveMatches([
      {
        id: 1,
        name: 'W²CC冬季联动锦标赛',
        status: 'live',
        viewers: 1234,
        current_game: 'Minecraft 建筑大赛',
        progress: 65,
        teams_count: 10,
        featured: true,
        thumbnail: '/api/placeholder/400/200'
      },
      {
        id: 2,
        name: 'TRIALHAMMER预选赛',
        status: 'upcoming',
        start_time: '14:30',
        viewers: 0,
        teams_count: 6,
        featured: false
      },
      {
        id: 3,
        name: 'RIA友谊赛',
        status: 'finished',
        viewers: 0,
        winner: '落地水队',
        teams_count: 4,
        featured: false
      }
    ]);
  }, []);

  const getStatusBadge = (status: string) => {
    const config = {
      live: { label: '直播中', className: 'bg-red-500 text-white animate-pulse' },
      upcoming: { label: '即将开始', className: 'bg-yellow-500 text-white' },
      finished: { label: '已结束', className: 'bg-gray-500 text-white' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.upcoming;
    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  const liveMatch = liveMatches.find(match => match.status === 'live');
  const upcomingMatches = liveMatches.filter(match => match.status === 'upcoming');
  const recentMatches = liveMatches.filter(match => match.status === 'finished');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-16 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-500/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mr-2"></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              实时直播
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            观看联合锦标赛精彩直播，实时了解比赛动态和选手表现
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Live Match */}
        {liveMatch && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mr-3"></div>
              <h2 className="text-2xl font-bold">正在直播</h2>
            </div>
            
            <Card className="glass border-red-200 bg-gradient-to-br from-red-50/50 to-purple-50/50 dark:from-red-900/10 dark:to-purple-900/10">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Thumbnail */}
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-red-400 to-purple-600 rounded-lg m-6 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-2">🎮</div>
                        <p className="text-lg font-medium">{liveMatch.current_game}</p>
                        <div className="mt-2 bg-black/20 rounded-full px-3 py-1 text-sm">
                          进度 {liveMatch.progress}%
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-8 right-8">
                      <Badge className="bg-red-500 text-white animate-pulse">
                        🔴 LIVE
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Match Info */}
                  <div className="p-6 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">{liveMatch.name}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">当前游戏</span>
                        <span className="font-semibold">{liveMatch.current_game}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">观看人数</span>
                        <span className="font-semibold text-red-500">
                          👁️ {liveMatch.viewers.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">参赛队伍</span>
                        <span className="font-semibold">{liveMatch.teams_count} 支</span>
                      </div>
                      
                      <div className="mt-4">
                        <Link href={`/live/${liveMatch.id}`}>
                          <Button className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white mb-2">
                            <span className="mr-2">🎮</span>
                            进入直播间
                          </Button>
                        </Link>
                        <Link href={`/live/${liveMatch.id}?mode=demo`}>
                          <Button variant="outline" className="w-full">
                            <span className="mr-2">🎭</span>
                            演示模式
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Matches */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              ⏰ 即将开始
            </h2>
            
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <Card key={match.id} className="glass hover:border-primary/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{match.name}</h3>
                        {getStatusBadge(match.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>开始时间: {match.start_time}</div>
                        <div>参赛队伍: {match.teams_count} 支</div>
                      </div>
                      
                      <div className="mt-4">
                        <Button variant="outline" className="w-full" disabled>
                          <span className="mr-2">⏰</span>
                          {match.start_time} 开始
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    ⏰
                  </div>
                  <p className="text-muted-foreground">暂无即将开始的比赛</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Matches */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              📺 最近结束
            </h2>
            
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <Card key={match.id} className="glass hover:border-primary/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{match.name}</h3>
                        {getStatusBadge(match.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div>获胜队伍: <span className="text-foreground font-medium">{match.winner}</span></div>
                        <div>参赛队伍: {match.teams_count} 支</div>
                      </div>
                      
                      <div className="mt-4">
                        <Link href={`/live/${match.id}`}>
                          <Button variant="outline" className="w-full">
                            <span className="mr-2">📺</span>
                            观看回放
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    📺
                  </div>
                  <p className="text-muted-foreground">暂无最近结束的比赛</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">直播统计</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-red-500 mb-2">1</div>
                <div className="text-sm text-muted-foreground">正在直播</div>
              </CardContent>
            </Card>
            
            <Card className="glass text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-yellow-500 mb-2">{upcomingMatches.length}</div>
                <div className="text-sm text-muted-foreground">即将开始</div>
              </CardContent>
            </Card>
            
            <Card className="glass text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-primary mb-2">1,234</div>
                <div className="text-sm text-muted-foreground">总观看人数</div>
              </CardContent>
            </Card>
            
            <Card className="glass text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-accent mb-2">{liveMatches.reduce((sum, match) => sum + match.teams_count, 0)}</div>
                <div className="text-sm text-muted-foreground">参赛队伍</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}