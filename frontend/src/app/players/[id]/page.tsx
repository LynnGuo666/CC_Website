import { getUserById, getUserStats, getUserTeamHistory, User, UserStats } from '@/services/userService';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PlayerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  let player: User | null = null;
  let playerStats: UserStats | null = null;
  let teamHistory: any = null;
  let error: string | null = null;

  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      throw new Error('无效的选手ID。');
    }
    
    // 获取用户基本信息
    player = await getUserById(playerId);
    
    // 获取用户统计信息
    try {
      playerStats = await getUserStats(playerId);
    } catch (statsError) {
      console.warn('Failed to load player stats:', statsError);
    }
    
    // 获取队伍历史
    try {
      teamHistory = await getUserTeamHistory(playerId);
    } catch (teamError) {
      console.warn('Failed to load team history:', teamError);
    }
    
  } catch (e: any) {
    console.error(e);
    error = e.message || '加载选手详情失败。';
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 glass">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-destructive font-medium">{error}</p>
          </div>
        </div>
        <Link href="/players" className="text-primary hover:underline mt-4 inline-block">
          ← 返回选手列表
        </Link>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="container mx-auto p-4">
        <p className="text-muted-foreground">未找到该选手。</p>
        <Link href="/players" className="text-primary hover:underline mt-4 inline-block">
          ← 返回选手列表
        </Link>
      </main>
    );
  }

  const gameScores = playerStats?.game_scores || {};
  const matchHistory = playerStats?.match_history || [];
  const currentTeam = teamHistory?.current_team;
  const historicalTeams = teamHistory?.historical_teams || [];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center space-x-8 mb-6">
            <Avatar
              username={player.nickname}
              userId={player.id}
              size={128}
              className="rounded-2xl border-4 border-white/20 shadow-2xl"
              fallbackClassName="rounded-2xl"
              fallbackLetter={player.nickname?.charAt(0)?.toUpperCase()}
            />
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {player.nickname}
              </h1>
              {player.display_name && (
                <p className="text-xl text-muted-foreground mb-4">{player.display_name}</p>
              )}
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  ID: {player.id}
                </Badge>
                {player.game_level && (
                  <Badge 
                    variant="outline" 
                    className={`text-lg px-3 py-2 font-bold ${
                      player.game_level === 'S' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                      player.game_level === 'A' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                      player.game_level === 'B' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' :
                      player.game_level === 'C' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' :
                      'text-gray-500 border-gray-500/30 bg-gray-500/10'
                    }`}
                  >
                    综合等级{player.game_level}
                  </Badge>
                )}
                {player.source && (
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {player.source}
                  </Badge>
                )}
                {currentTeam && (
                  <Badge 
                    variant="outline" 
                    className="text-lg px-4 py-2"
                    style={{ borderColor: currentTeam.color, color: currentTeam.color }}
                  >
                    {currentTeam.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Game Performance - Enhanced Version */}
          {Object.keys(gameScores).length > 0 && (
            <div className="mb-16">
              <div className="flex items-center mb-8">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-2xl font-bold">游戏表现分析</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(gameScores)
                  .sort(([,a], [,b]) => ((b as any).average_standard_score || 0) - ((a as any).average_standard_score || 0)) // 按平均标准分排序
                  .map(([gameName, stats]: [string, any], index) => {
                    const avgScore = stats.games_played > 0 ? Math.round(stats.total_score / stats.games_played) : 0;
                    const avgStandardScore = stats.average_standard_score || 0;
                    const level = stats.level || 'D';
                    const levelProgress = stats.level_progress || 0;
                    
                    const rating = (() => {
                      if (level === 'S') return { grade: 'S', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', textColor: 'text-yellow-600' };
                      if (level === 'A') return { grade: 'A', color: 'bg-gradient-to-r from-green-400 to-green-600', textColor: 'text-green-600' };
                      if (level === 'B') return { grade: 'B', color: 'bg-gradient-to-r from-blue-400 to-blue-600', textColor: 'text-blue-600' };
                      if (level === 'C') return { grade: 'C', color: 'bg-gradient-to-r from-orange-400 to-orange-600', textColor: 'text-orange-600' };
                      return { grade: 'D', color: 'bg-gradient-to-r from-gray-400 to-gray-600', textColor: 'text-gray-600' };
                    })();
                    
                    // 使用后端提供的进度值
                    const progressValue = Math.min(Math.max(levelProgress, 0), 100);
                    
                    return (
                      <Card key={gameName} className={`glass card-hover relative overflow-hidden ${index === 0 ? 'ring-2 ring-primary/20' : ''}`}>
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2 flex items-center">
                                <span className="mr-2">{gameName}</span>
                                {index === 0 && (
                                  <Badge variant="outline" className="text-xs px-2 py-1 border-yellow-400 text-yellow-600">
                                    最佳
                                  </Badge>
                                )}
                              </CardTitle>
                              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  {stats.games_played} 场
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  {avgStandardScore.toFixed(1)} 标准分
                                </span>
                              </div>
                            </div>
                            
                            {/* 等级徽章 */}
                            <div className={`w-16 h-16 rounded-full ${rating.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                              {rating.grade}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* 技能进度条 */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-muted-foreground">技能等级</span>
                              <span className={`font-semibold ${rating.textColor}`}>{rating.grade} 级</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={progressValue} 
                                className="h-3"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-medium text-white mix-blend-difference">
                                  {progressValue.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Match History */}
          {matchHistory.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">比赛历史</h2>
              <Card className="glass">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>赛事名称</TableHead>
                      <TableHead>所属队伍</TableHead>
                      <TableHead>参与游戏</TableHead>
                      <TableHead>总得分</TableHead>
                      <TableHead>平均得分</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchHistory.map((match: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/matches/${match.match_id}`}
                            className="text-primary hover:underline cursor-pointer"
                          >
                            {match.match_name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{match.team_name}</Badge>
                        </TableCell>
                        <TableCell>{match.games_played}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">{match.total_points}</span>
                        </TableCell>
                        <TableCell>
                          {match.games_played > 0 ? Math.round(match.total_points / match.games_played) : 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Team History */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">队伍履历</h2>
            
            {/* Current Team - Full Width */}
            {currentTeam && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3"></div>
                  当前队伍
                </h3>
                <Link href={`/teams/${currentTeam.id}`}>
                  <Card className="glass card-hover border-primary/20 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-lg group">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div 
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: currentTeam.color }}
                          >
                            {currentTeam.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4 mb-2">
                            <h4 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{currentTeam.name}</h4>
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 font-medium">
                              现役队伍
                            </Badge>
                          </div>
                          {currentTeam.match_name && (
                            <p className="text-muted-foreground flex items-center">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span>参与赛事: {currentTeam.match_name}</span>
                            </p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                          <svg className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}

            {/* Historical Teams - Full Width */}
            {historicalTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  历史队伍
                </h3>
                <div className="space-y-3">
                  {historicalTeams.map((team: any, index: number) => (
                    <Link key={index} href={`/teams/${team.id}`}>
                      <Card className="glass card-hover border-border/40 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-md group">
                        <CardContent className="p-5">
                          <div className="flex items-center space-x-5">
                            <div className="relative">
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                                style={{ backgroundColor: team.color }}
                              >
                                {team.name.charAt(0)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center border-2 border-background">
                                <svg className="w-2.5 h-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-1">
                                <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">{team.name}</h4>
                                <Badge variant="secondary" className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground flex-shrink-0">
                                  历史
                                </Badge>
                              </div>
                              {team.match_name && (
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                  <span className="truncate">参与赛事: {team.match_name}</span>
                                </p>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <Link 
              href="/players"
              className="inline-flex items-center px-6 py-3 rounded-2xl glass card-hover border-primary/20 hover:border-primary/40 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              返回选手列表
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}