import { getMatches, Match } from '@/services/matchService';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MatchesPage() {
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    matches = await getMatches();
  } catch (e) {
    error = '无法加载赛事列表。后端服务是否正在运行？';
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">所有赛事</h1>
      
      {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.length > 0 ? (
            matches.map((match) => (
              <Link href={`/matches/${match.id}`} key={match.id} className="group">
                <Card className="h-full flex flex-col hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <CardHeader>
                    <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{match.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p>
                      {match.participants.length} 支队伍参赛
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {match.start_time ? new Date(match.start_time).toLocaleDateString('zh-CN') : '日期未定'}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))
          ) : (
            <p>未找到任何赛事。</p>
          )}
        </div>
      )}
    </div>
  );
}