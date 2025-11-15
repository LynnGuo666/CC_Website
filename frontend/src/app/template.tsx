'use client';

import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 触发进入动画
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`page-transition ${isVisible ? 'page-transition-enter' : ''}`}
    >
      {children}
    </div>
  );
}
