import Link from 'next/link';
import { getMatches } from '@/services/matchService';
import { getMatchTeams } from '@/services/matchTeamService';

export default async function TeamsPage() {
  let matches = [];
  let allTeams = [];
  let error: string | null = null;

  try {
    // 获取所有比赛
    matches = await getMatches();
    
    // 获取每个比赛的队伍
    for (const match of matches) {
      const teams = await getMatchTeams(match.id);
      allTeams.push(...teams.map(team => ({ ...team, match_name: match.name })));
    }
  } catch (e) {
    console.error(e);
    error = '无法加载队伍列表。后端服务是否正在运行？';
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            参赛队伍
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            查看所有参赛队伍的详细信息和比赛表现
          </p>
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
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="text-center p-4 rounded-xl glass card-hover">
                  <div className="text-2xl font-bold text-primary mb-1">{matches.length}</div>
                  <div className="text-sm text-muted-foreground">总比赛数</div>
                </div>
                <div className="text-center p-4 rounded-xl glass card-hover">
                  <div className="text-2xl font-bold text-accent mb-1">{allTeams.length}</div>
                  <div className="text-sm text-muted-foreground">总队伍数</div>
                </div>
                <div className="text-center p-4 rounded-xl glass card-hover">
                  <div className="text-2xl font-bold text-secondary mb-1">{allTeams.reduce((sum, team) => sum + (team.memberships?.length || 0), 0)}</div>
                  <div className="text-sm text-muted-foreground">总选手数</div>
                </div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allTeams.length > 0 ? (
                  allTeams.map((team) => (
                    <Link href={`/teams/${team.id}`} key={`${team.match_id}-${team.id}`} className="group">
                      <div className="block p-4 glass card-hover rounded-2xl text-center border-primary/10 hover:border-primary/30 transition-all duration-300">
                        <div
                          className="w-16 h-16 rounded-xl mx-auto mb-3 border-2 border-white/20 shadow-lg flex items-center justify-center"
                          style={{ backgroundColor: team.color || '#8B5CF6' }}
                        >
                          <span className="text-white font-bold text-sm">
                            {team.name.charAt(0)}
                          </span>
                        </div>
                        <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {team.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">{team.match_name}</p>
                        <p className="text-xs text-accent mt-1">{team.memberships?.length || 0} 名队员</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">暂无队伍</h3>
                    <p className="text-muted-foreground">还没有注册的队伍，请先创建比赛并添加队伍</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}