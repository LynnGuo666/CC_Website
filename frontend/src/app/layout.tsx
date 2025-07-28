import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
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
  title: "联合锦标赛",
  description: "TRIALHAMMER x RIA x INF 联合锦标赛官方平台。",
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
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
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
                  <span>联合锦标赛</span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-1">
                  <NavLink href="/matches">赛事</NavLink>
                  <NavLink href="/teams">队伍</NavLink>
                  <NavLink href="/players">选手</NavLink>
                  <NavLink href="/leaderboard">排行榜</NavLink>
                  <NavLink href="/live">直播</NavLink>
                  <NavLink href="/admin">管理后台</NavLink>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Brand Section */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-apple flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TH</span>
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    联合锦标赛
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  TRIALHAMMER x RIA x INF
                </p>
              </div>

              {/* Copyright Section */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  © 2023-2025 联合锦标赛
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  保留所有权利
                </p>
              </div>

              {/* Developer Section */}
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end space-x-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <img 
                      src="https://mc-heads.net/avatar/Venti_Lynn/64" 
                      alt="Venti_Lynn" 
                      className="w-6 h-6 rounded-full border border-border/20"
                    />
                    <span className="text-sm text-muted-foreground">Venti_Lynn</span>
                  </div>
                </div>
                <a 
                  href="https://github.com/LynnGuo666" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>@LynnGuo666</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
