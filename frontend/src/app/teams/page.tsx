import Link from 'next/link';
import { getMatches } from '@/services/matchService';
import { getMatchTeams, getTeamMemberCounts } from '@/services/matchTeamService';

export default async function TeamsPage() {
  let matches = [];
  let allTeams = [];
  let teamsByMatch: Record<string, any[]> = {};
  let error: string | null = null;

  try {
    // 获取所有比赛
    matches = await getMatches();
    
    // 获取每个比赛的队伍
    for (const match of matches) {
      const teams = await getMatchTeams(match.id);
      const teamsWithMatch = teams.map(team => ({ ...team, match_name: match.name, match_id: match.id }));
      allTeams.push(...teamsWithMatch);
      teamsByMatch[match.name] = teamsWithMatch;
    }
  } catch (e) {
    console.error(e);
    error = '无法加载队伍列表。后端服务是否正在运行？';
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-12 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            参赛队伍
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-8 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 glass">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-destructive font-medium">{error}</p>
              </div>
            </div>
          )}

          {!error && (
            <>
              {/* Teams by Match */}
              <div className="space-y-12">
                {matches.map((match: any) => {
                  const matchTeams = teamsByMatch[match.name] || [];
                  return (
                    <div key={match.id} className="space-y-6">
                      {/* Match Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{match.name}</h2>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {matchTeams.length} 支队伍
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {match.status === 'preparing' ? '筹办中' : 
                               match.status === 'ongoing' ? '进行中' : 
                               match.status === 'finished' ? '已结束' : '未知状态'}
                            </span>
                          </div>
                        </div>
                        <Link 
                          href={`/matches/${match.id}`}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          查看比赛详情 →
                        </Link>
                      </div>

                      {/* Teams Grid */}
                      {matchTeams.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                          {matchTeams.map((team) => (
                            <Link href={`/teams/${team.id}`} key={team.id} className="group">
                              <div className="block p-4 glass card-hover rounded-2xl text-center border-primary/10 hover:border-primary/30 transition-all duration-300">
                                <div
                                  className="w-16 h-16 rounded-xl mx-auto mb-3 border-2 border-white/20 shadow-lg flex items-center justify-center"
                                  style={{ backgroundColor: team.color || '#8B5CF6' }}
                                >
                                  <span className="text-white font-bold text-sm">
                                    {team.name.charAt(0)}
                                  </span>
                                </div>
                                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                  {team.name}
                                </h3>
                                <div className="space-y-1">
                                  <p className="text-xs text-accent">总分: {team.total_score || 0}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-muted/10 rounded-2xl">
                          <svg className="w-12 h-12 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                          <h3 className="text-lg font-medium mb-2">该比赛暂无队伍</h3>
                          <p className="text-muted-foreground">尚未创建任何队伍参与此比赛</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {matches.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">暂无比赛</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    还没有创建任何比赛，请等待管理员添加新的比赛项目！
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}