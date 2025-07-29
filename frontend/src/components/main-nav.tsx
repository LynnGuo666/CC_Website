"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

const NavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:bg-white/10 rounded-xl"
  >
    {children}
  </Link>
);

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-apple bg-white/80 dark:bg-black/80 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              onClick={closeMenu}
              className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-apple flex items-center justify-center">
                <span className="text-white font-bold text-sm">TH</span>
              </div>
              <span>联合锦标赛</span>
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
              <button onClick={toggleMenu} className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/10 transition-all">
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
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink href="/matches" onClick={closeMenu}>赛事</NavLink>
          <NavLink href="/teams" onClick={closeMenu}>队伍</NavLink>
          <NavLink href="/players" onClick={closeMenu}>选手</NavLink>
          <NavLink href="/leaderboard" onClick={closeMenu}>排行榜</NavLink>
        </div>
      )}
    </nav>
  );
}