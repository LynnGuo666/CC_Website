'use client';

import { useState, useEffect } from 'react';
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
import { BarChart3, BadgeCheck, Inbox, Home } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-blocks";

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

  // 优化的数据加载：并行加载，避免重复请求
  const loadData = async (gameCode: string = 'all') => {
    try {
      setLoading(true);
      setError(null);

      // 并行加载所有数据（优化：减少等待时间）
      const [gamesData, leaderboardData, distributionData] = await Promise.all([
        getAvailableGamesForLeaderboard(),
        getLeaderboard({
          limit: 50,
          gameCode: gameCode === 'all' ? undefined : gameCode
        }),
        // 只在第一次加载时获取等级分布
        levelDistribution ? Promise.resolve(levelDistribution) : getLevelDistribution()
      ]);

      setAvailableGames(gamesData.games);

      const leaderboard = (leaderboardData as any).leaderboard || leaderboardData;
      setLeaderboard(Array.isArray(leaderboard) ? leaderboard : []);

      if (!levelDistribution && distributionData && (distributionData as any).distribution) {
        setLevelDistribution(distributionData as LevelDistribution);
      }

    } catch (err: any) {
      console.error('Failed to load leaderboard data:', err);
      setError(err.message || '加载排行榜数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据加载（只在组件挂载时执行一次）
  useEffect(() => {
    loadData(selectedGame);
  }, []);

  // 游戏选择变化时只重新加载排行榜（优化：避免重复加载游戏列表和等级分布）
  useEffect(() => {
    if (availableGames.length > 0) {
      const loadLeaderboardOnly = async () => {
        try {
          setLoading(true);
          setError(null);

          const leaderboardData = await getLeaderboard({
            limit: 50,
            gameCode: selectedGame === 'all' ? undefined : selectedGame
          });

          const leaderboard = (leaderboardData as any).leaderboard || leaderboardData;
          setLeaderboard(Array.isArray(leaderboard) ? leaderboard : []);

        } catch (err: any) {
          console.error('Failed to load leaderboard data:', err);
          setError(err.message || '加载排行榜数据失败');
        } finally {
          setLoading(false);
        }
      };

      loadLeaderboardOnly();
    }
  }, [selectedGame]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeroSection
          title="游戏标准分排行榜"
          subtitle="本分数与评级根据往年表现计算，仅供参考。切换游戏查看不同项目的表现。"
          className="pt-40 pb-20"
        />
        <section className="section-shell">
          <div className="max-w-7xl mx-auto">
            <LoadingState
              icon={<BarChart3 className="w-10 h-10 text-muted-foreground" strokeWidth={2} />}
              title="正在加载排行榜..."
              subtitle="请稍候"
            />
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
          className="pt-40 pb-20"
        />
        <section className="section-shell">
          <div className="max-w-7xl mx-auto">
            <ErrorState
              message={error}
              onRetry={() => loadData()}
            />
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
        className="pt-40 pb-20"
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
                        <BarChart3 className="w-5 h-5 mr-2 text-purple-500" strokeWidth={2} />
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
                <BadgeCheck className="w-6 h-6 mr-3 text-yellow-500" strokeWidth={2} />
                {currentGameName}
              </h2>

              {leaderboard.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="w-8 h-8 text-muted-foreground" strokeWidth={2} />}
                  title="暂无排行榜数据"
                />
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
                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${levelStyle.color.replace('text-', 'bg-')}`}
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
              <Home className="w-5 h-5 mr-2" strokeWidth={2} />
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
