"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { configService, SiteConfig } from '@/services/configService';

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick?: () => void
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="relative inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium text-foreground/70 transition-all duration-300 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 overflow-hidden group"
  >
    <span className="relative z-10">{children}</span>
    <span className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
  </Link>
)

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const logoSrc = config?.logo_filename
    ? `/logos/${config.logo_filename}`
    : null;
  const siteAbbr = config?.site_abbr || 'TH';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel glass-nav mt-4 flex h-14 items-center justify-between rounded-full px-4 py-2 backdrop-blur-apple">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center space-x-3 text-lg font-semibold text-foreground transition-all duration-300 hover:opacity-90 group"
            >
              <div className="relative w-9 h-9 rounded-2xl gradient-apple flex items-center justify-center text-sm font-bold text-white shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover rounded-2xl relative z-10"
                  />
                ) : (
                  <span className="text-white font-bold text-sm relative z-10">{siteAbbr}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="relative">
                联合锦标赛
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="/matches">赛事</NavLink>
              <NavLink href="/teams">队伍</NavLink>
              <NavLink href="/players">选手</NavLink>
              <NavLink href="/leaderboard">排行榜</NavLink>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="md:hidden">
              <button onClick={toggleMenu} className="p-2 rounded-2xl text-foreground/60 hover:text-foreground hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4">
          <div className="glass-panel mt-2 flex flex-col gap-1 rounded-3xl p-3">
            <NavLink href="/matches" onClick={closeMenu}>赛事</NavLink>
            <NavLink href="/teams" onClick={closeMenu}>队伍</NavLink>
            <NavLink href="/players" onClick={closeMenu}>选手</NavLink>
            <NavLink href="/leaderboard" onClick={closeMenu}>排行榜</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
