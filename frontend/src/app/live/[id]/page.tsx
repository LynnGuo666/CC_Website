'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LiveUpdateSchema } from '@/types/schemas';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type LiveUpdateData = z.infer<typeof LiveUpdateSchema>;

type MatchStatus = 'playing' | 'halftime' | 'voting' | 'paused' | 'finished' | 'relax';
type VotingType = 'mvp' | 'best_play' | 'next_game';

export default function LiveMatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.id as string;
  const isDemoMode = searchParams.get('mode') === 'demo';
  const demoStatus = searchParams.get('status') || 'playing'; // playing, halftime, voting, finished, relax

  const [liveData, setLiveData] = useState<LiveUpdateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('playing');
  const [votingData, setVotingData] = useState<any>(null);
  const [gameEvents, setGameEvents] = useState<any[]>([]);
  const [personalLeaderboard, setPersonalLeaderboard] = useState<any[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [halftimeData, setHalftimeData] = useState<any>(null);

  // WebSocket connection (disabled in demo mode)
  const { isConnected } = useWebSocket(isDemoMode ? null : `/ws/live/${matchId}`, {
    onMessage: (data: any) => {
      const result = LiveUpdateSchema.safeParse(data);
      if (result.success) {
        setLiveData(result.data);
        setError(null);
        setLastUpdateTime(new Date());
        
        // Handle additional live data
        if (data.match_status) setMatchStatus(data.match_status);
        if (data.game_events) setGameEvents(data.game_events);
        if (data.personal_leaderboard) setPersonalLeaderboard(data.personal_leaderboard);
        if (data.voting_data) setVotingData(data.voting_data);
        if (typeof data.connected_users === 'number') setConnectedUsers(data.connected_users);
      } else {
        console.error("无效的实时数据:", result.error);
        setError("从服务器收到无效数据。");
      }
    },
    onError: () => {
      if (!isDemoMode) {
        setError("连接错误，请尝试刷新页面。");
      }
    },
  });

  // Mock data for development and demo mode
  useEffect(() => {
    if (isDemoMode || !liveData) {
      // Add mock data for better UI preview
      setGameEvents([
        { id: 1, time: '12:34', type: 'score', player: 'Venti_Lynn', team: '落地水队', points: 150, description: '完成精美建筑获得高分！' },
        { id: 2, time: '12:30', type: 'elimination', player: 'Player2', team: '曲奇白巧', description: '在PvP中被淘汰' },
        { id: 3, time: '12:25', type: 'powerup', player: 'Player3', team: '绿队', description: '获得速度提升道具' },
        { id: 4, time: '12:20', type: 'score', player: 'Builder_Pro', team: '锤神再起', points: 200, description: '创造模式建造奇迹建筑' },
        { id: 5, time: '12:15', type: 'achievement', player: 'RedStone_Master', team: '红队', description: '完成复杂红石电路' },
        { id: 6, time: '12:10', type: 'score', player: 'Creative_Mind', team: '绿队', points: 180, description: '创意建筑获得评委认可' },
        { id: 7, time: '12:05', type: 'elimination', player: 'Test_Player', team: '魔芋爽', description: '挑战失败被淘汰' },
      ]);
      setPersonalLeaderboard([
        { rank: 1, player: 'Venti_Lynn', team: '落地水队', score: 1250, avatar: 'Venti_Lynn' },
        { rank: 2, player: 'Builder_Pro', team: '锤神再起', score: 1100, avatar: 'Builder_Pro' },
        { rank: 3, player: 'RedStone_Master', team: '红队', score: 950, avatar: 'RedStone_Master' },
        { rank: 4, player: 'PvP_King', team: '曲奇白巧', score: 880, avatar: 'PvP_King' },
        { rank: 5, player: 'Creative_Mind', team: '绿队', score: 750, avatar: 'Creative_Mind' },
        { rank: 6, player: 'Tech_Wizard', team: '维多利亚', score: 720, avatar: 'Tech_Wizard' },
        { rank: 7, player: 'Speed_Runner', team: '新春大吉队', score: 680, avatar: 'Speed_Runner' },
        { rank: 8, player: 'Block_Master', team: 'hunter队', score: 650, avatar: 'Block_Master' },
      ]);

      // Set different status and data based on demo status parameter
      if (isDemoMode) {
        // Set demo status
        const status = demoStatus as MatchStatus;
        setMatchStatus(status);
        
        // Set demo voting data
        if (status === 'voting') {
          setVotingData({
            id: 1,
            type: 'next_game',
            title: '选择下一场游戏',
            options: [
              { id: 1, name: '红石电路挑战', votes: 245, percentage: 45 },
              { id: 2, name: 'PvP竞技场', votes: 189, percentage: 35 },
              { id: 3, name: 'Build Battle', votes: 108, percentage: 20 }
            ],
            end_time: new Date(Date.now() + 45000), // 45 seconds from now
            is_active: true,
            total_votes: 542
          });
        } else if (status === 'halftime') {
          setHalftimeData({
            start_time: new Date(Date.now() - 120000), // Started 2 minutes ago
            estimated_duration: 300, // 5 minutes total
            next_game: '红石电路挑战',
            current_duration: 120 // 2 minutes elapsed
          });
        }
        
        setError(null);
        setConnectedUsers(1234);
        setLastUpdateTime(new Date());
      }
    }
  }, [liveData, isDemoMode, demoStatus]);

  const getStatusBadge = () => {
    const statusConfig = {
      playing: { label: '游戏进行中', color: 'bg-green-500', icon: '🎮' },
      halftime: { label: '中场休息', color: 'bg-orange-500', icon: '⏸️' },
      voting: { label: '投票中', color: 'bg-purple-500', icon: '🗳️' },
      paused: { label: '暂停', color: 'bg-gray-500', icon: '⏸️' },
      finished: { label: '已结束', color: 'bg-red-500', icon: '🏁' },
      relax: { label: '休息时间', color: 'bg-blue-500', icon: '🌟' }
    };
    
    const config = statusConfig[matchStatus as keyof typeof statusConfig] || statusConfig.playing;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const renderConnectionStatus = () => {
    // In demo mode, always show as connected
    const connected = isDemoMode ? true : isConnected;
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    
    return (
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{connected ? '实时连接' : '连接断开'}</span>
        </div>
        <div className="text-muted-foreground">
          最后更新: {formatTime(lastUpdateTime)}
        </div>
        {isDemoMode && (
          <Badge variant="outline" className="text-xs">
            演示模式
          </Badge>
        )}
      </div>
    );
  };

  const renderHalftimeSection = () => {
    if (matchStatus !== 'halftime' || !halftimeData) return null;
    
    // Calculate elapsed time
    const now = new Date();
    const startTime = new Date(halftimeData.start_time);
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const remainingSeconds = Math.max(0, halftimeData.estimated_duration - elapsedSeconds);
    
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const progress = Math.min(100, (elapsedSeconds / halftimeData.estimated_duration) * 100);
    
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-orange-700 dark:text-orange-300">
            <span>⏸️ 中场休息中</span>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              剩余 {formatTime(remainingSeconds)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">☕</div>
              <p className="text-lg font-medium mb-2">稍事休息，马上回来</p>
              <p className="text-sm text-muted-foreground">
                下一场游戏: <span className="font-semibold">{halftimeData.next_game}</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>休息进度</span>
                <span>{formatTime(elapsedSeconds)} / {formatTime(halftimeData.estimated_duration)}</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-2xl font-bold text-orange-500">{formatTime(elapsedSeconds)}</div>
                <div className="text-muted-foreground">已休息</div>
              </div>
              <div className="p-3 rounded-lg bg-background/60">
                <div className="text-2xl font-bold text-primary">{formatTime(remainingSeconds)}</div>
                <div className="text-muted-foreground">剩余时间</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVotingSection = () => {
    if (matchStatus !== 'voting' || !votingData) return null;
    
    // Calculate remaining time
    const now = new Date();
    const endTime = new Date(votingData.end_time);
    const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    return (
      <Card className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-purple-700 dark:text-purple-300">
            <span>🗳️ 实时投票</span>
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              {timeString} 倒计时
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{votingData.title}</h4>
            <div className="space-y-3">
              {votingData.options.map((option: any) => (
                <div key={option.id} className="relative">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 justify-start relative overflow-hidden"
                    onClick={() => {
                      // In real app, this would send vote to server
                      console.log('Vote for option:', option.id);
                    }}
                  >
                    <div 
                      className="absolute left-0 top-0 h-full bg-purple-100 dark:bg-purple-800/30 transition-all duration-300" 
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎮</span>
                        <div className="text-left">
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-muted-foreground">{option.votes} 票 ({option.percentage}%)</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress value={option.percentage} className="w-20 h-2" />
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
              <span>总投票数: {votingData.total_votes}</span>
              <span className={remainingSeconds < 30 ? 'text-red-500 animate-pulse' : ''}>
                ⏰ {timeString}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Don't show errors in demo mode
  if (error && !isDemoMode) {
    return (
      <div className="min-h-screen bg-background">
        {/* Error Banner */}
        <div className="sticky top-0 z-50 bg-destructive text-destructive-foreground px-4 py-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
        
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  联合锦标赛直播
                </h1>
                <Badge className="bg-red-500 text-white">
                  🔴 连接断开
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                {renderConnectionStatus()}
              </div>
            </div>
          </div>
        </div>

        {/* Content with retry */}
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <span className="text-3xl">📡</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">无法连接到直播</h2>
            <p className="text-muted-foreground mb-6">请检查网络连接或稍后重试</p>
            <Button onClick={() => window.location.reload()}>
              🔄 刷新页面
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {liveData?.match_name || '联合锦标赛直播'}
              </h1>
              {getStatusBadge()}
            </div>
            <div className="flex items-center space-x-4">
              {renderConnectionStatus()}
              <div className="text-sm text-muted-foreground">
                👁️ {connectedUsers.toLocaleString()} 人在线
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!liveData && !error && !isDemoMode && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">连接直播中...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {renderVotingSection()}
        {renderHalftimeSection()}
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Team Leaderboard */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  🏆 队伍积分榜
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {liveData?.total_leaderboard?.map((team, index) => (
                    <div key={team.team_id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border border-gray-400/30' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border border-orange-400/30' :
                      'bg-muted/50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-500' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-muted-foreground'
                        }`}>
                          {team.rank || index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{team.team_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {team.games_played || 0} 场比赛
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">{team.total_points}</div>
                        <div className="text-xs text-green-600">+{team.recent_points || 0}</div>
                      </div>
                    </div>
                  )) || (
                    // Mock data for preview
                    ['落地水队', '曲奇白巧', '绿队', '红队', '锤神再起'].map((teamName, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border border-gray-400/30' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border border-orange-400/30' :
                        'bg-muted/50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-500' :
                            index === 2 ? 'bg-orange-500' :
                            'bg-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{teamName}</div>
                            <div className="text-xs text-muted-foreground">3 场比赛</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-primary">{1200 - index * 150}</div>
                          <div className="text-xs text-green-600">+{50 - index * 10}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Leaderboard */}
            <Card className="glass mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  👤 个人积分榜
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {personalLeaderboard.map((player, index) => (
                    <div key={player.rank} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {player.rank}
                        </div>
                        <img 
                          src={`https://mc-heads.net/avatar/${player.avatar}/24`} 
                          alt={player.player} 
                          className="w-6 h-6 rounded-full border border-border/20"
                          onError={(e) => {
                            // Fallback to text avatar if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center text-white text-xs font-bold" 
                          style={{ display: 'none' }}
                        >
                          {player.player.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{player.player}</div>
                          <div className="text-xs text-muted-foreground">{player.team}</div>
                        </div>
                      </div>
                      <div className="font-bold text-primary">{player.score}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-6 order-1 xl:order-2">
            {/* Current Game Status */}
            <Card className="glass mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {matchStatus === 'halftime' ? (
                    <span>☕ 中场休息中</span>
                  ) : (
                    <span>🎮 当前游戏: {liveData?.current_match_game?.game_name || 'Minecraft 建筑大赛'}</span>
                  )}
                  <div className="text-sm font-normal text-muted-foreground">
                    {matchStatus === 'halftime' && halftimeData ? (
                      `休息中 | 预计${Math.ceil(halftimeData.estimated_duration / 60)}分钟`
                    ) : (
                      '第 1/3 局 | 剩余时间: 05:23'
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Game Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>游戏进度</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                {/* Current Game Scores */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">本局实时积分</h4>
                  {liveData?.current_match_game?.teams?.map(team => (
                    <div key={team.team_id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                          {team.team_name?.charAt(0) || 'T'}
                        </div>
                        <span className="font-semibold">{team.team_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-2xl text-primary">{team.score}</div>
                        <div className="text-xs text-muted-foreground">本局得分</div>
                      </div>
                    </div>
                  )) || (
                    // Mock data
                    ['落地水队', '曲奇白巧', '绿队'].map((teamName, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold">
                            {teamName.charAt(0)}
                          </div>
                          <span className="font-semibold">{teamName}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-2xl text-primary">{250 - index * 30}</div>
                          <div className="text-xs text-muted-foreground">本局得分</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Event */}
            {(liveData?.last_event || gameEvents.length > 0) && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    ⚡ 最新事件
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {liveData?.last_event && (
                      <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                        <p className="font-medium">{liveData.last_event.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">刚刚</p>
                      </div>
                    )}
                    
                    {gameEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {event.type === 'score' ? '🎯' : event.type === 'elimination' ? '💀' : '⭐'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{event.player}</span>
                            <span className="text-xs text-muted-foreground">{event.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{event.team}</Badge>
                            {event.points && (
                              <Badge variant="secondary" className="text-xs">+{event.points}分</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Game Schedule */}
          <div className="xl:col-span-3 order-3">
            {/* Game Schedule */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  📅 赛程安排
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 rounded bg-primary/10 border border-primary/20">
                    <span className="font-medium">Minecraft 建筑大赛</span>
                    <Badge variant="default" className="text-xs">进行中</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span>红石电路挑战</span>
                    <Badge variant="outline" className="text-xs">待开始</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span>PvP 竞技场</span>
                    <Badge variant="outline" className="text-xs">待开始</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}