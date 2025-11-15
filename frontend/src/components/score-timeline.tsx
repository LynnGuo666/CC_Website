'use client'

import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type TimelineItem = {
  match_id: number
  match_name: string
  timestamp: string | null
  avg_standard_score: number
  rank?: number | null
  rank_change?: number | null
  score_delta?: number | null
  game_name?: string
}

type Props = {
  scoreTimeline: TimelineItem[]
  scoreTimelineByGame: Record<string, TimelineItem[]>
}

export default function ScoreTimeline({ scoreTimeline, scoreTimelineByGame }: Props) {
  const [selectedCode, setSelectedCode] = useState<string>('__all__')

  const gameOptions = useMemo(() => Object.entries(scoreTimelineByGame), [scoreTimelineByGame])

  const data = useMemo(() => {
    if (selectedCode === '__all__') return scoreTimeline || []
    return scoreTimelineByGame[selectedCode] || []
  }, [selectedCode, scoreTimeline, scoreTimelineByGame])

  const maxY = useMemo(() => {
    const base = data.length ? data : scoreTimeline
    return Math.max(...(base.map(p => p.avg_standard_score || 1))) || 1
  }, [data, scoreTimeline])

  const points = useMemo(() => {
    const base = data.length ? data : scoreTimeline
    return base.map((pt, idx) => ({
      x: (idx / Math.max(base.length - 1, 1)) * 100,
      y: 50 - (pt.avg_standard_score / maxY) * 50,
    }))
  }, [data, scoreTimeline, maxY])

  const poly = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">标准分趋势</h2>
        {gameOptions.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">筛选游戏:</span>
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部</SelectItem>
                {gameOptions.map(([code, items]) => (
                  <SelectItem key={code} value={code}>
                    {items?.[0]?.game_name || code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card className="glass-card p-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="h-64 relative bg-muted/5 rounded-xl p-4">
              <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
                {/* 网格线 */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-muted-foreground/20" />
                  </pattern>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className="text-primary" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" className="text-primary" />
                  </linearGradient>
                </defs>

                {/* 背景网格 */}
                <rect width="100" height="50" fill="url(#grid)" />

                {/* 渐变填充区域 */}
                {points.length > 1 && (
                  <polygon
                    points={`0,50 ${poly} 100,50`}
                    fill="url(#areaGradient)"
                  />
                )}

                {/* 主线条 */}
                {points.length > 1 && (
                  <polyline
                    points={poly}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary drop-shadow-lg"
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                {/* 数据点 */}
                {points.map((p, i) => (
                  <g key={i}>
                    {/* 外圈光晕 */}
                    <circle cx={p.x} cy={p.y} r="0.8" className="text-primary/20" fill="currentColor" vectorEffect="non-scaling-stroke" />
                    {/* 主圆点 */}
                    <circle cx={p.x} cy={p.y} r="0.5" className="text-primary" fill="currentColor" stroke="white" strokeWidth="0.15" vectorEffect="non-scaling-stroke" />
                  </g>
                ))}
              </svg>

              {/* Y轴标签 */}
              <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-muted-foreground">
                <span>{maxY.toFixed(0)}</span>
                <span>{(maxY * 0.5).toFixed(0)}</span>
                <span>0</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.length ? data : scoreTimeline).map((pt, i) => {
                // 格式化日期为 YYYY-MM-DD 格式，避免 hydration 错误
                const formattedDate = pt.timestamp
                  ? new Date(pt.timestamp).toISOString().split('T')[0]
                  : '';

                return (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded-md border border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pt.match_name}</span>
                    <span className="text-muted-foreground">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono">{pt.avg_standard_score.toFixed(1)} 分</span>
                    {typeof pt.rank === 'number' && (
                      <span className="text-xs text-muted-foreground">第 {pt.rank} 名</span>
                    )}
                    {typeof pt.rank_change === 'number' && (
                      <Badge variant={pt.rank_change > 0 ? 'secondary' : pt.rank_change < 0 ? 'destructive' : 'outline'}>
                        {pt.rank_change > 0 ? `↑ +${pt.rank_change}` : pt.rank_change < 0 ? `↓ ${pt.rank_change}` : '—'}
                      </Badge>
                    )}
                    {typeof pt.score_delta === 'number' && (
                      <Badge variant={pt.score_delta >= 0 ? 'secondary' : 'destructive'}>
                        {pt.score_delta >= 0 ? `+${pt.score_delta.toFixed(1)}` : pt.score_delta.toFixed(1)} 分
                      </Badge>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
