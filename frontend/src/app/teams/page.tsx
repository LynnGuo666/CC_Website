"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMatches } from '@/services/matchService';
import { getMatchTeams, MatchTeam } from '@/services/matchTeamService';
import { HeroSection } from '@/components/hero-section';

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
            <div className="glass-card text-center p-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center animate-pulse">
                <svg className="w-9 h-9 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">正在加载队伍...</h3>
              <p className="text-muted-foreground">请稍候</p>
            </div>
          ) : error ? (
            <div className="glass-card border border-destructive/40 text-destructive p-6">
              {error}
            </div>
          ) : matchesWithTeams.length === 0 ? (
            <div className="glass-card text-center p-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h3 className="text-2xl font-semibold mb-2">暂无比赛</h3>
              <p className="text-muted-foreground">还没有创建任何比赛，请等待管理员添加新的比赛项目！</p>
            </div>
          ) : (
            <div className="space-y-10">
              {matchesWithTeams.map((match) => {
                const statusText =
                  match.status === 'preparing'
                    ? '筹办中'
                    : match.status === 'ongoing'
                      ? '进行中'
                      : match.status === 'finished'
                        ? '已结束'
                        : '未知状态';

                return (
                  <div key={match.id} className="glass-card space-y-6 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">{match.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            {match.teams.length} 支队伍
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
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
