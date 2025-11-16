import { getUserById, getUserStats, getUserTeamHistory, User, UserStats } from '@/services/userService';
import Link from 'next/link';
import type { CSSProperties } from 'react';
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
import ScoreTimeline from '@/components/score-timeline';
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
  const scoreTimeline = playerStats?.score_timeline || [];
  const scoreTimelineByGame = playerStats?.score_timeline_by_game || {};
  const currentTeam = teamHistory?.current_team;
  const historicalTeams = teamHistory?.historical_teams || [];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div
          aria-hidden="true"
          className="refraction-blob -top-1/2 -left-1/2 w-full h-full opacity-80"
          style={
            {
              '--blob-primary': 'rgba(0, 122, 255, 0.32)',
              '--blob-secondary': 'rgba(48, 209, 88, 0.26)',
            } as CSSProperties
          }
        ></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-6">
            <Avatar
              username={player.nickname}
              userId={player.id}
              size={128}
              className="rounded-2xl border-4 border-white/20 shadow-2xl flex-shrink-0"
              fallbackClassName="rounded-2xl"
              fallbackLetter={player.nickname?.charAt(0)?.toUpperCase()}
            />
            <div className="flex-1 text-center sm:text-left w-full">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                {player.nickname}
              </h1>
              {player.display_name && (
                <p className="text-lg sm:text-xl text-muted-foreground mb-3 sm:mb-4">{player.display_name}</p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4">
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

          {/* Game Performance & Score Timeline (move to top) */}
          {(scoreTimeline.length > 0 || Object.keys(scoreTimelineByGame).length > 0) && (
            <div className="mb-16">
              <ScoreTimeline
                scoreTimeline={scoreTimeline}
                scoreTimelineByGame={scoreTimelineByGame}
                gameScores={gameScores}
              />
            </div>
          )}

          {/* Match History */}
          {matchHistory.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center mb-8 gap-3">
                <div className="p-2 rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h1.5l.5-1h8l.5 1H16a1 1 0 011 1v1H3V4zm0 3h14v11a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm3 2v2h2V9H6zm0 3v2h2v-2H6zm3-3v2h2V9H9zm0 3v2h2v-2H9zm3-3v2h2V9h-2zm0 3v2h2v-2h-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">比赛履历</h2>
              </div>
              <Card className="glass overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">赛事名称</TableHead>
                        <TableHead className="whitespace-nowrap">所属队伍</TableHead>
                        <TableHead className="whitespace-nowrap">参与游戏</TableHead>
                        <TableHead className="whitespace-nowrap">总得分</TableHead>
                        <TableHead className="whitespace-nowrap">平均得分</TableHead>
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
                </div>
              </Card>
            </div>
          )}

          {/* Team History */}
            <div className="mb-16">
              <div className="flex items-center mb-8 gap-3">
                <div className="p-2 rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c2.21 0 4-1.79 4-4S14.21 0 12 0 8 1.79 8 4s1.79 4 4 4zm0 2c-3.313 0-6 2.239-6 5v3h12v-3c0-2.761-2.687-5-6-5zM4 18h16v4H4z" transform="translate(0 2)" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">选手履历</h2>
              </div>
            
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

            {/* Historical Teams - Grid Layout */}
            {historicalTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  历史队伍
                  <Badge variant="secondary" className="ml-3 text-xs">
                    {historicalTeams.length}
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historicalTeams.map((team: any, index: number) => (
                    <Link key={index} href={`/teams/${team.id}`}>
                      <Card className="glass-card h-full cursor-pointer transition-all duration-300 hover:shadow-lg group relative overflow-hidden">
                        {/* 背景装饰 */}
                        <div
                          aria-hidden="true"
                          className="refraction-blob top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                          style={
                            {
                              '--blob-primary': `${team.color}33`,
                              '--blob-secondary': `${team.color}1f`,
                            } as CSSProperties
                          }
                        ></div>

                        <CardContent className="p-5 relative z-10">
                          <div className="flex items-start space-x-4">
                            {/* 队伍图标 */}
                            <div className="relative flex-shrink-0">
                              <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                style={{ backgroundColor: team.color }}
                              >
                                {team.name.charAt(0)}
                              </div>
                              {/* 历史标记 */}
                              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-muted/90 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>

                            {/* 队伍信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {team.name}
                                </h4>
                                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                              </div>

                              {/* 赛事信息 */}
                              {team.match_name && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                  <span className="line-clamp-2 leading-relaxed">{team.match_name}</span>
                                </div>
                              )}
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
