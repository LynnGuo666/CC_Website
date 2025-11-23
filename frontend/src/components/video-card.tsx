import React from 'react';
import { Play, ExternalLink, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getApiBaseUrl } from '@/config/env';

export interface Video {
    id: number;
    title: string;
    url: string;
    platform: 'bilibili' | 'youtube' | 'twitch' | 'douyu' | 'huya' | 'other';
    video_type: 'livestream' | 'replay' | 'highlight';
    is_official: boolean;
    uploader_name?: string;
    thumbnail_url?: string;
    view_count?: number;
    duration?: number;
    user?: {
        id: number;
        nickname: string;
        display_name?: string;
    };
    team?: {
        id: number;
        name: string;
        color?: string;
    };
    match_game?: {
        id: number;
        game_name: string;
    };
    user_id?: number;
    published_at?: string;
}

interface VideoCardProps {
    video: Video;
    className?: string;
}

const PlatformBadge = ({ platform }: { platform: string }) => {
    const styles = {
        bilibili: "bg-pink-500/20 text-pink-500 border-pink-500/50 hover:bg-pink-500/30",
        youtube: "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30",
        twitch: "bg-purple-500/20 text-purple-500 border-purple-500/50 hover:bg-purple-500/30",
        douyu: "bg-orange-500/20 text-orange-500 border-orange-500/50 hover:bg-orange-500/30",
        huya: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/30",
        other: "bg-gray-500/20 text-gray-500 border-gray-500/50 hover:bg-gray-500/30",
    };

    const labels = {
        bilibili: "Bilibili",
        youtube: "YouTube",
        twitch: "Twitch",
        douyu: "Douyu",
        huya: "Huya",
        other: "Link",
    };

    const key = platform.toLowerCase() as keyof typeof styles;

    return (
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", styles[key] || styles.other)}>
            {labels[key] || labels.other}
        </Badge>
    );
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatViews = (views?: number) => {
    if (!views) return null;
    if (views >= 10000) return `${(views / 10000).toFixed(1)}w`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
};

export function VideoCard({ video, className }: VideoCardProps) {
    const baseUrl = getApiBaseUrl();
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // 处理缩略图URL - 如果是Bilibili图片且不是代理URL，则使用代理
    const getThumbnailUrl = (url?: string) => {
        if (!url) return url;
        // 如果已经是完整的URL（包含http），直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // 如果是B站图片，需要代理
            if (url.includes('hdslb.com') || url.includes('bilibili.com')) {
                return `${normalizedBase}/api/admin/matches/videos/proxy-image?url=${encodeURIComponent(url)}`;
            }
            return url;
        }
        // 如果是相对路径的代理URL，添加API基础URL
        if (url.startsWith('/api/')) {
            return `${normalizedBase}${url}`;
        }
        return url;
    };

    const thumbnailUrl = getThumbnailUrl(video.thumbnail_url);

    const handlePlayerClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = `/player/${video.user?.id}`;
    };

    return (
        <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/50 transition-all hover:border-primary/50 hover:bg-card hover:-translate-y-1",
                className
            )}
        >
            {/* Thumbnail Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                        <Play className="h-12 w-12" />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Platform Badge */}
                <div className="absolute top-2 left-2">
                    <PlatformBadge platform={video.platform} />
                </div>

                {/* Duration */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                    </div>
                )}

                {/* Uploader Name - Bottom Left */}
                {video.uploader_name && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
                        <span className="truncate max-w-[150px]">{video.uploader_name}</span>
                    </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Play className="h-6 w-6 fill-white text-white ml-1" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary mb-2" title={video.title}>
                    {video.title}
                </h3>

                {/* Player Info Section - Show for player perspective videos */}
                {video.user_id && video.user && (
                    <div
                        onClick={handlePlayerClick}
                        className="mb-2 flex items-center gap-2 rounded-lg bg-primary/5 hover:bg-primary/10 px-2 py-1.5 transition-colors border border-primary/10 hover:border-primary/20 cursor-pointer"
                    >
                        <span className="text-xs font-semibold text-foreground truncate">
                            {video.user.display_name || video.user.nickname}
                        </span>
                        {video.team && (
                            <div className="flex items-center gap-1 ml-auto">
                                <span className="text-xs text-muted-foreground">·</span>
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: video.team.color || '#6b7280' }}
                                />
                                <span className="text-xs text-foreground font-medium truncate">
                                    {video.team.name}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {video.view_count !== undefined && video.view_count > 0 && (
                    <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {formatViews(video.view_count)}
                    </div>
                )}
            </div>
        </a>
    );
}
