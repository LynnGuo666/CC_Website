import { getUserById, getUserStats, getUserTeamHistory, User, UserStats } from '@/services/userService';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import ScoreTimeline from '@/components/score-timeline';
import PlayerRadarChart from '@/components/player-radar-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Archive,
  Users,
  Check,
  ArrowRight,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { getGameLevelStyle } from '@/lib/status';
import { ErrorState, BackLink } from '@/components/ui/state-blocks';

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

    // 雷达图数据由 PlayerRadarChart 客户端组件自行加载，此处不再预取

  } catch (e: any) {
    console.error(e);
    error = e.message || '加载选手详情失败。';
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <ErrorState message={error} backHref="/players" backLabel="返回选手列表" />
      </main>
    );
  }

  if (!player) {
    return (
      <main className="container mx-auto p-4">
        <p className="text-muted-foreground">未找到该选手。</p>
        <BackLink href="/players" label="返回选手列表" className="mt-4" />
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
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
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
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">

            {/* Left: Avatar & Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 flex-1 w-full lg:w-auto">
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
                      className={`text-lg px-3 py-2 font-bold ${getGameLevelStyle(player.game_level).text} ${getGameLevelStyle(player.game_level).border} ${getGameLevelStyle(player.game_level).bg}`}
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

            {/* Right: Radar Chart */}
            <div className="w-full max-w-md lg:w-[400px] flex-shrink-0 mt-8 lg:mt-0">
              <PlayerRadarChart
                userId={player.id}
                userMatches={matchHistory.map((m: any) => ({ id: m.match_id, name: m.match_name }))}
              />
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
                  <Archive className="w-6 h-6" strokeWidth={2} />
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
                <Users className="w-6 h-6" strokeWidth={2} />
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
                            <Check className="w-3 h-3 text-white" strokeWidth={2} />
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
                              <BadgeCheck className="w-4 h-4 mr-2 flex-shrink-0" strokeWidth={2} />
                              <span>参与赛事: {currentTeam.match_name}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
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
                  <Clock className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={2} />
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
                                <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                              </div>
                            </div>

                            {/* 队伍信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {team.name}
                                </h4>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                              </div>

                              {/* 赛事信息 */}
                              {team.match_name && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <BadgeCheck className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
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
            <BackLink href="/players" label="返回选手列表" />
          </div>
        </div>
      </section>
    </div>
  );
}
