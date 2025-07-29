"use client";

import { getUsers, User } from '@/services/userService';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

export default function PlayersPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        console.log('尝试获取用户数据...');
        const data = await getUsers();
        console.log(`成功获取 ${data.length} 个用户`);
        setPlayers(data);
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">所有选手</h1>
      
      {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

      {!error && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {players.length > 0 ? (
            players.map((player) => (
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
    </div>
  );
}