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
            <div className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-2xl glass flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <span className="text-4xl font-bold text-white">
                {player.nickname?.charAt(0)?.toUpperCase()}
              </span>
            </div>
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
          {/* Player Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl font-bold text-primary mb-2">{player.total_points}</div>
              <div className="text-muted-foreground">总积分</div>
            </div>
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl font-bold text-green-500 mb-2">{player.total_wins}</div>
              <div className="text-muted-foreground">总获胜次数</div>
            </div>
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl font-bold text-accent mb-2">{player.total_matches}</div>
              <div className="text-muted-foreground">参与比赛</div>
            </div>
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl font-bold text-orange-500 mb-2">{player.win_rate}%</div>
              <div className="text-muted-foreground">胜率</div>
            </div>
          </div>

          {/* Game Performance */}
          {Object.keys(gameScores).length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">游戏表现</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(gameScores).map(([gameName, stats]: [string, any]) => (
                  <Card key={gameName} className="glass card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{gameName}</span>
                        <Badge variant="secondary">
                          {stats.games_played} 场
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        总得分: {stats.total_score} | 平均分: {Math.round(stats.total_score / stats.games_played)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>表现评级</span>
                          <span className="font-semibold">
                            {stats.total_score > 1000 ? 'S' : stats.total_score > 500 ? 'A' : stats.total_score > 200 ? 'B' : 'C'}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((stats.total_score / 2000) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                        <TableCell className="font-medium">{match.match_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{match.team_name}</Badge>
                        </TableCell>
                        <TableCell>{match.games_played}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">{match.total_points}</span>
                        </TableCell>
                        <TableCell>
                          {Math.round(match.total_points / match.games_played)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Team */}
              {currentTeam && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3"></div>
                    当前队伍
                  </h3>
                  <Card className="glass card-hover border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: currentTeam.color }}
                        >
                          {currentTeam.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{currentTeam.name}</h4>
                          <Badge variant="outline" className="mt-1">现役</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Historical Teams */}
              {historicalTeams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">历史队伍</h3>
                  <div className="space-y-3">
                    {historicalTeams.map((team: any, index: number) => (
                      <Card key={index} className="glass card-hover border-muted/20 opacity-80">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: team.color }}
                            >
                              {team.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-medium">{team.name}</h4>
                              <Badge variant="secondary" className="text-xs">历史</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">性能指标</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">平均得分</CardTitle>
                  <CardDescription>每场比赛平均获得积分</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{player.average_score}</div>
                </CardContent>
              </Card>
              
              <Card className="glass card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">活跃度</CardTitle>
                  <CardDescription>最后活跃时间</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {new Date(player.last_active).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">注册时间</CardTitle>
                  <CardDescription>首次参与时间</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {new Date(player.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
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