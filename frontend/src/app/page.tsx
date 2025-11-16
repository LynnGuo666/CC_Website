"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { configService } from "@/services/configService";
import { SiteConfig } from "@/services/configService";

export default function Home() {
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

  // 使用配置或默认值
  const notificationText = config?.notification_text || "🏆 S2CC夏季锦标赛正在进行中";
  const notificationLink = config?.notification_link || "https://live-cc.ziip.space/";
  const handbookText = config?.handbook_text || "在线观赛";
  const handbookUrl = config?.handbook_url || "https://live-cc.ziip.space/";

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30"></div>

        {/* Animated liquid glass orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            aria-hidden="true"
            className="refraction-blob top-1/4 left-1/4 w-96 h-96 animate-pulse"
            style={
              {
                animation: 'liquid-flow 12s ease-in-out infinite',
                '--blob-primary': 'rgba(0, 122, 255, 0.28)',
                '--blob-secondary': 'rgba(48, 209, 88, 0.2)',
              } as CSSProperties
            }
          ></div>
          <div
            aria-hidden="true"
            className="refraction-blob bottom-1/4 right-1/4 w-96 h-96 animate-pulse"
            style={
              {
                animation: 'liquid-flow 15s ease-in-out infinite reverse',
                '--blob-primary': 'rgba(48, 209, 88, 0.25)',
                '--blob-secondary': 'rgba(0, 122, 255, 0.2)',
              } as CSSProperties
            }
          ></div>
          <div
            aria-hidden="true"
            className="refraction-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
            style={
              {
                animation: 'spectrum-rotate 20s linear infinite',
                '--blob-primary': 'rgba(168, 85, 247, 0.22)',
                '--blob-secondary': 'rgba(14, 165, 233, 0.22)',
              } as CSSProperties
            }
          ></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Liquid Glass Notification Badge */}
          <div className="mb-8">
            <Link href={notificationLink}>
              <div className="relative group">
                {/* Main liquid glass container */}
                <div className="relative inline-flex items-center gap-4 px-8 py-4 rounded-3xl glass-panel backdrop-blur-xl cursor-pointer transition-all duration-500 hover:scale-105">
                  {/* Animated background glow */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-3xl refraction-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={
                      {
                        '--highlight-from': 'rgba(0, 122, 255, 0.35)',
                        '--highlight-to': 'rgba(48, 209, 88, 0.25)',
                      } as CSSProperties
                    }
                  ></div>

                  {/* Live indicator with liquid effect */}
                  <div className="relative flex items-center justify-center">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping opacity-40"></div>
                      <div className="absolute -inset-1.5 w-5 h-5 bg-red-400/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Text content with gradient */}
                  <div className="relative">
                    <span className="text-sm font-semibold bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent group-hover:from-primary group-hover:via-accent group-hover:to-primary transition-all duration-500 tracking-wide">
                      {notificationText}
                    </span>

                    {/* Animated underline */}
                    <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Animated arrow */}
                  <div className="relative flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                    <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full refraction-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={
                        {
                          '--highlight-from': 'rgba(0, 122, 255, 0.4)',
                          '--highlight-to': 'rgba(14, 165, 233, 0.3)',
                        } as CSSProperties
                      }
                    ></div>
                  </div>

                  {/* Top shine effect */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-t-3xl"></div>
                </div>

                {/* Outer glow on hover */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[2rem] refraction-highlight opacity-0 group-hover:opacity-40 transition-opacity duration-700 -z-10"
                  style={
                    {
                      '--highlight-from': 'rgba(0, 122, 255, 0.25)',
                      '--highlight-to': 'rgba(48, 209, 88, 0.2)',
                    } as CSSProperties
                  }
                ></div>
              </div>
            </Link>
          </div>

          {/* Main heading with liquid glass effect */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-8">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" style={{ animation: 'shimmer 3s linear infinite' }}>
                联合锦标赛
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 refraction-highlight opacity-50"
              ></span>
            </span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground/80 font-light">
              TRIALHAMMER x RIA x INF
            </span>
          </h1>

          {/* Subtitle with glass effect */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm px-4">
            所以游目骋怀，足以极视听之娱，信可乐也。
          </p>

          {/* Liquid Glass CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link href={notificationLink} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="relative overflow-hidden text-primary-foreground shadow-2xl shadow-primary/30 w-full sm:min-w-[200px] h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 group"
              >
                <span className="relative z-10">立即观赛</span>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 refraction-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={
                    {
                      '--highlight-from': 'rgba(255, 255, 255, 0.35)',
                      '--highlight-to': 'rgba(255, 255, 255, 0.15)',
                    } as CSSProperties
                  }
                ></div>
              </Button>
            </Link>
            <Link href={handbookUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden glass-panel w-full sm:min-w-[200px] h-12 sm:h-14 text-base sm:text-lg font-semibold border-2 border-white/20 hover:border-white/30 backdrop-blur-xl transition-all duration-300 group"
              >
                <span className="relative z-10">{handbookText}</span>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 refraction-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 了解各个社区 Section with Liquid Glass */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background with liquid glass effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            aria-hidden="true"
            className="refraction-blob top-1/2 left-1/4 w-96 h-96"
            style={
              {
                animation: 'liquid-flow 15s ease-in-out infinite',
                '--blob-primary': 'rgba(34, 197, 94, 0.25)',
                '--blob-secondary': 'rgba(34, 197, 94, 0.18)',
              } as CSSProperties
            }
          ></div>
          <div
            aria-hidden="true"
            className="refraction-blob top-1/3 right-1/4 w-96 h-96"
            style={
              {
                animation: 'liquid-flow 18s ease-in-out infinite reverse',
                '--blob-primary': 'rgba(248, 113, 113, 0.22)',
                '--blob-secondary': 'rgba(248, 113, 113, 0.12)',
              } as CSSProperties
            }
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
              了解各个社区
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* TRIALHAMMER */}
            <Card className="glass-card p-6 h-full flex flex-col">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-green-500 mb-2">TRIALHAMMER</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  是创立于 2016 年的 Minecraft 社区，本代服务器 Innova 开设于 2022 年，以插件机制与自定义地图为主要玩法。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-green-500/30 text-green-500 hover:border-green-500/60 hover:bg-green-500/5 transition-all duration-200">
                    <Link href="https://wiki.hammer.moe" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RIA */}
            <Card className="glass-card p-6 h-full flex flex-col">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-red-500 mb-2">RIA</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  以广袤的大陆、无数的地标、深厚的文化饱受赞美，七年来已有数千玩家到访，数百地标建立其上，其故事仍在不断续写。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-red-500/30 text-red-500 hover:border-red-500/60 hover:bg-red-500/5 transition-all duration-200">
                    <Link href="https://wiki.ria.red" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* INF */}
            <Card className="glass-card p-6 h-full flex flex-col">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-purple-500 mb-2">INF</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  INF 是一个新生的 Minecraft 社区，目前活跃在2025年7月初开放的 island 筑境。以&ldquo;为远道而来的旅人提供任其挥洒的画卷&rdquo;为愿景，致力于营造和谐稳定的交友与游玩环境。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-purple-500/30 text-purple-500 hover:border-purple-500/60 hover:bg-purple-500/5 transition-all duration-200">
                    <Link href="https://wiki.infinf.info" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
