'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminStats, getSystemHealth, AdminStats, SystemHealth } from '@/services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, healthData] = await Promise.all([
          getAdminStats(),
          getSystemHealth()
        ]);
        setStats(statsData);
        setHealth(healthData);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">加载数据中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* System Health Status */}
        {health && (
          <Card className="glass border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                系统状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={health.status === 'healthy' ? 'default' : health.status === 'warning' ? 'secondary' : 'destructive'}
                  >
                    {health.status === 'healthy' ? '健康' : health.status === 'warning' ? '警告' : '异常'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">系统状态</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={health.database === 'connected' ? 'default' : 'destructive'}>
                    {health.database === 'connected' ? '已连接' : '断开'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">数据库</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">响应时间: </span>
                  <span className="font-medium">{health.api_response_time}ms</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">运行时间: </span>
                  <span className="font-medium">{health.uptime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">总赛事</p>
                    <p className="text-2xl font-bold">{stats.total_matches}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">注册队伍</p>
                    <p className="text-2xl font-bold">{stats.total_teams}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">注册选手</p>
                    <p className="text-2xl font-bold">{stats.total_users}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">得分记录</p>
                    <p className="text-2xl font-bold">{stats.total_scores}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard Preview */}
          {stats && stats.leaderboard_preview.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>积分榜预览</CardTitle>
                <CardDescription>前5名队伍积分情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.leaderboard_preview.map((team) => (
                    <div key={team.rank} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          team.rank === 1 ? 'bg-yellow-500' :
                          team.rank === 2 ? 'bg-gray-400' :
                          team.rank === 3 ? 'bg-orange-600' : 'bg-muted'
                        }`}>
                          {team.rank}
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.team_color || '#6b7280' }}
                        />
                        <span className="font-medium">{team.team_name}</span>
                      </div>
                      <span className="font-bold text-primary">{team.total_points}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Games */}
          {stats && stats.popular_games.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>热门游戏</CardTitle>
                <CardDescription>按参与度排序的游戏项目</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popular_games.map((game, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{game.game_name}</p>
                        <p className="text-sm text-muted-foreground">平均分: {game.avg_score}</p>
                      </div>
                      <Badge variant="secondary">{game.total_plays} 次</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activities */}
        {stats && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
              <CardDescription>系统最新动态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                      activity.type === 'match_created' ? 'bg-blue-500' :
                      activity.type === 'team_created' ? 'bg-green-500' :
                      activity.type === 'user_created' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}