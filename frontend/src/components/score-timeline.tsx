'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BarChart3, Zap, TrendingUp } from 'lucide-react'
import { getGameLevelStyle } from '@/lib/status'

type TimelineItem = {
  match_id: number
  match_name: string
  timestamp: string | null
  avg_standard_score: number
  rank?: number | null
  rank_change?: number | null
  score_delta?: number | null
  game_name?: string
  match_avg_score?: number
}

type GameScore = {
  games_played?: number
  total_score?: number
  average_standard_score?: number
  level?: string
  level_progress?: number
}

type Props = {
  scoreTimeline: TimelineItem[]
  scoreTimelineByGame: Record<string, TimelineItem[]>
  gameScores: Record<string, GameScore>
}

export default function ScoreTimeline({ scoreTimeline, scoreTimelineByGame, gameScores }: Props) {
  const gameStats = useMemo(() => {
    return Object.entries(scoreTimelineByGame).map(([gameCode, items]) => {
      const gameName = items[0]?.game_name || gameCode
      const gameScore = gameScores[gameCode] || gameScores[gameName] || {}
      const avgScore = gameScore.average_standard_score || 0
      const level = gameScore.level || 'D'
      const levelProgress = gameScore.level_progress || 0
      const gamesPlayed = gameScore.games_played || items.length

      return {
        gameCode,
        gameName,
        avgScore,
        level,
        levelProgress,
        matchCount: gamesPlayed,
        items
      }
    }).sort((a, b) => b.avgScore - a.avgScore)
  }, [scoreTimelineByGame, gameScores])

  const getLevelStyle = (level: string) => {
    const style = getGameLevelStyle(level)
    return { bgColor: style.dot, textColor: style.text }
  }

  if (gameStats.length === 0) return null

  return (
    <div className="mb-16">
      <div className="flex items-center mb-8 gap-3">
        <div className="p-2 rounded-2xl bg-primary/10 text-primary shadow-inner">
          <Users className="w-6 h-6" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold">选手表现总览</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gameStats.map((game, index) => {
          const levelStyle = getLevelStyle(game.level)
          const progressValue = Math.min(Math.max(game.levelProgress, 0), 100)

          // 计算该游戏的折线图数据
          const gameData = game.items
          const maxY = Math.max(...gameData.map(p => Math.max(p.avg_standard_score, p.match_avg_score || 0))) || 1
          const points = gameData.map((pt, idx) => {
            const matchAvg = pt.match_avg_score ?? 0
            return {
              x: (idx / Math.max(gameData.length - 1, 1)) * 100,
              y: 100 - (pt.avg_standard_score / maxY) * 100,
              avgY: 100 - (matchAvg / maxY) * 100
            }
          })
          const poly = points.map(p => `${p.x},${p.y}`).join(' ')
          const avgPoly = points.map(p => `${p.x},${p.avgY}`).join(' ')

          // 计算排名趋势图数据（只包含有排名的数据点）
          const rankedData = gameData.filter(pt => pt.rank != null)
          const maxRank = Math.max(...rankedData.map(p => p.rank || 1)) || 1
          const rankPoints = rankedData.map((pt, idx) => ({
            x: (idx / Math.max(rankedData.length - 1, 1)) * 100,
            y: ((pt.rank || 1) - 1) / Math.max(maxRank - 1, 1) * 100
          }))
          // 越靠上越好：Y 轴 0 代表第一名，数值越大名次越靠后
          const rankPoly = rankPoints.map(p => `${p.x},${p.y}`).join(' ')

          return (
            <Card
              key={game.gameCode}
              className={`glass relative overflow-hidden ${index === 0 ? 'ring-2 ring-primary/20' : ''}`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center">
                      <span className="mr-2">{game.gameName}</span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs px-2 py-1 border-yellow-400 text-yellow-600">
                          最佳
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" strokeWidth={2} />
                        {game.matchCount} 场
                      </span>
                      <span className="flex items-center">
                        <Zap className="w-4 h-4 mr-1" strokeWidth={2} />
                        {game.avgScore.toFixed(1)} 标准分
                      </span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-full ${levelStyle.bgColor} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}>
                    {game.level}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 技能等级进度条 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">技能等级</span>
                    <span className={`font-semibold ${levelStyle.textColor}`}>{game.level} 级</span>
                  </div>
                  <div className="relative">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${levelStyle.bgColor}`}
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-foreground">
                        {progressValue.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {(() => {
                      const levels = ['D', 'C', 'B', 'A', 'S'];
                      const currentIndex = levels.indexOf(game.level);
                      const lower = currentIndex > 0 ? levels[currentIndex - 1] : '-';
                      const upper = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : '-';
                      return (
                        <>
                          <span>{lower}</span>
                          <span>{upper}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 标准分趋势图 */}
                <div className="pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">标准分趋势</span>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-primary"></div>
                        <span className="text-muted-foreground">选手</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-muted-foreground" style={{ borderTop: '1px dashed' }}></div>
                        <span className="text-muted-foreground">平均</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-32 relative bg-muted/5 rounded-lg p-2">
                    <svg viewBox="0 0 100 100" className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)]">
                      <defs>
                        <linearGradient id={`areaGradient-${game.gameCode}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-primary" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" className="text-primary" />
                        </linearGradient>
                      </defs>

                      {points.length > 1 && (
                        <>
                          {/* 填充区域 */}
                          <polygon points={`0,100 ${poly} 100,100`} fill={`url(#areaGradient-${game.gameCode})`} />
                          {/* 选手标准分线 */}
                          <polyline points={poly} fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
                          {/* 当届平均分线 */}
                          <polyline points={avgPoly} fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2,2" className="text-muted-foreground" />
                          {/* 数据点 */}
                          {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="1.2" className="text-primary" fill="currentColor" />
                          ))}
                        </>
                      )}
                    </svg>

                    {/* Y轴标签 */}
                    <div className="absolute left-0 top-2 bottom-2 flex flex-col justify-between text-[10px] text-muted-foreground">
                      <span>{maxY.toFixed(0)}</span>
                      <span>0</span>
                    </div>
                  </div>
                </div>

                {/* 排名趋势图 */}
                {rankPoints.length > 1 && (
                  <div className="pt-3 border-t border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">排名趋势</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" strokeWidth={2} />
                        <span>数值越小排名越靠前</span>
                      </div>
                    </div>
                    <div className="h-32 relative bg-muted/5 rounded-lg p-2">
                      <svg viewBox="0 0 100 100" className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)]">
                        <defs>
                          <linearGradient id={`rankGradient-${game.gameCode}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-primary" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" className="text-primary" />
                          </linearGradient>
                        </defs>

                        {rankPoints.length > 1 && (
                          <>
                            {/* 填充区域 */}
                            <polygon points={`0,100 ${rankPoly} 100,100`} fill={`url(#rankGradient-${game.gameCode})`} />
                            {/* 排名线 */}
                            <polyline points={rankPoly} fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary" />
                            {/* 数据点 */}
                            {rankPoints.map((p, i) => (
                              <circle key={i} cx={p.x} cy={p.y} r="1.2" className="text-primary" fill="currentColor" />
                            ))}
                          </>
                        )}
                      </svg>

                      {/* Y轴标签 */}
                      <div className="absolute left-0 top-2 bottom-2 flex flex-col justify-between text-[10px] text-muted-foreground">
                        <span>1</span>
                        <span>{maxRank}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
