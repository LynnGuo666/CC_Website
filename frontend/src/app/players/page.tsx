"use client";

import { getUsers, User } from '@/services/userService';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

export default function PlayersPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState<number>(100);
  const [totalFromApi, setTotalFromApi] = useState<number | null>(null);

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
              显示 {Math.min(visibleCount, players.length)} / {totalFromApi ?? players.length} 位（默认前100位）
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

        {!error && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {players.length > 0 ? (
              players.slice(0, visibleCount).map((player) => (
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

        {(players.length > visibleCount || visibleCount > 100) && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-3">
              {players.length > visibleCount && (
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