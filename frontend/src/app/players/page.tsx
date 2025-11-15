"use client";

import { getUsers, User } from '@/services/userService';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { useState, useEffect, useMemo } from 'react';
import { getMatches, MatchList } from '@/services/matchService';
import { getMatchTeams, getTeamMembers } from '@/services/matchTeamService';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeroSection } from '@/components/hero-section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PlayersPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState<number>(100);
  const [totalFromApi, setTotalFromApi] = useState<number | null>(null);
  const [matches, setMatches] = useState<MatchList[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('all');
  const [matchUserIds, setMatchUserIds] = useState<Set<number>>(new Set());
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [sortMode, setSortMode] = useState<'default' | 'az' | 'za'>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        console.log('尝试获取用户数据...');
        // 先请求较大上限，统计返回条数
        const data = await getUsers({ skip: 0, limit: 10000 });
        console.log(`成功获取 ${data.length} 个用户`);
        setPlayers(data);
        setTotalFromApi(data.length);
        setError(null);
      } catch (e) {
        console.error('获取用户数据失败:', e);
        setError(`无法加载选手列表。错误: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // 加载赛事列表
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await getMatches();
        setMatches(data);
      } catch (e) {
        console.error('获取赛事列表失败:', e);
      }
    };
    loadMatches();
  }, []);

  // 根据所选赛事加载参赛选手ID集合
  useEffect(() => {
    const loadMatchParticipants = async () => {
      if (selectedMatchId === 'all') {
        setMatchUserIds(new Set());
        return;
      }
      setFilterLoading(true);
      try {
        const matchIdNum = parseInt(selectedMatchId, 10);
        const teams = await getMatchTeams(matchIdNum);
        const membersArrays = await Promise.all(
          teams.map(async (t) => {
            try {
              return await getTeamMembers(t.id);
            } catch (err) {
              console.warn(`获取队伍 ${t.id} 成员失败`, err);
              return [] as any[];
            }
          })
        );
        const ids = new Set<number>();
        for (const members of membersArrays) {
          for (const m of members as any[]) {
            if (typeof m.user_id === 'number') ids.add(m.user_id);
          }
        }
        setMatchUserIds(ids);
      } catch (e) {
        console.error('加载赛事参赛选手失败:', e);
        setError(`加载赛事参赛选手失败：${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setFilterLoading(false);
      }
    };
    loadMatchParticipants();
  }, [selectedMatchId]);

  // 当筛选条件或搜索变化时，将可见数量重置为100
  useEffect(() => {
    setVisibleCount(100);
  }, [selectedMatchId, sortMode, searchQuery]);

  const processedPlayers = useMemo(() => {
    let list = players;
    if (selectedMatchId !== 'all') {
      list = list.filter((p) => matchUserIds.has(p.id));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const nickname = (p.nickname || '').toLowerCase();
        const displayName = (p.display_name || '').toLowerCase();
        const idStr = String(p.id);
        return (
          nickname.includes(q) || displayName.includes(q) || idStr.includes(q)
        );
      });
    }
    if (sortMode === 'az') {
      list = [...list].sort((a, b) => (a.nickname || '').localeCompare(b.nickname || '', 'zh-Hans-CN'));
    } else if (sortMode === 'za') {
      list = [...list].sort((a, b) => (b.nickname || '').localeCompare(a.nickname || '', 'zh-Hans-CN'));
    }
    return list;
  }, [players, selectedMatchId, matchUserIds, sortMode, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeroSection
          title="所有选手"
          subtitle="显示所有注册选手"
        />
        <section className="section-shell">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card text-center p-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground">正在加载选手...</h3>
              <p className="text-muted-foreground">请稍候</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection
        title="所有选手"
        subtitle={`显示 ${Math.min(visibleCount, processedPlayers.length)} / ${processedPlayers.length} 位选手（默认前 100 位）`}
      >
        {filterLoading && <span>筛选中...</span>}
        {totalFromApi !== null && <span>数据库共 {totalFromApi} 位注册选手</span>}
      </HeroSection>

      <section className="section-shell">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="glass-panel grid gap-4 rounded-3xl p-6 md:grid-cols-[2fr,1.5fr,1fr]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索昵称 / 显示名 / ID..."
            />
            <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="按赛事筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部赛事</SelectItem>
                {matches.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortMode} onValueChange={(v) => setSortMode(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">默认顺序</SelectItem>
                <SelectItem value="az">按昵称 A-Z</SelectItem>
                <SelectItem value="za">按昵称 Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="glass-card border border-destructive/40 text-destructive text-center p-6">
              {error}
            </div>
          )}

          {!error && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {processedPlayers.length > 0 ? (
                processedPlayers.slice(0, visibleCount).map((player) => (
                  <Link href={`/players/${player.id}`} key={player.id} className="group">
                    <Card className="glass-card text-center transition-all duration-300">
                      <CardContent className="pt-6 pb-5">
                        <Avatar
                          username={player.nickname}
                          userId={player.id}
                          size={64}
                          className="rounded-2xl mx-auto mb-3 border border-white/30 shadow-lg"
                          fallbackClassName="rounded-2xl bg-gradient-to-br from-primary to-accent text-lg"
                          fallbackLetter={player.nickname?.charAt(0)?.toUpperCase()}
                        />
                        <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {player.nickname}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">ID: {player.id}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">未找到任何选手。</p>
              )}
            </div>
          )}

          {(processedPlayers.length > visibleCount || visibleCount > 100) && (
            <div className="flex justify-center">
              <div className="flex items-center gap-3">
                {processedPlayers.length > visibleCount && (
                  <Button
                    className="rounded-2xl px-6"
                    onClick={() => setVisibleCount((c) => c + 100)}
                  >
                    加载更多（+100）
                  </Button>
                )}
                {visibleCount > 100 && (
                  <Button
                    variant="outline"
                    className="rounded-2xl px-6"
                    onClick={() => setVisibleCount(100)}
                  >
                    收起到前100位
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
