'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { AdminNav } from '@/components/admin-nav';
import Link from 'next/link';
import { FileText, Users, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAdminAuth();

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />

      {/* 主内容区域 */}
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">欢迎回来，{user.full_name || user.username}！</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            这是管理后台的主页面，您可以从这里管理比赛项目和选手信息。
          </p>
        </div>

        {/* 快捷操作卡片 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/games">
            <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">比赛项目管理</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">查看和管理所有比赛项目</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">选手管理</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">查看和管理所有选手信息</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/config">
            <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-8 w-8 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">站点配置</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">配置站点信息和通知栏</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
