'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { AdminNav } from '@/components/admin-nav';
import { adminAPI, Game } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminGamesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout } = useAdminAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    tagline: '',
    rule: '',
    image_url: '',
    season_label: '',
    seasonal: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadGames();
    }
  }, [isAuthenticated]);

  const loadGames = async () => {
    try {
      const data = await adminAPI.getGames();
      setGames(data);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGame) {
        await adminAPI.updateGame(editingGame.id, formData);
      } else {
        await adminAPI.createGame(formData);
      }
      setIsDialogOpen(false);
      setEditingGame(null);
      setFormData({ name: '', code: '', description: '', tagline: '', rule: '', image_url: '', season_label: '', seasonal: false });
      loadGames();
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      code: game.code,
      description: game.description || '',
      tagline: game.tagline || '',
      rule: game.rule || '',
      image_url: game.image_url || '',
      season_label: game.season_label || '',
      seasonal: game.seasonal,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个比赛项目吗？')) return;
    try {
      await adminAPI.deleteGame(id);
      loadGames();
    } catch (error) {
      console.error('Failed to delete game:', error);
      alert('删除失败，请重试');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await adminAPI.exportGamesCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `games_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('导出失败，请重试');
    }
  };

  const handleExportJSON = async () => {
    try {
      const blob = await adminAPI.exportGamesJSON();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `games_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export JSON:', error);
      alert('导出失败，请重试');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await adminAPI.importGamesCSV(file);
      alert(`导入成功！\n创建: ${result.created}\n更新: ${result.updated}\n错误: ${result.errors.length}`);
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
      }
      loadGames();
    } catch (error) {
      console.error('Failed to import CSV:', error);
      alert('导入失败，请重试');
    }
    e.target.value = '';
  };

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />

      {/* 主内容 */}
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">比赛项目管理</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>导出 CSV</Button>
            <Button variant="outline" onClick={handleExportJSON}>导出 JSON</Button>
            <label className="cursor-pointer">
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                导入 CSV
              </span>
              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingGame(null); setFormData({ name: '', code: '', description: '', tagline: '', rule: '', image_url: '', season_label: '', seasonal: false }); }}>
                  新建项目
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGame ? '编辑项目' : '新建项目'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">项目名称</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="code">项目代码</Label>
                    <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="tagline">一句话简介</Label>
                    <Input id="tagline" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="例如：快节奏的资源争夺战" />
                  </div>
                  <div>
                    <Label htmlFor="description">项目介绍</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="season_label">季节标签（如夏日限定）</Label>
                    <Input id="season_label" value={formData.season_label} onChange={(e) => setFormData({ ...formData, season_label: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="image_url">封面图 URL</Label>
                    <Input id="image_url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://example.com/image.png" />
                  </div>
                  <div>
                    <Label htmlFor="rule">规则 / 玩法说明（Markdown）</Label>
                    <textarea
                      id="rule"
                      className="mt-1 w-full rounded-md border border-input bg-transparent p-2 text-sm"
                      rows={6}
                      value={formData.rule}
                      onChange={(e) => setFormData({ ...formData, rule: e.target.value })}
                      placeholder="使用 Markdown 描述玩法：\n## 阶段一\n- ..."
                    />
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="seasonal" checked={formData.seasonal} onChange={(e) => setFormData({ ...formData, seasonal: e.target.checked })} className="mr-2" />
                    <Label htmlFor="seasonal">季节/活动限定</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                    <Button type="submit">保存</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">代码</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">简介</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">季节标签</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">封面</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{game.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{game.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{game.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{game.tagline || game.description || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{game.seasonal ? (game.season_label || '季节限定') : '常驻'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {game.image_url ? (
                      <img src={game.image_url} alt={game.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(game)}>编辑</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(game.id)} className="text-red-600 hover:text-red-900">删除</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
