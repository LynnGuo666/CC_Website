'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LiveUpdateSchema } from '@/types/schemas';
import { z } from 'zod';

type LiveUpdateData = z.infer<typeof LiveUpdateSchema>;

export default function LiveMatchPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [liveData, setLiveData] = useState<LiveUpdateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useWebSocket(`/ws/live/${matchId}`, {
    onMessage: (data: any) => {
      const result = LiveUpdateSchema.safeParse(data);
      if (result.success) {
        setLiveData(result.data);
        setError(null);
      } else {
        console.error("无效的实时数据:", result.error);
        setError("从服务器收到无效数据。");
      }
    },
    onError: () => {
      setError("连接错误，请尝试刷新页面。");
    },
  });

  const renderConnectionStatus = () => (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span>{isConnected ? '实时' : '已断开'}</span>
    </div>
  );

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          {liveData ? liveData.match_name : '实时比赛'}
        </h1>
        {renderConnectionStatus()}
      </div>

      {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

      {!liveData && !error && (
        <div className="text-center py-20">
          <p className="text-lg">正在等待实时数据...</p>
        </div>
      )}

      {liveData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-1 order-last lg:order-first">
            <h2 className="text-2xl font-bold mb-4">总分榜</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <ol className="space-y-3">
                {liveData.total_leaderboard.map((team, index) => (
                  <li key={team.team_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center">
                      <span className="text-lg font-bold w-8 text-center">{team.rank}</span>
                      <span className="font-semibold ml-3">{team.team_name}</span>
                    </div>
                    <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{team.total_points}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Current Game & Last Event */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">
                当前赛程: {liveData.current_match_game.game_name}
              </h2>
              <div className="space-y-4">
                {liveData.current_match_game.teams.map(team => (
                  <div key={team.team_id} className="flex justify-between items-center text-xl p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="font-semibold">{team.team_name}</span>
                    <span className="font-bold text-2xl">{team.score}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {liveData.last_event && (
              <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-gray-700 rounded-r-lg">
                <h3 className="font-bold text-lg">最新事件</h3>
                <p className="mt-1">{liveData.last_event.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}