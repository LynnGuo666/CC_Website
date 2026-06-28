"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMatches } from '@/services/matchService';
import { getMatchTeams, MatchTeam } from '@/services/matchTeamService';
import { HeroSection } from '@/components/hero-section';
import { Users, Clock } from 'lucide-react';
import { getMatchStatusStyle } from '@/lib/status';
import { LoadingState, EmptyState } from '@/components/ui/state-blocks';

interface MatchWithTeams {
  id: number;
  name: string;
  status: string;
  teams: MatchTeam[];
}

export default function TeamsPage() {
  const [matchesWithTeams, setMatchesWithTeams] = useState<MatchWithTeams[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamsData() {
      try {
        const matches = await getMatches();

        const enrichedMatches = await Promise.all(
          matches.map(async (match) => {
            const teams = await getMatchTeams(match.id);
            return { ...match, teams };
          })
        );

        setMatchesWithTeams(enrichedMatches);
      } catch (e) {
        console.error(e);
        setError('无法加载队伍列表。后端服务是否正在运行？');
      } finally {
        setLoading(false);
      }
    }
    fetchTeamsData();
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection
        title="参赛队伍"
        subtitle="跟随每一项赛事，查看参赛战队的最新阵容、颜色标识与表现。"
        className="pt-40 pb-20"
      />

      <section className="section-shell">
        <div className="max-w-6xl mx-auto space-y-10">
          {loading ? (
            <LoadingState
              icon={<Users className="w-9 h-9 text-muted-foreground" strokeWidth={2} />}
              title="正在加载队伍..."
              subtitle="请稍候"
            />
          ) : error ? (
            <div className="glass-card border border-destructive/40 text-destructive p-6">
              {error}
            </div>
          ) : matchesWithTeams.length === 0 ? (
            <EmptyState
              icon={<Users className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />}
              title="暂无比赛"
              description="还没有创建任何比赛，请等待管理员添加新的比赛项目！"
            />
          ) : (
            <div className="space-y-10">
              {matchesWithTeams.map((match) => {
                const statusText = getMatchStatusStyle(match.status).label;

                return (
                  <div key={match.id} className="glass-card space-y-6 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">{match.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" strokeWidth={2} />
                            {match.teams.length} 支队伍
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" strokeWidth={2} />
                            {statusText}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/matches/${match.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        查看比赛详情 →
                      </Link>
                    </div>

                    {match.teams.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {match.teams.map((team) => (
                          <Link href={`/teams/${team.id}`} key={team.id} className="group">
                            <div className="glass-panel rounded-2xl px-3 sm:px-4 py-4 sm:py-5 text-center transition-all duration-300 hover:-translate-y-1">
                              <div
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-2 sm:mb-3 border border-white/30 shadow-lg flex items-center justify-center"
                                style={{ backgroundColor: team.color || '#8B5CF6' }}
                              >
                                <span className="text-white font-semibold text-base sm:text-lg drop-shadow">{team.name.charAt(0)}</span>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                                {team.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">总分 {team.total_score ?? 0}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/20 px-6 py-10 text-center text-muted-foreground">
                        该比赛暂无队伍
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
