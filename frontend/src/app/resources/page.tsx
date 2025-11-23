import { getApiBaseUrl } from '@/config/env';
import { Film } from 'lucide-react';
import { HeroSection } from '@/components/hero-section';
import { LiquidBackground } from '@/components/ui/liquid-background';
import { MatchVideoSection } from './match-video-section';

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

interface MatchWithVideos {
    match: Match;
    videos: Video[];
}

export default async function ResourcesPage() {
    let matchesWithVideos: MatchWithVideos[] = [];
    let error: string | null = null;
    let totalVideos = 0;

    try {
        const baseUrl = getApiBaseUrl();
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

        // 获取所有赛事
        const matchesResponse = await fetch(`${normalizedBase}/api/matches/`, {
            cache: 'no-store'
        });

        if (!matchesResponse.ok) {
            throw new Error('获取赛事列表失败');
        }

        const matches: Match[] = await matchesResponse.json();

        // 为每个赛事获取视频
        const videoPromises = matches.map(async (match) => {
            try {
                const videosResponse = await fetch(`${normalizedBase}/api/matches/${match.id}/videos`, {
                    cache: 'no-store'
                });

                if (videosResponse.ok) {
                    const videos: Video[] = await videosResponse.json();
                    return { match, videos };
                }
                return { match, videos: [] };
            } catch (e) {
                return { match, videos: [] };
            }
        });

        const results = await Promise.all(videoPromises);

        // 只保留有视频的赛事，并按赛事开始时间倒序排序
        matchesWithVideos = results
            .filter(item => item.videos.length > 0)
            .sort((a, b) => {
                const timeA = a.match.start_time ? new Date(a.match.start_time).getTime() : 0;
                const timeB = b.match.start_time ? new Date(b.match.start_time).getTime() : 0;
                return timeB - timeA;
            });

        totalVideos = matchesWithVideos.reduce((sum, item) => sum + item.videos.length, 0);

    } catch (e: any) {
        console.error(e);
        error = e.message || '加载资源失败。';
    }

    if (error) {
        return (
            <div className="min-h-screen">
                <LiquidBackground />
                <main className="container mx-auto p-4 pt-32">
                    <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 glass">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <p className="text-destructive font-medium">{error}</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <LiquidBackground />

            <HeroSection
                title="赛事资源库"
                subtitle={`探索历届赛事的精彩视频回放，共 ${matchesWithVideos.length} 届赛事 · ${totalVideos} 个视频`}
                className="pt-40 pb-20"
            />

            <section className="section-shell">
                <div className="max-w-7xl mx-auto">
                    {matchesWithVideos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground glass rounded-2xl p-12">
                            <Film className="w-20 h-20 opacity-20 mb-4" />
                            <p className="text-lg">暂无视频资源</p>
                            <p className="text-sm mt-2">敬请期待更多精彩内容</p>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {matchesWithVideos.map(({ match, videos }) => (
                                <MatchVideoSection key={match.id} match={match} videos={videos} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
