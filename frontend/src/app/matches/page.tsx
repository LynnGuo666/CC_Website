import { getMatches, MatchList } from '@/services/matchService';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 比赛状态映射
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'preparing':
      return {
        text: '筹办中',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        dotColor: 'bg-yellow-500'
      };
    case 'ongoing':
      return {
        text: '进行中',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        dotColor: 'bg-green-500'
      };
    case 'finished':
      return {
        text: '已结束',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        dotColor: 'bg-gray-500'
      };
    case 'cancelled':
      return {
        text: '已取消',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        dotColor: 'bg-red-500'
      };
    default:
      return {
        text: '未知',
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
        dotColor: 'bg-gray-400'
      };
  }
};

export default async function MatchesPage() {
  let matches: MatchList[] = [];
  let error: string | null = null;

  try {
    matches = await getMatches();
  } catch (e) {
    error = '无法加载赛事列表。后端服务是否正在运行？';
  }

  // 按状态分组比赛
  const ongoingMatches = matches.filter(m => m.status === 'ongoing');
  const preparingMatches = matches.filter(m => m.status === 'preparing');
  const finishedMatches = matches.filter(m => m.status === 'finished');
  
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MC 小游戏竞技赛事
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            探索精彩的Minecraft小游戏比赛，观看多样化的游戏赛程和选手表现
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="text-center p-5 rounded-xl glass card-hover">
                  <div className="text-2xl font-bold text-primary mb-1">{matches.length}</div>
                  <div className="text-sm text-muted-foreground">总赛事数</div>
                </div>
                <div className="text-center p-5 rounded-xl glass card-hover">
                  <div className="text-2xl font-bold text-green-500 mb-1">{ongoingMatches.length}</div>
                  <div className="text-sm text-muted-foreground">进行中</div>
                </div>
                <div className="text-center p-5 rounded-xl glass card-hover">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {/* 由于MatchList不包含participants，暂时显示总比赛数 */}
                    {matches.length}
                  </div>
                  <div className="text-sm text-muted-foreground">已创建赛事</div>
                </div>
              </div>

              {/* Ongoing Matches */}
              {ongoingMatches.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center mb-8">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3"></div>
                    <h2 className="text-2xl font-bold">正在进行的赛事</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ongoingMatches.map((match) => (
                      <MatchCard key={match.id} match={match} priority={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* Preparing Matches */}
              {preparingMatches.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold mb-8">筹办中的赛事</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {preparingMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              {/* Finished Matches */}
              {finishedMatches.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold mb-8">已结束的赛事</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {finishedMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {matches.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">暂无赛事</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    还没有创建任何赛事。等待管理员添加新的比赛项目吧！
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

// Match Card Component
function MatchCard({ match, priority = false }: { match: MatchList; priority?: boolean }) {
  const statusInfo = getStatusInfo(match.status);
  
  return (
    <Link href={`/matches/${match.id}`} className="group">
      <Card className={`h-full glass card-hover border-primary/10 hover:border-primary/30 transition-all duration-300 ${
        priority ? 'ring-2 ring-green-500/20' : ''
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                {match.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor} ${
                  match.status === 'ongoing' ? 'animate-pulse' : ''
                }`}></div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              {match.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {match.description}
                </p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">最大队伍数</span>
              <span className="font-semibold">{match.max_teams || '未限制'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">队员人数</span>
              <span className="font-semibold">{match.max_players_per_team} 人/队</span>
            </div>
            
            {match.prize_pool && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">奖金池</span>
                <span className="font-semibold">{match.prize_pool}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="w-full text-center">
            <span className="text-sm font-medium text-primary group-hover:underline">
              查看详情 →
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}