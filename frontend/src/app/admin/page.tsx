import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">后台管理</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link href="/admin/create-match">
          <Card className="hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle>创建新赛事</CardTitle>
              <CardDescription>创建一个新的比赛，并管理其赛程。</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/create-team">
          <Card className="hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle>创建新队伍</CardTitle>
              <CardDescription>添加一个新的参赛队伍。</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/create-player">
          <Card className="hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle>创建新选手</CardTitle>
              <CardDescription>添加一个新的参赛选手。</CardDescription>
            </CardHeader>
          </Card>
        </Link>

      </div>
    </div>
  );
}