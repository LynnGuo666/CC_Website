"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Trophy, Filter } from 'lucide-react';
import { VideoCard, type Video } from '@/components/video-card';

interface Match {
    id: number;
    name: string;
    description?: string | null;
    status: string;
    start_time?: string | null;
}

interface MatchVideoSectionProps {
    match: Match;
    videos: Video[];
}

export function MatchVideoSection({ match, videos }: MatchVideoSectionProps) {
    const [filter, setFilter] = useState<'all' | 'official' | 'player' | 'other'>('all');

    const filteredVideos = videos.filter(video => {
        if (filter === 'all') return true;
        if (filter === 'official') return video.is_official;
        if (filter === 'player') return !video.is_official && video.user_id;
        if (filter === 'other') return !video.is_official && !video.user_id;
        return true;
    });

    return (
        <div id={`match-${match.id}`} className="space-y-6 scroll-mt-24">
            {/* 赛事标题和筛选器 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-primary shrink-0" />
                    <div>
                        <Link
                            href={`/matches/${match.id}`}
                            className="text-2xl sm:text-3xl font-bold hover:text-primary transition-colors"
                        >
                            {match.name}
                        </Link>
                        {match.start_time && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {new Date(match.start_time).toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={filter === 'all' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className="rounded-full"
                    >
                        全部 ({videos.length})
                    </Button>
                    <Button
                        variant={filter === 'official' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter('official')}
                        className="rounded-full"
                    >
                        官方 ({videos.filter(v => v.is_official).length})
                    </Button>
                    <Button
                        variant={filter === 'player' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter('player')}
                        className="rounded-full"
                    >
                        选手 ({videos.filter(v => !v.is_official && v.user_id).length})
                    </Button>
                    <Button
                        variant={filter === 'other' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter('other')}
                        className="rounded-full"
                    >
                        其他 ({videos.filter(v => !v.is_official && !v.user_id).length})
                    </Button>
                </div>
            </div>

            {/* 视频网格 */}
            {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredVideos.map((video) => (
                        <VideoCard key={video.id} video={video} className="h-full" />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-muted">
                    <Filter className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>该分类下暂无视频</p>
                </div>
            )}

            <div className="border-t border-border/50 pt-4"></div>
        </div>
    );
}
