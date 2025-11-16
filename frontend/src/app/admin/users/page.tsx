'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { AdminNav } from '@/components/admin-nav';
import { adminAPI, User } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    display_name: '',
    source: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, formData);
      } else {
        await adminAPI.createUser(formData);
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ nickname: '', display_name: '', source: '' });
      loadUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nickname: user.nickname,
      display_name: user.display_name || '',
      source: user.source || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个选手吗？')) return;
    try {
      await adminAPI.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除失败，请重试');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await adminAPI.exportUsersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('导出失败，请重试');
    }
  };

  const handleExportJSON = async () => {
    try {
      const blob = await adminAPI.exportUsersJSON();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.json`;
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
      const result = await adminAPI.importUsersCSV(file);
      alert(`导入成功！\n创建: ${result.created}\n更新: ${result.updated}\n错误: ${result.errors.length}`);
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
      }
      loadUsers();
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">选手管理</h2>
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
                <Button onClick={() => { setEditingUser(null); setFormData({ nickname: '', display_name: '', source: '' }); }}>
                  新建选手
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? '编辑选手' : '新建选手'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nickname">昵称</Label>
                    <Input id="nickname" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="display_name">显示名称</Label>
                    <Input id="display_name" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="source">数据来源</Label>
                    <Input id="source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">昵称</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">显示名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">平均标准分</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">参赛数</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{u.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{u.nickname}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.display_name || '-'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.game_level}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.average_standard_score.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.total_matches}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>编辑</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">删除</Button>
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
