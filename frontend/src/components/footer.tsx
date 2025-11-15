'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { configService, SiteConfig } from '@/services/configService';

export function Footer() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const siteConfig = await configService.getConfig();
        setConfig(siteConfig);
      } catch (error) {
        console.error('Failed to load site config:', error);
      }
    };
    loadConfig();
  }, []);

  const logoSrc = config?.logo_filename
    ? `/logos/${config.logo_filename}`
    : null;
  const siteAbbr = config?.site_abbr || 'TH';

  return (
    <footer className="glass-panel mx-auto mt-24 mb-12 max-w-6xl px-6 py-10 text-sm text-muted-foreground">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-apple text-white font-bold flex items-center justify-center shadow-lg overflow-hidden">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt="Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span>{siteAbbr}</span>
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">联合锦标赛</p>
            <p className="text-xs text-muted-foreground">TRIALHAMMER x RIA x INF</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-center md:text-left">
          <span>© 2023-2025 联合锦标赛</span>
          <span className="text-xs">保留所有权利</span>
        </div>
        <div className="flex items-center gap-3 justify-center md:justify-end">
          <img
            src="https://mc-heads.net/avatar/Venti_Lynn/64"
            alt="Venti_Lynn"
            className="w-10 h-10 rounded-2xl border border-white/30 shadow-md"
          />
          <div className="text-left">
            <p className="font-medium text-foreground">Venti_Lynn</p>
            <a
              href="https://github.com/LynnGuo666"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>@LynnGuo666</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
