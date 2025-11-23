'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminNav } from '@/components/admin-nav';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { adminAPI, AdminMatch, MatchVideo, MatchVideoPayload } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/env';

export default function AdminMatchVideosPage() {
    const router = useRouter();
    const params = useParams();
    const matchId = Number(params.id);

    const { user, loading: authLoading, isAuthenticated } = useAdminAuth();
    const [match, setMatch] = useState<AdminMatch | null>(null);
    const [videos, setVideos] = useState<MatchVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<MatchVideo | null>(null);

    const [players, setPlayers] = useState<Array<{ id: number; display_name?: string; nickname: string }>>([]);
    const [fetchingVideoInfo, setFetchingVideoInfo] = useState(false);
    const [formData, setFormData] = useState<MatchVideoPayload>({
        title: '',
        url: '',
        platform: 'bilibili',
        video_type: 'replay',
        is_official: false,
        uploader_name: '',
        description: '',
        user_id: undefined,
        thumbnail_url: undefined,
        duration: undefined,
        view_count: undefined,
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/admin/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && matchId) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, matchId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load match details to verify it exists and get name
            const matches = await adminAPI.getMatches(); // Ideally we should have getMatch(id)
            const foundMatch = matches.find(m => m.id === matchId);
            if (foundMatch) {
                setMatch(foundMatch);
            } else {
                // Fallback or error
            }

            const videosData = await adminAPI.getMatchVideos(matchId);
            setVideos(videosData);

            // Load all players for selection
            const response = await fetch(`${API_BASE_URL}/api/users`);
            if (response.ok) {
                const playersData = await response.json();
                setPlayers(playersData);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await adminAPI.updateMatchVideo(editing.id, formData);
            } else {
                await adminAPI.createMatchVideo(matchId, formData);
            }
            setDialogOpen(false);
            setEditing(null);
            resetForm();
            loadData();
        } catch (error) {
            alert('保存失败，请重试');
            console.error('save video failed', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这个视频吗？')) return;
        try {
            await adminAPI.deleteMatchVideo(id);
            loadData();
        } catch (error) {
            alert('删除失败，请重试');
            console.error('delete video failed', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            url: '',
            platform: 'bilibili',
            video_type: 'replay',
            is_official: false,
            uploader_name: '',
            description: '',
            user_id: undefined,
            thumbnail_url: undefined,
            duration: undefined,
            view_count: undefined,
        });
    };

    const handleEdit = (video: MatchVideo) => {
        setEditing(video);
        setFormData({
            title: video.title,
            url: video.url,
            platform: video.platform,
            video_type: video.video_type,
            is_official: video.is_official,
            uploader_name: video.uploader_name || '',
            description: video.description || '',
            match_game_id: video.match_game_id || undefined,
            user_id: video.user_id || undefined,
            thumbnail_url: video.thumbnail_url || undefined,
            duration: video.duration || undefined,
            view_count: video.view_count || undefined,
        });
        setDialogOpen(true);
    };

    // Auto-detect platform from URL
    const handleUrlChange = (url: string) => {
        let platform = formData.platform;
        if (url.includes('bilibili.com') || url.includes('b23.tv')) {
            platform = 'bilibili';
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = 'youtube';
        } else if (url.includes('twitch.tv')) {
            platform = 'twitch';
        } else if (url.includes('douyu.com')) {
            platform = 'douyu';
        } else if (url.includes('huya.com')) {
            platform = 'huya';
        }
        setFormData({ ...formData, url, platform });
    };

    // Manually fetch Bilibili video info
    const handleFetchBilibiliInfo = async () => {
        if (!formData.url) {
            alert('请先输入视频链接');
            return;
        }

        if (!formData.url.includes('bilibili.com') && !formData.url.includes('b23.tv')) {
            alert('仅支持Bilibili视频链接');
            return;
        }

        setFetchingVideoInfo(true);
        try {
            const response = await adminAPI.getBilibiliVideoInfo(formData.url);
            setFormData({
                ...formData,
                title: response.title || formData.title,
                description: response.description || formData.description,
                thumbnail_url: response.thumbnail_url || formData.thumbnail_url,
                duration: response.duration || formData.duration,
                uploader_name: response.uploader_name || formData.uploader_name,
                view_count: response.view_count || formData.view_count,
            });
        } catch (error) {
            console.error('获取Bilibili视频信息失败:', error);
            alert('获取视频信息失败，请检查链接是否正确');
        } finally {
            setFetchingVideoInfo(false);
        }
    };

    if (authLoading || loading) {
        return <div className="flex min-h-screen items-center justify-center">加载中...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminNav />
            <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href="/admin/matches" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        返回赛事列表
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                视频管理 - {match?.name || `赛事 #${matchId}`}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">管理该赛事的录播、直播和集锦</p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => { setEditing(null); resetForm(); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    添加视频
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                                <DialogHeader className="flex-shrink-0">
                                    <DialogTitle>{editing ? '编辑视频' : '添加视频'}</DialogTitle>
                                </DialogHeader>
                                <form id="video-form" className="space-y-4 overflow-y-auto flex-1 pr-2" onSubmit={handleSave}>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="col-span-2">
                                            <Label htmlFor="url">视频链接</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="url"
                                                    required
                                                    placeholder="https://..."
                                                    value={formData.url}
                                                    onChange={(e) => handleUrlChange(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleFetchBilibiliInfo}
                                                    disabled={fetchingVideoInfo || !formData.url || formData.platform !== 'bilibili'}
                                                    className="shrink-0"
                                                >
                                                    {fetchingVideoInfo ? (
                                                        <>
                                                            <Download className="h-4 w-4 mr-2 animate-spin" />
                                                            识别中...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            识别视频
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            {formData.platform === 'bilibili' && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    检测到Bilibili链接，点击&ldquo;识别视频&rdquo;按钮自动填充视频信息
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="title">标题</Label>
                                            <Input
                                                id="title"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="platform">平台</Label>
                                            <select
                                                id="platform"
                                                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                                                value={formData.platform}
                                                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                            >
                                                <option value="bilibili">Bilibili</option>
                                                <option value="youtube">YouTube</option>
                                                <option value="twitch">Twitch</option>
                                                <option value="douyu">斗鱼</option>
                                                <option value="huya">虎牙</option>
                                                <option value="other">其他</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="video_type">类型</Label>
                                            <select
                                                id="video_type"
                                                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                                                value={formData.video_type}
                                                onChange={(e) => setFormData({ ...formData, video_type: e.target.value })}
                                            >
                                                <option value="replay">录播 (Replay)</option>
                                                <option value="livestream">直播 (Livestream)</option>
                                                <option value="highlight">集锦 (Highlight)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="uploader_name">上传者/主播名称</Label>
                                            <Input
                                                id="uploader_name"
                                                value={formData.uploader_name || ''}
                                                onChange={(e) => setFormData({ ...formData, uploader_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="duration">时长（秒）</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={formData.duration || ''}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value ? Number(e.target.value) : undefined })}
                                                placeholder="自动识别或手动输入"
                                            />
                                            {formData.duration && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    约 {Math.floor(formData.duration / 60)} 分钟 {formData.duration % 60} 秒
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="view_count">观看数</Label>
                                            <Input
                                                id="view_count"
                                                type="number"
                                                value={formData.view_count || ''}
                                                onChange={(e) => setFormData({ ...formData, view_count: e.target.value ? Number(e.target.value) : undefined })}
                                                placeholder="自动识别或手动输入"
                                            />
                                            {formData.view_count && formData.view_count >= 10000 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    约 {(formData.view_count / 10000).toFixed(1)} 万次观看
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="thumbnail_url">缩略图URL</Label>
                                            <Input
                                                id="thumbnail_url"
                                                value={formData.thumbnail_url || ''}
                                                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                                placeholder="自动识别或手动输入"
                                            />
                                            {formData.thumbnail_url && (
                                                <div className="mt-2">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={
                                                            formData.thumbnail_url.startsWith('http://') || formData.thumbnail_url.startsWith('https://')
                                                                ? formData.thumbnail_url.includes('hdslb.com') || formData.thumbnail_url.includes('bilibili.com')
                                                                    ? `${API_BASE_URL}/api/admin/matches/videos/proxy-image?url=${encodeURIComponent(formData.thumbnail_url)}`
                                                                    : formData.thumbnail_url
                                                                : formData.thumbnail_url.startsWith('/api/')
                                                                    ? `${API_BASE_URL}${formData.thumbnail_url}`
                                                                    : formData.thumbnail_url
                                                        }
                                                        alt="缩略图预览"
                                                        className="w-full h-auto max-h-48 object-contain rounded border"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="user_id">关联选手（选手视角）</Label>
                                            <select
                                                id="user_id"
                                                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                                                value={formData.user_id || ''}
                                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value ? Number(e.target.value) : undefined })}
                                            >
                                                <option value="">无（非选手视角）</option>
                                                {players.map((player) => (
                                                    <option key={player.id} value={player.id}>
                                                        {player.display_name || player.nickname}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 pt-8">
                                            <input
                                                id="is_official"
                                                type="checkbox"
                                                checked={formData.is_official}
                                                onChange={(e) => setFormData({ ...formData, is_official: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="is_official">官方视频</Label>
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="description">描述</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description || ''}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </form>
                                <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                                    <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>取消</Button>
                                    <Button type="submit" form="video-form">保存</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => {
                        // 处理缩略图URL - Bilibili图片使用代理
                        const getThumbnailUrl = (url?: string | null) => {
                            if (!url) return undefined;
                            if (url.startsWith('/api/')) return `${API_BASE_URL}${url}`;
                            if (url.includes('hdslb.com') || url.includes('bilibili.com')) {
                                return `${API_BASE_URL}/api/admin/matches/videos/proxy-image?url=${encodeURIComponent(url)}`;
                            }
                            return url;
                        };
                        const thumbnailUrl = getThumbnailUrl(video.thumbnail_url);

                        return (
                            <div key={video.id} className="relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                <div className="aspect-video w-full bg-gray-100 dark:bg-gray-900 relative group">
                                    {thumbnailUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            No Thumbnail
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(video)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(video.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold text-sm line-clamp-2" title={video.title}>{video.title}</h3>
                                        <Badge variant="outline" className="shrink-0">{video.platform}</Badge>
                                    </div>
                                    {video.user && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            👤 {video.user.display_name || video.user.nickname}
                                        </div>
                                    )}
                                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            {video.is_official && <Badge variant="secondary" className="text-[10px] h-5 px-1">官方</Badge>}
                                            {video.user_id && <Badge variant="outline" className="text-[10px] h-5 px-1">选手视角</Badge>}
                                            <span>{video.video_type}</span>
                                        </div>
                                        <a href={video.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {videos.length === 0 && (
                        <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed text-gray-500">
                            暂无视频，点击上方按钮添加
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
