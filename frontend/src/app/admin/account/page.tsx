'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin-nav';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/admin-api';

export default function AdminAccountPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAdminAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage({ text: '请填写新密码并确认。', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: '两次输入的密码不一致。', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: '密码至少需要 8 个字符。', type: 'error' });
      return;
    }

    try {
      setUpdating(true);
      await adminAPI.updateAdminUser(user.id, { password: newPassword });
      setMessage({ text: '密码已更新，请在下次登录时使用新密码。', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password:', error);
      setMessage({ text: '更新失败，请稍后重试。', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />

      <div className="mx-auto max-w-3xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">账户安全</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            在此更新您的登录密码，建议定期更换以保障安全。
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">修改密码</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            当前登录账户：{user.full_name || user.username}（{user.role}）
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入至少 8 位的新密码"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
              />
            </div>

            {message && (
              <div
                className={`rounded-md px-4 py-2 text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={updating}>
                {updating ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
