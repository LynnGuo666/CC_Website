import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { SeasonThemeProvider } from "@/contexts/season-theme-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "联合锦标赛",
  description: "TRIALHAMMER x RIA x INF 联合锦标赛官方平台。",
  icons: {
    icon: '/favicon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <script
          defer
          src="https://analysis.602007.xyz/script.js"
          data-website-id="60d590d4-0723-4dc2-be0d-fedc78499216"
        ></script>
      </head>
      <body
        className="antialiased bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SeasonThemeProvider>
            <MainNav />

            <main className="min-h-screen">
              <div className="relative pt-20 sm:pt-24">
                {children}
              </div>
            </main>

            <Footer />
          </SeasonThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
