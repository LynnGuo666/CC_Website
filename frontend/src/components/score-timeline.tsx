'use client'

import React, { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      y: 100 - (pt.avg_standard_score / maxY) * 100,
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
            <select
              id="timeline_game_filter"
              name="timeline_game_filter"
              className="px-3 py-1 rounded-md border bg-background"
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              <option value="__all__">全部</option>
              {gameOptions.map(([code, items]) => (
                <option key={code} value={code}>
                  {items?.[0]?.game_name || code}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Card className="glass p-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="h-40 relative">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                {points.length > 1 && (
                  <polyline points={poly} fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
                )}
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1.2" className="text-primary" fill="currentColor" />
                ))}
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.length ? data : scoreTimeline).map((pt, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded-md border border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pt.match_name}</span>
                    <span className="text-muted-foreground">{pt.timestamp ? new Date(pt.timestamp).toLocaleDateString() : ''}</span>
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
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}


