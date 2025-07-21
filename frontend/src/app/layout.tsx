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
  <Link href={href} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
    {children}
  </Link>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-gray-900 text-black dark:text-white`}
      >
        <nav className="bg-gray-800">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <Link href="/" className="flex flex-shrink-0 items-center text-white font-bold">
                  TRIALHAMMER x RIA
                </Link>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <NavLink href="/matches">赛事</NavLink>
                    <NavLink href="/teams">队伍</NavLink>
                    <NavLink href="/players">选手</NavLink>
                    <NavLink href="/admin">后台管理</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
