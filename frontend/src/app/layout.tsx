import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRIALHAMMER x RIA 联合锦标赛",
  description: "TRIALHAMMER x RIA 联合锦标赛官方平台。",
};

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 hover:bg-white/10 rounded-xl backdrop-blur-sm focus-ring"
  >
    {children}
  </Link>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Apple-style Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-apple bg-white/80 dark:bg-black/80 border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-apple flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TH</span>
                  </div>
                  <span>TRIALHAMMER x RIA</span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-1">
                  <NavLink href="/matches">赛事</NavLink>
                  <NavLink href="/teams">队伍</NavLink>
                  <NavLink href="/players">选手</NavLink>
                  <NavLink href="/live">直播</NavLink>
                  <NavLink href="/admin">管理后台</NavLink>
                </div>
              </div>
              
              {/* Mobile menu button - 可以后续添加 */}
              <div className="md:hidden">
                <button className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content with proper spacing */}
        <main className="pt-16 min-h-screen bg-background">
          <div className="relative">
            {children}
          </div>
        </main>
        
        {/* Apple-style footer */}
        <footer className="border-t border-border/50 bg-background/80 backdrop-blur-apple">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>© 2025 TRIALHAMMER x RIA 联合锦标赛. 保留所有权利。</p>
              <p className="mt-2">由现代化技术栈驱动，为电竞而生。</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
