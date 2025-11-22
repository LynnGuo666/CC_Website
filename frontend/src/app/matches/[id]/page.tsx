import { getMatchById, Match, getMatchGames, MatchGame, getMatchGameScores, getGameById } from '@/services/matchService';
import { getMatchTeams, MatchTeam } from '@/services/matchTeamService';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FloatingActionButton } from "@/components/floating-action-button";
import { API_BASE_URL } from '@/config/env';


// Function to get status badge styling
function getStatusBadge(status: string) {
  switch (status) {
    case 'preparing':
      return <Badge variant="secondary">筹办中</Badge>;
    case 'ongoing':
      return <Badge variant="default" className="bg-blue-500">进行中</Badge>;
    case 'finished':
      return <Badge variant="default" className="bg-green-500">已结束</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">已取消</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// Function to get medal emoji for ranking
function getMedal(rank: number): string {
  switch (rank) {
    case 1: return '🏆';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}

type MatchDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  let match: Match | null = null;
  let teams: MatchTeam[] = [];
  let matchGames: any[] = []; // 包含游戏和分数信息的完整数据
  let error: string | null = null;
  let teamStats: MatchTeam[] = [];

  try {
    const { id } = await params;
    const matchId = parseInt(id, 10);
    if (isNaN(matchId)) {
      throw new Error('无效的赛事ID。');
    }


    // 优化：使用新的完整数据API，一次请求获取所有数据
    const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/full`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('获取比赛数据失败');
    }

    const fullData = await response.json();

    // 解构数据
    match = fullData.match;
    teams = fullData.teams;
    matchGames = fullData.games;

    // 直接使用从后端获取的、已排序的队伍数据
    teamStats = teams.sort((a, b) => (a.team_rank || Infinity) - (b.team_rank || Infinity));
  } catch (e: any) {
    console.error(e);
    error = e.message || '加载赛事详情失败。';
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
        <Link href="/matches" className="text-primary hover:underline mt-4 inline-block">
          ← 返回赛事列表
        </Link>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="container mx-auto p-4">
        <p className="text-muted-foreground">未找到该赛事。</p>
        <Link href="/matches" className="text-primary hover:underline mt-4 inline-block">
          ← 返回赛事列表
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div
          aria-hidden="true"
          className="refraction-blob -top-1/2 -left-1/2 w-full h-full opacity-80"
        ></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8">
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                  {match.name}
                </h1>
                {getStatusBadge(match.status)}
              </div>

              {match.description && (
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 max-w-3xl">
                  {match.description}
                </p>
              )}

              {/* Match Info - Small Tags */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {teams.length} 支队伍
                </Badge>

                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {matchGames.length} 个项目
                </Badge>

                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {matchGames.reduce((total, game) => total + game.scores.length, 0)} 条记录
                </Badge>

                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  最高 {teamStats[0]?.total_score || 0} 分
                </Badge>

                {/* Champion Badge */}
                {(match.winning_team_id || (match.status === 'finished' && teamStats.length > 0)) && (
                  <Badge variant="default" className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    总冠军: {
                      match.winning_team_id
                        ? (teams.find(t => t.id === match.winning_team_id)?.name || '未知队伍')
                        : (teamStats[0]?.name || '未知队伍')
                    }
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons - Live view button removed */}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Leaderboard */}
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  积分榜
                </h2>

                <Card className="glass">
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {teamStats.map((team, index) => (
                        <div key={team.id} className={`p-4 ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-l-4 border-yellow-400' : index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-l-4 border-gray-400' : index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-l-4 border-orange-400' : 'hover:bg-muted/50 transition-colors'} ${index < teamStats.length - 1 ? 'border-b' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-muted-foreground min-w-[24px]">
                                  {index + 1}
                                </span>
                                <span className="text-xl">{getMedal(index + 1)}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-white/50 shadow-sm"
                                  style={{ backgroundColor: team.color || '#6b7280' }}
                                ></div>
                                <div>
                                  <h3 className="font-semibold text-sm">{team.name}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {team.games_played} 场比赛
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{team.total_score}</div>
                              <div className="text-xs text-muted-foreground">总积分</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>

            {/* Games Detail */}
            <div className="xl:col-span-2 space-y-8">
              <h2 className="text-2xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                赛程详情
              </h2>


              {matchGames.map((game, index) => {
                const gameTeamScores = new Map<number, { name: string; color: string | null; total: number; players: Array<{ name: string; score: number }> }>();

                // Calculate team totals for this game
                game.scores.forEach((score: any) => {
                  const teamId = score.team_id;
                  const team = teams.find(t => t.id === teamId);

                  if (!gameTeamScores.has(teamId)) {
                    gameTeamScores.set(teamId, {
                      name: team?.name || `队伍 ${teamId}`,
                      color: team?.color || '#6b7280',
                      total: 0,
                      players: []
                    });
                  }
                  const teamData = gameTeamScores.get(teamId)!;
                  teamData.total += score.points;
                  teamData.players.push({
                    name: score.user?.nickname || `用户 ${score.user_id}`,
                    score: score.points
                  });
                });

                const sortedTeams = Array.from(gameTeamScores.values()).sort((a, b) => b.total - a.total);
                const maxScore = sortedTeams[0]?.total || 1;

                return (
                  <Card key={game.id} className="glass card-hover">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                              <span className="text-sm font-bold text-primary">{index + 1}</span>
                            </div>
                            <Link
                              href={`/games/${game.game.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {game.game.name}
                            </Link>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {game.game.description}
                            {game.structure_details?.multiplier && game.structure_details.multiplier !== 1.0 && (
                              <Badge variant="outline" className="ml-2">
                                {game.structure_details.multiplier}x 倍率
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {game.scores.length} 条记录
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Team Performance Chart */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">队伍表现</h4>
                        {sortedTeams.map((team, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-muted-foreground min-w-[16px]">
                                    {idx + 1}
                                  </span>
                                  <span className="text-lg">{idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}</span>
                                </div>
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: team.color || '#6b7280' }}
                                ></div>
                                <span className="font-medium">{team.name}</span>
                              </div>
                              <span className="font-bold text-lg">{team.total}</span>
                            </div>
                            <Progress
                              value={(team.total / maxScore) * 100}
                              className="h-2"
                            />
                            <div className="flex flex-wrap gap-2 text-xs">
                              {team.players.sort((a, b) => b.score - a.score).map((player, pidx) => (
                                <span key={pidx} className="px-2 py-1 rounded bg-muted text-muted-foreground">
                                  {player.name}: {player.score}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Individual Scores Table */}
                      {game.scores.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">个人得分排行</h4>
                          <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="whitespace-nowrap">排名</TableHead>
                                    <TableHead className="whitespace-nowrap">选手</TableHead>
                                    <TableHead className="whitespace-nowrap">队伍</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">得分</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {game.scores
                                    .sort((a: any, b: any) => b.points - a.points)
                                    .slice(0, 10)
                                    .map((score: any, idx: number) => {
                                      const team = teams.find(t => t.id === score.team_id);
                                      return (
                                        <TableRow key={score.id || idx}>
                                          <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                              <span>{idx + 1}</span>
                                              <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center space-x-3">
                                              <Avatar
                                                username={score.user?.nickname || `用户${score.user_id}`}
                                                userId={score.user_id}
                                                size={32}
                                                className="rounded-full"
                                                fallbackClassName="rounded-full bg-primary/20"
                                                fallbackLetter={score.user?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                              />
                                              <Link
                                                href={`/player/${score.user_id}`}
                                                className="font-medium hover:text-primary transition-colors"
                                              >
                                                {score.user?.nickname || `用户 ${score.user_id}`}
                                              </Link>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center space-x-2">
                                              <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: team?.color || '#6b7280' }}
                                              ></div>
                                              <span>{team?.name || `队伍 ${score.team_id}`}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <span className="font-mono font-bold text-lg">{score.points}</span>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center pt-12">
            <Link
              href="/matches"
              className="inline-flex items-center px-6 py-3 rounded-2xl glass card-hover border-primary/20 hover:border-primary/40 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              返回赛事列表
            </Link>
          </div>
        </div>
      </section>

      <FloatingActionButton
        href={`/matches/${match.id}/events`}
        title="查看详细数据"
        icon={
          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
}
