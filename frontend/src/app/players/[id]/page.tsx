import { getUserById, User } from '@/services/userService';
import Link from 'next/link';

type PlayerDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  let player: User | null = null;
  let error: string | null = null;

  try {
    const playerId = parseInt(params.id, 10);
    if (isNaN(playerId)) {
      throw new Error('无效的选手ID。');
    }
    player = await getUserById(playerId);
  } catch (e: any) {
    console.error(e);
    error = e.message || '加载选手详情失败。';
  }

if (error) {
  return (
    <main className="container mx-auto p-4">
      <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
      <Link href="/players" className="text-blue-500 hover:underline mt-4 inline-block">
        &larr; 返回选手列表
      </Link>
    </main>
  );
}

if (!player) {
  return (
    <main className="container mx-auto p-4">
      <p>未找到该选手。</p>
      <Link href="/players" className="text-blue-500 hover:underline mt-4 inline-block">
        &larr; 返回选手列表
      </Link>
    </main>
  );
}

return (
  <div className="container mx-auto p-4 sm:p-6 lg:p-8">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold mb-2">{player.nickname}</h1>
      <div className="mt-6 border-t pt-6">
        <h2 className="text-2xl font-bold mb-4">选手信息</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <dt className="font-semibold text-gray-600 dark:text-gray-400">选手 ID</dt>
          <dd>{player.id}</dd>
          <dt className="font-semibold text-gray-600 dark:text-gray-400">来源</dt>
          <dd>{player.source || '暂无'}</dd>
        </dl>
        {/* 可以在此处添加更多选手信息，例如比赛历史记录 */}
      </div>
    </div>
  </div>
);
}