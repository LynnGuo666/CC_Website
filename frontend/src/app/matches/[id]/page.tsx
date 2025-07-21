import { getMatchById, Match } from '@/services/matchService';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TeamTotalScore = {
  id: number;
  name: string;
  color: string | null;
  total_points: number;
};

// Helper function to calculate total scores
function calculateTotalScores(match: Match): TeamTotalScore[] {
  const scores: Record<number, TeamTotalScore> = {};

  for (const team of match.participants) {
    scores[team.id] = { id: team.id, name: team.name, color: team.color, total_points: 0 };
  }

  for (const game of match.match_games) {
    for (const score of game.scores) {
      if (scores[score.team_id]) {
        scores[score.team_id].total_points += score.points;
      }
    }
  }

  return Object.values(scores).sort((a, b) => b.total_points - a.total_points);
}

type MatchDetailPageProps = {
  params: { id: string };
};

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  let match: Match | null = null;
  let error: string | null = null;
  let totalScores: TeamTotalScore[] = [];

  try {
    const matchId = parseInt(params.id, 10);
    if (isNaN(matchId)) {
      throw new Error('无效的赛事ID。');
    }
    match = await getMatchById(matchId);
    if (match) {
      totalScores = calculateTotalScores(match);
    }
  } catch (e: any) {
    console.error(e);
    error = e.message || '加载赛事详情失败。';
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/matches">&larr; 返回赛事列表</Link>
        </Button>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="container mx-auto p-4">
        <p>未找到该赛事。</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/matches">&larr; 返回赛事列表</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-2 sm:mb-0">{match.name}</h1>
        <Button asChild>
          <Link href={`/live/${match.id}`}>★ 前往实时视图</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold">赛程详情</h2>
          {match.match_games.map(game => (
            <Card key={game.id}>
              <CardHeader>
                <CardTitle>{game.game.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>选手</TableHead>
                      <TableHead>队伍</TableHead>
                      <TableHead className="text-right">分数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {game.scores.length > 0 ? game.scores.map(score => (
                      <TableRow key={score.id}>
                        <TableCell>{score.user.nickname}</TableCell>
                        <TableCell>{score.team.name}</TableCell>
                        <TableCell className="text-right font-mono">{score.points}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={3} className="text-center">暂无得分记录</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">总分榜</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>排名</TableHead>
                    <TableHead>队伍</TableHead>
                    <TableHead className="text-right">总分</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalScores.map((team, index) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell className="text-right font-bold">{team.total_points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}