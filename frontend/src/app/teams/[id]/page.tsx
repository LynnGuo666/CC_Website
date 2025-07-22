import { getMatchTeam, MatchTeam, getTeamMembers } from '@/services/matchTeamService';
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

type TeamDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  let team: MatchTeam | null = null;
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
        <Link href="/teams" className="text-primary hover:underline mt-4 inline-block">
          ← 返回队伍列表
        </Link>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="container mx-auto p-4">
        <p className="text-muted-foreground">未找到该队伍。</p>
        <Link href="/teams" className="text-primary hover:underline mt-4 inline-block">
          ← 返回队伍列表
        </Link>
      </main>
    );
  }

  const currentMembers = members.filter((m: any) => m.role !== 'historical');
  const historicalMembers = members.filter((m: any) => m.role === 'historical');

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center space-x-8 mb-6">
            <div
              className="w-32 h-32 rounded-2xl border-4 border-white/20 shadow-2xl glass flex items-center justify-center"
              style={{ backgroundColor: team.color || '#3b82f6' }}
            >
              <span className="text-4xl font-bold text-white">
                {team.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {team.name}
              </h1>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  队伍ID: {team.id}
                </Badge>
                {team.color && (
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white/50"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <span className="text-muted-foreground">队伍颜色</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl font-bold text-primary mb-2">{currentMembers.length}</div>
              <div className="text-muted-foreground">当前成员</div>
            </div>
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl font-bold text-accent mb-2">{historicalMembers.length}</div>
              <div className="text-muted-foreground">历史成员</div>
            </div>
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl font-bold text-orange-500 mb-2">{currentMembers.length + historicalMembers.length}</div>
              <div className="text-muted-foreground">总成员数</div>
            </div>
          </div>

          {/* Current Members */}
          {currentMembers.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center mb-8">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3"></div>
                <h2 className="text-2xl font-bold">当前队员</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentMembers.map((membership: any) => {
                  const member = membership.user;
                  return (
                  <Link key={membership.id} href={`/players/${member.id}`} className="group">
                    <Card className="h-full glass card-hover border-primary/10 hover:border-primary/30 transition-all duration-300">
                      <CardHeader className="text-center">
                        <Avatar
                          username={member.nickname}
                          userId={member.id}
                          size={64}
                          className="rounded-full mx-auto mb-3"
                          fallbackClassName="rounded-full bg-primary/20"
                          fallbackLetter={member.nickname?.charAt(0)?.toUpperCase()}
                        />
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {member.nickname}
                        </CardTitle>
                        {member.display_name && (
                          <CardDescription>
                            {member.display_name}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="text-center space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">总积分</span>
                          <span className="font-semibold text-primary">{member.total_points || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">角色</span>
                          <span className="font-semibold text-blue-500">
                            {membership.role === 'main' ? '主力' : 
                             membership.role === 'substitute' ? '替补' : 
                             membership.role === 'captain' ? '队长' : '队员'}
                          </span>
                        </div>
                        <Badge variant="outline" className="w-full justify-center">
                          现役队员
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );})}
              </div>
            </div>
          )}

          {/* Historical Members */}
          {historicalMembers.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">历史队员</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {historicalMembers.map((membership: any) => {
                  const member = membership.user;
                  return (
                  <Link key={membership.id} href={`/players/${member.id}`} className="group">
                    <Card className="h-full glass card-hover border-muted/20 hover:border-muted/40 transition-all duration-300 opacity-80">
                      <CardHeader className="text-center">
                        <Avatar
                          username={member.nickname}
                          userId={member.id}
                          size={64}
                          className="rounded-full mx-auto mb-3"
                          fallbackClassName="rounded-full bg-muted/20"
                          fallbackLetter={member.nickname?.charAt(0)?.toUpperCase()}
                        />
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {member.nickname}
                        </CardTitle>
                        {member.display_name && (
                          <CardDescription>
                            {member.display_name}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="text-center space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">总积分</span>
                          <span className="font-semibold">{member.total_points || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">角色</span>
                          <span className="font-semibold">
                            {membership.role === 'main' ? '主力' : 
                             membership.role === 'substitute' ? '替补' : 
                             membership.role === 'captain' ? '队长' : '队员'}
                          </span>
                        </div>
                        <Badge variant="secondary" className="w-full justify-center">
                          历史队员
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );})}
              </div>
            </div>
          )}

          {/* Empty State */}
          {currentMembers.length === 0 && historicalMembers.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">暂无队员</h3>
              <p className="text-muted-foreground mb-6">该队伍目前没有成员记录</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center">
            <Link 
              href="/teams"
              className="inline-flex items-center px-6 py-3 rounded-2xl glass card-hover border-primary/20 hover:border-primary/40 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              返回队伍列表
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}