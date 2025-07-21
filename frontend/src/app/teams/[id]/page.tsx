import { getTeamById, Team } from '@/services/teamService';
import Link from 'next/link';

type TeamDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  let team: Team | null = null;
  let error: string | null = null;

  try {
    const teamId = parseInt(params.id, 10);
    if (isNaN(teamId)) {
      throw new Error('无效的队伍ID。');
    }
    team = await getTeamById(teamId);
  } catch (e: any) {
    console.error(e);
    error = e.message || '加载队伍详情失败。';
  }

if (error) {
  return (
    <main className="container mx-auto p-4">
      <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
      <Link href="/teams" className="text-blue-500 hover:underline mt-4 inline-block">
        &larr; 返回队伍列表
      </Link>
    </main>
  );
}

if (!team) {
  return (
    <main className="container mx-auto p-4">
      <p>未找到该队伍。</p>
      <Link href="/teams" className="text-blue-500 hover:underline mt-4 inline-block">
        &larr; 返回队伍列表
      </Link>
    </main>
  );
}

return (
  <div className="container mx-auto p-4 sm:p-6 lg:p-8">
    <div className="flex items-center space-x-6 mb-6">
      <div
        className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
        style={{ backgroundColor: team.color || '#cccccc' }}
      ></div>
      <div>
        <h1 className="text-4xl font-bold">{team.name}</h1>
        <p className="text-gray-500 dark:text-gray-400">队伍编号: {team.team_number}</p>
      </div>
    </div>

    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">队伍成员</h2>
      {team.members && team.members.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {team.members.map(member => (
            <Link key={member.id} href={`/players/${member.id}`} className="block p-4 bg-white dark:bg-gray-800 border rounded-lg text-center hover:shadow-lg transition-shadow">
              {member.nickname}
            </Link>
          ))}
        </div>
      ) : (
        <p>该队伍暂无成员。</p>
      )}
    </div>
  </div>
);
}