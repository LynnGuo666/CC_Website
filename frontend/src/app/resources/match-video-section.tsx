"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, User, Film, Trophy, Filter } from 'lucide-react';
import { getApiBaseUrl } from '@/config/env';

interface Video {
    id: number;
    match_id: number;
    match_game_id?: number | null;
    user_id?: number | null;
    title: string;
    url: string;
    platform: 'bilibili' | 'youtube' | 'twitch' | 'douyu' | 'huya' | 'other';
    video_type: 'livestream' | 'replay' | 'highlight';
    is_official: boolean;
    uploader_name?: string | null;
    description?: string | null;
    duration?: number | null;
    thumbnail_url?: string | null;
    view_count: number;
    published_at?: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        nickname: string;
        display_name?: string;
    } | null;
    match_game?: {
        id: number;
        game_name: string;
    } | null;
}

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

// 格式化时长
function formatDuration(seconds?: number | null): string {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// 格式化观看次数
function formatViewCount(count?: number | null): string {
    if (!count) return '0';
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toString();
}

// 获取平台名称
function getPlatformName(platform: string): string {
    const platformMap: Record<string, string> = {
        bilibili: 'Bilibili',
        youtube: 'YouTube',
        twitch: 'Twitch',
        douyu: '斗鱼',
        huya: '虎牙',
        other: '其他'
    };
    return platformMap[platform] || platform;
}

// 获取视频类型名称
function getVideoTypeName(type: string): string {
    const typeMap: Record<string, string> = {
        livestream: '直播',
        replay: '录播',
        highlight: '集锦'
    };
    return typeMap[type] || type;
}

// 获取平台颜色
function getPlatformColor(platform: string): string {
    const colorMap: Record<string, string> = {
        bilibili: 'bg-pink-500',
        youtube: 'bg-red-500',
        twitch: 'bg-purple-500',
        douyu: 'bg-orange-500',
        huya: 'bg-yellow-500',
        other: 'bg-gray-500'
    };
    return colorMap[platform] || 'bg-gray-500';
}

// 处理缩略图URL
const getThumbnailUrl = (url?: string | null) => {
    if (!url) return undefined;
    const apiUrl = getApiBaseUrl();
    const normalizedBase = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    if (url.startsWith('/api/')) return `${normalizedBase}${url}`;
    if (url.includes('hdslb.com') || url.includes('bilibili.com')) {
        return `${normalizedBase}/api/admin/matches/videos/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
};

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
                        <VideoCard key={video.id} video={video} />
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

function VideoCard({ video }: { video: Video }) {
    return (
        <Card className="glass card-hover overflow-hidden group h-full flex flex-col">
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
                {/* 缩略图 */}
                <div className="aspect-video w-full bg-muted relative overflow-hidden shrink-0">
                    {video.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={getThumbnailUrl(video.thumbnail_url)}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Film className="w-12 h-12 opacity-20" />
                        </div>
                    )}

                    {/* 时长标签 */}
                    {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                        </div>
                    )}

                    {/* 平台标签 */}
                    <div className={`absolute top-2 left-2 ${getPlatformColor(video.platform)} text-white text-xs px-2 py-1 rounded`}>
                        {getPlatformName(video.platform)}
                    </div>

                    {/* 官方/选手 标记 */}
                    {video.is_official && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium shadow-sm">
                            官方
                        </div>
                    )}
                    {!video.is_official && video.user_id && (
                        <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded font-medium shadow-sm">
                            选手视角
                        </div>
                    )}
                </div>

                <CardContent className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {video.title}
                    </h3>

                    <div className="mt-auto space-y-2">
                        {/* 上传者/选手信息 */}
                        <div className="flex items-center text-xs text-muted-foreground">
                            <User className="w-3 h-3 mr-1 shrink-0" />
                            <span className="truncate">
                                {video.user ? (
                                    <span className="text-primary font-medium">
                                        {video.user.display_name || video.user.nickname}
                                    </span>
                                ) : (
                                    video.uploader_name || '未知上传者'
                                )}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {video.view_count > 0 && (
                                <span className="flex items-center">
                                    <Eye className="w-3 h-3 mr-1" />
                                    {formatViewCount(video.view_count)}
                                </span>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                    {getVideoTypeName(video.video_type)}
                                </Badge>
                                <ExternalLink className="w-3 h-3 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </a>
        </Card>
    );
}
