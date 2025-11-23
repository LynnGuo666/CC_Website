"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VideoCard, Video } from '@/components/video-card';
import { cn } from '@/lib/utils';
import { Loader2, Video as VideoIcon, Film, User, Globe } from 'lucide-react';
import { API_BASE_URL } from '@/config/env';

interface VideoModalProps {
    matchId: number;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

// Assuming VideoType is intended to be 'official' | 'player' based on existing tabs
type VideoType = 'official' | 'player';

export function VideoModal({ matchId, trigger, open, onOpenChange }: VideoModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<VideoType | 'other'>('official'); // Changed initial state to 'official' to match existing tabs, as 'replay' is not a valid tab ID.

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

    useEffect(() => {
        if (isOpen && matchId) {
            fetchVideos();
        }
    }, [isOpen, matchId]);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/matches/${matchId}/videos`);
            if (res.ok) {
                const data = await res.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVideos = videos.filter(video => {
        if (activeTab === 'official') return video.is_official;
        if (activeTab === 'player') return !video.is_official && video.user_id;
        return !video.is_official && !video.user_id;
    });

    // 计算每个标签的视频数量
    const officialCount = videos.filter(v => v.is_official).length;
    const playerCount = videos.filter(v => !v.is_official && v.user_id).length;
    const otherCount = videos.filter(v => !v.is_official && !v.user_id).length;

    const tabs = [
        { id: 'official', label: '官方录播', icon: Film, count: officialCount },
        { id: 'player', label: '选手视角', icon: User, count: playerCount },
        { id: 'other', label: '二创/其他', icon: Globe, count: otherCount },
    ] as const;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger !== null && (
                <DialogTrigger asChild>
                    {trigger || (
                        <button className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                            <VideoIcon className="h-4 w-4" />
                            赛事回放
                        </button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[85vh] bg-background border-border shadow-2xl flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
                        <VideoIcon className="h-5 w-5 text-primary" />
                        赛事视频库
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                    {/* Tabs */}
                    <div className="mb-6 flex space-x-2 border-b border-border flex-shrink-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded-full",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {tab.count}
                                    </span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-[300px] pr-2">
                        {loading ? (
                            <div className="flex h-[300px] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredVideos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
                                {filteredVideos.map((video) => (
                                    <VideoCard key={video.id} video={video} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground/50">
                                <VideoIcon className="mb-4 h-12 w-12 opacity-20" />
                                <p>暂无{tabs.find(t => t.id === activeTab)?.label}视频</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
