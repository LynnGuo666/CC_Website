'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/admin-auth-context';

const NavLink = ({
  href,
  children,
  isActive,
}: {
  href: string
  children: React.ReactNode
  isActive: boolean
}) => (
  <Link
    href={href}
    className={`relative inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 overflow-hidden group ${
      isActive
        ? 'text-foreground bg-white/20 dark:bg-white/10'
        : 'text-foreground/70 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10'
    }`}
  >
    <span className="relative z-10">{children}</span>
    {isActive && (
      <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl"></span>
    )}
  </Link>
)

export function AdminNav() {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel glass-nav mt-4 flex h-14 items-center justify-between rounded-full px-4 py-2 backdrop-blur-apple">
          <div className="flex items-center space-x-8">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3 text-lg font-semibold text-foreground transition-all duration-300 hover:opacity-90 group"
            >
              <div className="relative w-9 h-9 rounded-2xl gradient-apple flex items-center justify-center text-sm font-bold text-white shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110">
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="relative hidden md:inline">
                管理后台
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="/admin/dashboard" isActive={isActive('/admin/dashboard')}>
                概览
              </NavLink>
              <NavLink href="/admin/games" isActive={isActive('/admin/games')}>
                比赛项目
              </NavLink>
              <NavLink href="/admin/users" isActive={isActive('/admin/users')}>
                选手管理
              </NavLink>
              <NavLink href="/admin/account" isActive={isActive('/admin/account')}>
                账户安全
              </NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-2xl text-xs text-foreground/70 hover:text-foreground hover:bg-white/10"
            >
              <Link href="/" className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span>返回主站</span>
              </Link>
            </Button>

            <div className="hidden md:flex items-center rounded-2xl bg-white/10 px-3 py-1.5 text-xs text-foreground/80">
              <span className="font-medium">{user.full_name || user.username}</span>
              <span className="ml-1 text-foreground/60">({user.role})</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="rounded-2xl text-xs"
            >
              退出
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
