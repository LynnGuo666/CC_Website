'use client';

import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const mainNav = document.querySelector<HTMLElement>('nav');
    const footer = document.querySelector<HTMLElement>('footer');
    const mainContentWrapper = document.querySelector<HTMLElement>('main > div');

    const previousNavDisplay = mainNav?.style.display ?? '';
    const previousFooterDisplay = footer?.style.display ?? '';
    const previousPaddingTop = mainContentWrapper?.style.paddingTop ?? '';

    if (mainNav) {
      mainNav.style.display = 'none';
    }
    if (footer) {
      footer.style.display = 'none';
    }
    if (mainContentWrapper) {
      mainContentWrapper.style.paddingTop = '0';
    }

    return () => {
      if (mainNav) {
        mainNav.style.display = previousNavDisplay;
      }
      if (footer) {
        footer.style.display = previousFooterDisplay;
      }
      if (mainContentWrapper) {
        mainContentWrapper.style.paddingTop = previousPaddingTop;
      }
    };
  }, []);

  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
