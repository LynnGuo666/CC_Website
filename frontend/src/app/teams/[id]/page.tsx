import { getMatchTeam, MatchTeamWithMatch, getTeamMembers } from '@/services/matchTeamService';
import { getUserById } from '@/services/userService';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Users, Trophy, Star, ArrowLeft, UserPlus, Crown } from 'lucide-react';

type TeamDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  let team: MatchTeamWithMatch | null = null;
  let members: any[] = [];
  let error: string | null = null;

  try {
    const { id } = await params;
    const teamId = parseInt(id, 10);
    if (isNaN(teamId)) {
      throw new Error('无效的队伍ID。');
    }
    
    // Get team details and members
    team = await getMatchTeam(teamId);
    const rawMembers = await getTeamMembers(teamId);
    
    // Enrich member data with user information
    members = await Promise.all(
      rawMembers.map(async (member: any) => {
        try {
          const user = await getUserById(member.user_id);
          return {
            ...member,
            user: user,
          };
        } catch (err) {
          console.warn(`Failed to fetch user ${member.user_id}:`, err);
          return {
            ...member,
            user: {
              id: member.user_id,
              nickname: `用户 ${member.user_id}`,
              display_name: null,
              total_points: 0,
            },
          };
        }
      })
    );
  } catch (e: any) {
    console.error(e);
    error = e.message || '加载队伍详情失败。';
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">加载失败</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
              <Link 
                href="/teams" 
                className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回队伍列表</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="p-8 rounded-3xl bg-muted/30 backdrop-blur-sm border border-muted/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">队伍未找到</h3>
              <p className="text-muted-foreground text-sm mb-6">指定的队伍不存在或已被删除</p>
              <Link 
                href="/teams"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回队伍列表</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentMembers = members; // 显示所有成员

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Modern Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link 
              href="/teams"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>返回队伍列表</span>
            </Link>

            {/* Match Info Banner */}
            <div className="mb-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary">所属比赛</h3>
                    <p className="text-sm text-muted-foreground">{team.match_name}</p>
                  </div>
                </div>
                <Badge 
                  variant={team.match_status === 'ongoing' ? 'default' : team.match_status === 'finished' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {team.match_status === 'preparing' ? '筹备中' : 
                   team.match_status === 'ongoing' ? '进行中' : 
                   team.match_status === 'finished' ? '已结束' : '已取消'}
                </Badge>
              </div>
            </div>

            {/* Team Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Team Avatar */}
              <div className="relative">
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-3xl shadow-2xl border-4 border-white/20 backdrop-blur-sm flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: team.color || '#3b82f6' }}
                >
                  <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                    {team.name.charAt(0)}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                </div>
                {team.color && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-background shadow-lg" 
                       style={{ backgroundColor: team.color }}>
                  </div>
                )}
              </div>

              {/* Team Info */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {team.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full">
                    ID: {team.id}
                  </Badge>
                  {team.total_score !== undefined && (
                    <Badge variant="outline" className="text-sm px-3 py-1 rounded-full">
                      <Trophy className="w-3 h-3 mr-1" />
                      {team.total_score} 分
                    </Badge>
                  )}
                  {team.games_played !== undefined && (
                    <Badge variant="outline" className="text-sm px-3 py-1 rounded-full">
                      <Star className="w-3 h-3 mr-1" />
                      {team.games_played} 场比赛
                    </Badge>
                  )}
                </div>
                {team.color && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div 
                      className="w-4 h-4 rounded-full border border-muted-foreground/20"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <span>队伍主题色</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* Current Members */}
          {currentMembers.length > 0 && (
            <div className="mb-16 max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h2 className="text-2xl font-bold">队员列表</h2>
                  <Badge variant="secondary" className="ml-2">{currentMembers.length}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentMembers.map((membership: any) => {
                  const member = membership.user;
                  return (
                    <Link key={membership.id} href={`/players/${member.id}`} className="group">
                      <Card className="h-full bg-card/50 backdrop-blur-sm border border-muted/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden">
                        <CardHeader className="text-center pb-4">
                          <Avatar
                            username={member.nickname}
                            userId={member.id}
                            size={56}
                            className="rounded-2xl mx-auto mb-3 ring-2 ring-background group-hover:ring-primary/30 transition-all"
                            fallbackClassName="rounded-2xl bg-primary/20 group-hover:bg-primary/30 transition-colors"
                            fallbackLetter={member.nickname?.charAt(0)?.toUpperCase()}
                          />
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                            {member.nickname}
                          </CardTitle>
                          {member.display_name && (
                            <CardDescription className="text-xs line-clamp-1">
                              {member.display_name}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">总积分</span>
                            <span className="font-semibold text-primary">{member.total_points || 0}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {currentMembers.length === 0 && (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="p-8 rounded-3xl bg-muted/20 backdrop-blur-sm border border-muted/30">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/30 flex items-center justify-center">
                  <UserPlus className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">暂无队员</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  该队伍目前没有成员记录，可能是新建的队伍或者数据尚未同步
                </p>
                <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-primary/50 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center pt-12">
            <Link 
              href="/teams"
              className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-muted/50 hover:border-primary/40 hover:bg-card/70 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">返回队伍列表</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}