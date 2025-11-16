'use client';

import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 隐藏主导航和页脚
    const mainNav = document.querySelector('nav');
    const footer = document.querySelector('footer');

    if (mainNav && mainNav.querySelector('.glass-nav')) {
      mainNav.style.display = 'none';
    }
    if (footer) {
      footer.style.display = 'none';
    }

    // 清理函数：离开管理页面时恢复显示
    return () => {
      if (mainNav) {
        mainNav.style.display = '';
      }
      if (footer) {
        footer.style.display = '';
      }
    };
  }, []);

  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
