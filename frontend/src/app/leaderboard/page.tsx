'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  getLeaderboard, 
  getLevelDistribution, 
  getAvailableGamesForLeaderboard,
  getLevelStyle,
  getRankMedal,
  type LeaderboardPlayer,
  type GlobalLeaderboardPlayer,
  type GameLeaderboardPlayer,
  type LevelDistribution,
  type GameInfo
} from '@/services/leaderboardService';
    
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HeroSection } from "@/components/hero-section";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [levelDistribution, setLevelDistribution] = useState<LevelDistribution | null>(null);
  const [availableGames, setAvailableGames] = useState<GameInfo[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 类型保护函数
  const isGlobalPlayer = (player: LeaderboardPlayer): player is GlobalLeaderboardPlayer => {
    return 'total_games_played' in player;
  };

  const isGamePlayer = (player: LeaderboardPlayer): player is GameLeaderboardPlayer => {
    return 'games_played' in player && !('total_games_played' in player);
  };

  // 简化的数据加载
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 串行加载以避免竞态条件
      // 1. 先加载游戏列表
      const gamesData = await getAvailableGamesForLeaderboard();
      setAvailableGames(gamesData.games);

      // 2. 然后加载排行榜数据
      const leaderboardData = await getLeaderboard({ 
        limit: 50,
        gameCode: selectedGame === 'all' ? undefined : selectedGame 
      });
      
      const leaderboard = (leaderboardData as any).leaderboard || leaderboardData;
      setLeaderboard(Array.isArray(leaderboard) ? leaderboard : []);

      // 3. 最后加载等级分布（只在第一次加载时）
      if (!levelDistribution) {
        const distributionData = await getLevelDistribution();
        if (distributionData && (distributionData as any).distribution) {
          setLevelDistribution(distributionData as LevelDistribution);
        }
      }

    } catch (err: any) {
      console.error('Failed to load leaderboard data:', err);
      setError(err.message || '加载排行榜数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据加载
  useEffect(() => {
    loadData();
  }, []);

  // 游戏选择变化时重新加载排行榜
  useEffect(() => {
    if (availableGames.length > 0) {
      loadData();
    }
  }, [selectedGame]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeroSection
          title="游戏标准分排行榜"
          subtitle="本分数与评级根据往年表现计算，仅供参考。切换游戏查看不同项目的表现。"
        />
        <section className="section-shell">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card text-center p-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground">正在加载排行榜...</h3>
              <p className="text-muted-foreground">请稍候</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <HeroSection
          title="游戏标准分排行榜"
          subtitle="本分数与评级根据往年表现计算，仅供参考。切换游戏查看不同项目的表现。"
        />
        <section className="section-shell">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card border border-destructive/40 text-destructive p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="font-medium">{error}</p>
              </div>
              <Button onClick={loadData} variant="outline">
                重新加载
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const currentGameName = selectedGame === 'all' 
    ? '综合排行' 
    : availableGames.find(g => g.code === selectedGame)?.name || selectedGame;

  return (
    <div className="min-h-screen">
      <HeroSection
        title="游戏标准分排行榜"
        subtitle="本分数与评级根据往年表现计算，仅供参考。切换游戏查看不同项目的表现。"
      >
        <span>筛选游戏：</span>
        <Select value={selectedGame} onValueChange={setSelectedGame}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择游戏" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">综合排行</SelectItem>
            {availableGames.map((game) => (
              <SelectItem key={game.code} value={game.code}>
                {game.name} ({game.unique_players}人)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </HeroSection>

      <section className="section-shell">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* 等级分布统计 */}
            <div className="xl:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* 等级分布图表 */}
                {levelDistribution && (
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        等级分布
                      </CardTitle>
                      <CardDescription>
                        共 {levelDistribution.total_users} 名玩家
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(levelDistribution.distribution)
                        .sort(([a], [b]) => {
                          const order = ['S', 'A', 'B', 'C', 'D'];
                          return order.indexOf(a) - order.indexOf(b);
                        })
                        .map(([level, data]) => {
                          const style = getLevelStyle(level);
                          return (
                            <div key={level} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full ${style.bgColor} flex items-center justify-center text-white font-bold text-sm`}>
                                    {level}
                                  </div>
                                  <span className="font-medium">{level} 级</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold">{data.count}</div>
                                  <div className="text-xs text-muted-foreground">{data.percentage}%</div>
                                </div>
                              </div>
                              <Progress value={data.percentage} className="h-2" />
                            </div>
                          );
                        })}
                    </CardContent>
                  </Card>
                )}

                {/* 当前筛选信息 */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg">筛选信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">当前排行榜</span>
                        <Badge variant="outline">{currentGameName}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">显示人数</span>
                        <span className="font-medium">{leaderboard.length}</span>
                      </div>
                      {selectedGame !== 'all' && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">参与人数</span>
                          <span className="font-medium">
                            {availableGames.find(g => g.code === selectedGame)?.unique_players || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 排行榜主体 */}
            <div className="xl:col-span-3">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {currentGameName}
              </h2>

              {leaderboard.length === 0 ? (
                <Card className="glass">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">暂无排行榜数据</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 whitespace-nowrap">排名</TableHead>
                          <TableHead className="whitespace-nowrap">玩家</TableHead>
                          <TableHead className="whitespace-nowrap">等级</TableHead>
                          <TableHead className="text-right whitespace-nowrap">标准分</TableHead>
                          <TableHead className="text-right whitespace-nowrap">游戏数</TableHead>
                          {selectedGame !== 'all' && (
                            <TableHead className="text-right whitespace-nowrap">原始分</TableHead>
                          )}
                          {selectedGame === 'all' && (
                            <TableHead className="whitespace-nowrap">最佳游戏</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {leaderboard.map((player) => {
                        const levelStyle = getLevelStyle(player.game_level);
                        const medal = getRankMedal(player.rank);
                        
                        return (
                          <TableRow key={player.user_id} className={player.rank <= 3 ? 'bg-muted/30' : ''}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold min-w-[24px]">{player.rank}</span>
                                {medal && <span className="text-xl">{medal}</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar
                                  username={player.nickname}
                                  userId={player.user_id}
                                  size={40}
                                  className="rounded-full"
                                  fallbackClassName="rounded-full bg-primary/20"
                                  fallbackLetter={player.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                />
                                <div>
                                  <Link 
                                    href={`/player/${player.user_id}`}
                                    className="font-medium hover:text-primary transition-colors"
                                  >
                                    {player.display_name || player.nickname}
                                  </Link>
                                  {player.display_name && (
                                    <p className="text-xs text-muted-foreground">@{player.nickname}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full ${levelStyle.bgColor} flex items-center justify-center text-white font-bold text-sm`}>
                                  {player.game_level}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{player.game_level} 级</div>
                                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${levelStyle.bgColor.replace('bg-gradient-to-r', 'bg-gradient-to-r')}`}
                                      style={{ width: `${player.level_progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {player.average_standard_score}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                总分: {player.total_standard_score}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-medium">
                                {selectedGame === 'all' 
                                  ? (isGlobalPlayer(player) ? player.total_games_played : 0)
                                  : (isGamePlayer(player) ? player.games_played : 0)
                                }
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedGame === 'all' 
                                  ? `${isGlobalPlayer(player) ? player.game_count : 0}种游戏` 
                                  : '场次'
                                }
                              </div>
                            </TableCell>
                            {selectedGame !== 'all' && (
                              <TableCell className="text-right">
                                <div className="font-medium">
                                  {isGamePlayer(player) ? player.total_raw_score?.toLocaleString() || 0 : 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  平均: {isGamePlayer(player) ? player.average_raw_score || 0 : 0}
                                </div>
                              </TableCell>
                            )}
                            {selectedGame === 'all' && isGlobalPlayer(player) && player.best_game && (
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium">{player.best_game.game_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {player.best_game.average_standard_score} 分 · {player.best_game.games_played} 场
                                  </div>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center pt-12">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-2xl glass card-hover border-primary/20 hover:border-primary/40 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
