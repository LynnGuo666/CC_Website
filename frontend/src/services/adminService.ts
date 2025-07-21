import { API_BASE_URL } from './config';

export interface AdminStats {
  total_matches: number;
  total_teams: number;
  total_users: number;
  active_matches: number;
  finished_matches: number;
  total_scores: number;
  recent_activities: Array<{
    id: number;
    type: 'match_created' | 'team_created' | 'user_created' | 'score_recorded';
    description: string;
    timestamp: string;
    entity_id?: number;
  }>;
  popular_games: Array<{
    game_name: string;
    total_plays: number;
    avg_score: number;
  }>;
  leaderboard_preview: Array<{
    rank: number;
    team_name: string;
    total_points: number;
    team_color: string | null;
  }>;
}

export async function getAdminStats(): Promise<AdminStats> {
  // Since we don't have a dedicated admin stats endpoint yet, 
  // we'll aggregate data from existing endpoints
  
  const [matchesRes, teamsRes, usersRes] = await Promise.all([
    fetch(`${API_BASE_URL}/matches/`),
    fetch(`${API_BASE_URL}/teams/`),
    fetch(`${API_BASE_URL}/users/`)
  ]);

  if (!matchesRes.ok || !teamsRes.ok || !usersRes.ok) {
    throw new Error('Failed to fetch admin statistics');
  }

  const matches = await matchesRes.json();
  const teams = await teamsRes.json();
  const users = await usersRes.json();

  // Calculate statistics
  const totalMatches = matches.length;
  const totalTeams = teams.length;
  const totalUsers = users.length;
  const activeMatches = matches.filter((m: any) => m.status === 'ongoing' || m.status === 'preparing').length;
  const finishedMatches = matches.filter((m: any) => m.status === 'finished').length;
  
  // Calculate total scores from all matches
  let totalScores = 0;
  const gameStats = new Map();
  
  matches.forEach((match: any) => {
    match.match_games?.forEach((game: any) => {
      const scores = game.scores || [];
      totalScores += scores.length;
      
      // Track game statistics
      const gameName = game.game?.name || 'Unknown';
      if (!gameStats.has(gameName)) {
        gameStats.set(gameName, { plays: 0, totalScore: 0 });
      }
      const stat = gameStats.get(gameName);
      stat.plays += scores.length;
      stat.totalScore += scores.reduce((sum: number, s: any) => sum + s.points, 0);
    });
  });

  // Convert game stats to popular games
  const popularGames = Array.from(gameStats.entries())
    .map(([name, stats]) => ({
      game_name: name,
      total_plays: stats.plays,
      avg_score: stats.plays > 0 ? Math.round(stats.totalScore / stats.plays) : 0
    }))
    .sort((a, b) => b.total_plays - a.total_plays)
    .slice(0, 5);

  // Create leaderboard preview (top teams by total points)
  const teamPoints = new Map();
  matches.forEach((match: any) => {
    match.participants?.forEach((team: any) => {
      if (!teamPoints.has(team.id)) {
        teamPoints.set(team.id, { 
          name: team.name, 
          color: team.color, 
          points: 0 
        });
      }
    });
    
    match.match_games?.forEach((game: any) => {
      game.scores?.forEach((score: any) => {
        if (teamPoints.has(score.team_id)) {
          teamPoints.get(score.team_id).points += score.points;
        }
      });
    });
  });

  const leaderboardPreview = Array.from(teamPoints.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((team, index) => ({
      rank: index + 1,
      team_name: team.name,
      total_points: team.points,
      team_color: team.color
    }));

  // Generate recent activities (mock data since we don't have activity logs)
  const recentActivities = [
    {
      id: 1,
      type: 'match_created' as const,
      description: '新赛事已创建',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'score_recorded' as const,
      description: '新得分记录已添加',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    },
    {
      id: 3,
      type: 'team_created' as const,
      description: '新队伍已注册',
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    }
  ];

  return {
    total_matches: totalMatches,
    total_teams: totalTeams,
    total_users: totalUsers,
    active_matches: activeMatches,
    finished_matches: finishedMatches,
    total_scores: totalScores,
    recent_activities: recentActivities,
    popular_games: popularGames,
    leaderboard_preview: leaderboardPreview
  };
}

// System health check
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: 'connected' | 'disconnected' | 'slow';
  api_response_time: number;
  memory_usage?: number;
  uptime?: string;
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const startTime = Date.now();
  
  try {
    // Test API connectivity
    const response = await fetch(`${API_BASE_URL}/matches/`, { 
      method: 'HEAD',
      cache: 'no-cache' 
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: response.ok ? 'healthy' : 'warning',
      database: response.ok ? 'connected' : 'slow',
      api_response_time: responseTime,
      uptime: 'Unknown' // Would need backend endpoint for this
    };
  } catch (error) {
    return {
      status: 'critical',
      database: 'disconnected',
      api_response_time: Date.now() - startTime,
      uptime: 'Unknown'
    };
  }
}

export async function getRecentLogs(): Promise<Array<{
  id: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source?: string;
}>> {
  // Mock logs data since we don't have real logging endpoint
  return [
    {
      id: 1,
      level: 'info',
      message: 'User authentication successful',
      timestamp: new Date().toISOString(),
      source: 'auth'
    },
    {
      id: 2,
      level: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      source: 'system'
    },
    {
      id: 3,
      level: 'info',
      message: 'New score recorded for match ID: 1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      source: 'matches'
    },
    {
      id: 4,
      level: 'error',
      message: 'Database connection timeout',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      source: 'database'
    }
  ];
}