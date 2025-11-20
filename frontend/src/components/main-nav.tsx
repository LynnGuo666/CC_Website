"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { SeasonToggle } from './season-toggle';
import { configService, SiteConfig } from '@/services/configService';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string
  children: React.ReactNode
  onClick?: () => void
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium transition-colors duration-300 z-10
        ${isActive ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}
    >
      {isActive && (
        <motion.span
          layoutId="bubble"
          className="absolute inset-0 bg-primary/15 dark:bg-primary/25 shadow-[0_8px_20px_-6px_rgba(var(--primary),0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-primary/20 rounded-2xl -z-10 backdrop-blur-md"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span>{children}</span>
    </Link>
  );
}

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
    <nav data-site-main-nav className="fixed top-0 left-0 right-0 z-50">
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
              <NavLink href="/games">游戏</NavLink>
              <NavLink href="/teams">队伍</NavLink>
              <NavLink href="/players">选手</NavLink>
              <NavLink href="/leaderboard">排行榜</NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/dashboard"
              className="hidden md:flex items-center space-x-1 rounded-2xl px-3 py-1.5 text-xs font-medium text-foreground/60 hover:text-foreground hover:bg-white/10 transition-all"
              title="管理后台"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>管理</span>
            </Link>
            <SeasonToggle />
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
            <NavLink href="/games" onClick={closeMenu}>游戏</NavLink>
            <NavLink href="/teams" onClick={closeMenu}>队伍</NavLink>
            <NavLink href="/players" onClick={closeMenu}>选手</NavLink>
            <NavLink href="/leaderboard" onClick={closeMenu}>排行榜</NavLink>
            <NavLink href="/admin/dashboard" onClick={closeMenu}>管理后台</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}
