'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin-nav';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { adminAPI, AdminMatch, AdminMatchPayload, AdminMatchStatus } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const statusLabels: Record<AdminMatchStatus, string> = {
  preparing: '准备中',
  ongoing: '进行中',
  finished: '已结束',
  cancelled: '已取消',
};

export default function AdminMatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAdminAuth();
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMatch | null>(null);
  const [importingMatch, setImportingMatch] = useState<AdminMatch | null>(null);
  const [formData, setFormData] = useState<AdminMatchPayload>({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    status: 'preparing',
    prize_pool: '',
    max_teams: undefined,
    max_players_per_team: 4,
    allow_substitutes: true,
  });
  const [importOptions, setImportOptions] = useState({
    clearExisting: false,
    recalc: false,
    tournamentStage: '',
    eventType: 'game_score',
  });
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMatches();
    }
  }, [isAuthenticated]);

  const loadMatches = async () => {
    try {
      const data = await adminAPI.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AdminMatchPayload = {
      ...formData,
      description: formData.description || undefined,
      start_time: formData.start_time || undefined,
      end_time: formData.end_time || undefined,
      prize_pool: formData.prize_pool || undefined,
      max_teams: formData.max_teams === undefined || formData.max_teams === null || Number.isNaN(formData.max_teams)
        ? undefined
        : formData.max_teams,
    };
    try {
      if (editing) {
        await adminAPI.updateMatch(editing.id, payload);
      } else {
        await adminAPI.createMatch(payload);
      }
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      loadMatches();
    } catch (error) {
      alert('保存失败，请重试');
      console.error('save match failed', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_time: '',
      end_time: '',
      status: 'preparing',
      prize_pool: '',
      max_teams: undefined,
      max_players_per_team: 4,
      allow_substitutes: true,
    });
  };

  const handleEdit = (match: AdminMatch) => {
    setEditing(match);
    setFormData({
      name: match.name,
      description: match.description || '',
      start_time: match.start_time ? match.start_time.slice(0, 16) : '',
      end_time: match.end_time ? match.end_time.slice(0, 16) : '',
      status: match.status,
      prize_pool: match.prize_pool || '',
      max_teams: match.max_teams ?? undefined,
      max_players_per_team: match.max_players_per_team,
      allow_substitutes: match.allow_substitutes,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这场比赛吗？该操作不可恢复。')) return;
    try {
      await adminAPI.deleteMatch(id);
      loadMatches();
    } catch (error) {
      alert('删除失败，请重试');
      console.error('delete match failed', error);
    }
  };

  const handleStatusChange = async (match: AdminMatch, action: 'start' | 'finish') => {
    try {
      if (action === 'start') {
        await adminAPI.startMatch(match.id);
      } else {
        await adminAPI.finishMatch(match.id);
      }
      loadMatches();
    } catch (error) {
      alert('状态更新失败');
      console.error('update status failed', error);
    }
  };

  const openImportDialog = (match: AdminMatch) => {
    setImportingMatch(match);
    setImportOptions({
      clearExisting: false,
      recalc: false,
      tournamentStage: '',
      eventType: 'game_score',
    });
    setImportFile(null);
    setImportDialogOpen(true);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !importingMatch) {
      alert('请选择要导入的 CSV 文件');
      return;
    }
    try {
      const result = await adminAPI.importScoreEvents(importingMatch.id, importFile, {
        clearExisting: importOptions.clearExisting,
        recalc: importOptions.recalc,
        tournamentStage: importOptions.tournamentStage || undefined,
        eventType: importOptions.eventType || undefined,
      });
      alert(`导入完成：成功 ${result.inserted} 条，跳过 ${result.skipped} 条。错误 ${result.errors.length} 条`);
      if (result.errors.length) {
        console.warn('Import errors', result.errors);
      }
      setImportDialogOpen(false);
    } catch (error) {
      alert('导入失败，请检查 CSV 格式');
      console.error('import score events failed', error);
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">锦标赛管理</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">创建、更新赛事并导入细粒度小分数据</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); resetForm(); }}>新建赛事</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? '编辑赛事' : '新建赛事'}</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSaveMatch}>
                <div>
                  <Label htmlFor="name">赛事名称</Label>
                  <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="start_time">开始时间</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time || ''}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">结束时间</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time || ''}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="status">状态</Label>
                    <select
                      id="status"
                      className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminMatchStatus })}
                    >
                      <option value="preparing">准备中</option>
                      <option value="ongoing">进行中</option>
                      <option value="finished">已结束</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="prize_pool">奖池/备注</Label>
                    <Input id="prize_pool" value={formData.prize_pool || ''} onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="max_teams">队伍数量上限</Label>
                    <Input
                      id="max_teams"
                      type="number"
                      value={formData.max_teams ?? ''}
                      onChange={(e) => setFormData({ ...formData, max_teams: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_players_per_team">每队最多人数</Label>
                    <Input
                      id="max_players_per_team"
                      type="number"
                      value={formData.max_players_per_team ?? ''}
                      onChange={(e) => setFormData({ ...formData, max_players_per_team: Number(e.target.value || 0) })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="allow_substitutes"
                    type="checkbox"
                    checked={formData.allow_substitutes}
                    onChange={(e) => setFormData({ ...formData, allow_substitutes: e.target.checked })}
                  />
                  <Label htmlFor="allow_substitutes">允许替补</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>取消</Button>
                  <Button type="submit">保存</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">赛事</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-800/60">
              {matches.map((m) => (
                <tr key={m.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {m.id}</div>
                    {m.description && <div className="text-xs text-gray-500 dark:text-gray-400">{m.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{statusLabels[m.status]}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <div>开始：{m.start_time ? m.start_time : '未设置'}</div>
                    <div>结束：{m.end_time ? m.end_time : '未设置'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => handleEdit(m)}>编辑</Button>
                      <Button variant="outline" onClick={() => openImportDialog(m)}>导入小分 CSV</Button>
                      {m.status !== 'ongoing' && (
                        <Button variant="outline" onClick={() => handleStatusChange(m, 'start')}>开始</Button>
                      )}
                      {m.status !== 'finished' && (
                        <Button variant="outline" onClick={() => handleStatusChange(m, 'finish')}>结束</Button>
                      )}
                      <Button variant="destructive" onClick={() => handleDelete(m.id)}>删除</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    暂无赛事，点击“新建赛事”开始创建。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入小分 CSV - {importingMatch?.name}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleImportSubmit}>
            <div>
              <Label htmlFor="csvFile">选择 CSV 文件</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">列示例：game, points, team, teamId, rival, rivalId, username, round, area, time</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="eventType">事件类型</Label>
                <Input
                  id="eventType"
                  value={importOptions.eventType}
                  onChange={(e) => setImportOptions({ ...importOptions, eventType: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tournamentStage">锦标赛阶段</Label>
                <Input
                  id="tournamentStage"
                  placeholder="如：小组赛 / 总决赛"
                  value={importOptions.tournamentStage}
                  onChange={(e) => setImportOptions({ ...importOptions, tournamentStage: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={importOptions.clearExisting}
                  onChange={(e) => setImportOptions({ ...importOptions, clearExisting: e.target.checked })}
                />
                导入前清空已有小分
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={importOptions.recalc}
                  onChange={(e) => setImportOptions({ ...importOptions, recalc: e.target.checked })}
                />
                导入后重算标准分
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setImportDialogOpen(false)}>取消</Button>
              <Button type="submit">开始导入</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
