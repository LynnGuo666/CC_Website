"use client";

import { getUsers, User } from '@/services/userService';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { useState, useEffect, useMemo } from 'react';
import { getMatches, MatchList } from '@/services/matchService';
import { getMatchTeams, getTeamMembers } from '@/services/matchTeamService';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  }, [players, selectedMatchId, matchUserIds, sortMode]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6">所有选手</h1>
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header 与其他页面保持一致 */}
      <section className="relative py-12 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">所有选手</h1>
            <div className="text-sm text-muted-foreground">
              显示 {Math.min(visibleCount, processedPlayers.length)} / {processedPlayers.length} 位（默认前100位）
            </div>
          </div>
          {/* 控制栏：赛事筛选与排序 */}
          <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4">
            <div className="w-full md:w-96">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索昵称/显示名/ID..."
              />
            </div>
            <div className="w-full md:w-80">
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
            </div>
            <div className="w-full md:w-56">
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
            {filterLoading && (
              <span className="text-sm text-muted-foreground">筛选中...</span>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

        {!error && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {processedPlayers.length > 0 ? (
              processedPlayers.slice(0, visibleCount).map((player) => (
                <Link href={`/players/${player.id}`} key={player.id} className="group">
                  <div className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
                    <Avatar
                      username={player.nickname}
                      userId={player.id}
                      size={64}
                      className="rounded-full mx-auto mb-3"
                      fallbackClassName="rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
                      fallbackLetter={player.nickname?.charAt(0)?.toUpperCase()}
                    />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{player.nickname}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {player.id}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p>未找到任何选手。</p>
            )}
          </div>
        )}

        {(processedPlayers.length > visibleCount || visibleCount > 100) && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-3">
              {processedPlayers.length > visibleCount && (
                <button
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => setVisibleCount((c) => c + 100)}
                >
                  加载更多（+100）
                </button>
              )}
              {visibleCount > 100 && (
                <button
                  className="px-4 py-2 rounded-xl border border-muted/50 hover:bg-muted/20 transition-colors"
                  onClick={() => setVisibleCount(100)}
                >
                  收起到前100位
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}