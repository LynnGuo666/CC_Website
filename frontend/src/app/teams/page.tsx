import { getTeams, Team } from '@/services/teamService';
import Link from 'next/link';

export default async function TeamsPage() {
  let teams: Team[] = [];
  let error: string | null = null;

  try {
    teams = await getTeams();
  } catch (e) {
    console.error(e);
    error = '无法加载队伍列表。后端服务是否正在运行？';
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">所有队伍</h1>
      
      {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

      {!error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {teams.length > 0 ? (
            teams.map((team) => (
              <Link href={`/teams/${team.id}`} key={team.id} className="group">
                <div className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-white dark:border-gray-600 shadow-lg"
                    style={{ backgroundColor: team.color || '#cccccc' }}
                  ></div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{team.name}</h2>
                </div>
              </Link>
            ))
          ) : (
            <p>未找到任何队伍。</p>
          )}
        </div>
      )}
    </div>
  );
}