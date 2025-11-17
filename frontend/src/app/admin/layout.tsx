'use client';

import { AdminAuthProvider } from '@/contexts/admin-auth-context';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const body = document.body;
    const mainNav = document.querySelector<HTMLElement>('nav[data-site-main-nav]');
    const footer = document.querySelector<HTMLElement>('footer[data-site-footer]');

    const previousNavDisplay = mainNav?.style.display ?? '';
    const previousFooterDisplay = footer?.style.display ?? '';
    const previousOffset = body.style.getPropertyValue('--page-top-offset');
    const hadInlineOffset = previousOffset !== '';

    if (mainNav) {
      mainNav.style.display = 'none';
    }
    if (footer) {
      footer.style.display = 'none';
    }
    body.style.setProperty('--page-top-offset', '0px');

    return () => {
      if (mainNav) {
        mainNav.style.display = previousNavDisplay;
      }
      if (footer) {
        footer.style.display = previousFooterDisplay;
      }
      if (hadInlineOffset) {
        body.style.setProperty('--page-top-offset', previousOffset);
      } else {
        body.style.removeProperty('--page-top-offset');
      }
    };
  }, []);

  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
