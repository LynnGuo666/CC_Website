"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { LiquidButton } from "@/components/ui/liquid-button";
import { GlassCard } from "@/components/ui/glass-card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidBackground } from "@/components/ui/liquid-background";
import { NotificationBadge } from "@/components/ui/notification-badge";
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        <LiquidBackground />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Liquid Glass Notification Badge */}
          <div className="mb-8">
            <NotificationBadge
              text={notificationText}
              link={notificationLink}
            />
          </div>

          {/* Main heading with liquid glass effect */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-8">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'shimmer 3s linear infinite' }}>
                联合锦标赛
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 refraction-highlight opacity-50"
              ></span>
            </span>
          </h1>

          {/* Subtitle with glass effect */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm px-4 rounded-2xl">
            所以游目骋怀，足以极视听之娱，信可乐也。
          </p>

          {/* Liquid Glass CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <Link href={notificationLink} className="w-full sm:w-auto">
              <LiquidButton
                size="lg"
                className="w-full sm:min-w-[200px] h-12 sm:h-14 text-base sm:text-lg font-semibold"
              >
                立即观赛
              </LiquidButton>
            </Link>
            <Link href={handbookUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <LiquidButton
                size="lg"
                variant="glass"
                className="w-full sm:min-w-[200px] h-12 sm:h-14 text-base sm:text-lg font-semibold"
              >
                {handbookText}
              </LiquidButton>
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
                '--blob-primary': 'rgba(52, 199, 89, 0.2)',
                '--blob-secondary': 'rgba(52, 199, 89, 0.1)',
              } as CSSProperties
            }
          ></div>
          <div
            aria-hidden="true"
            className="refraction-blob top-1/3 right-1/4 w-96 h-96"
            style={
              {
                animation: 'liquid-flow 18s ease-in-out infinite reverse',
                '--blob-primary': 'rgba(255, 59, 48, 0.2)',
                '--blob-secondary': 'rgba(255, 59, 48, 0.1)',
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* TRIALHAMMER */}
            <GlassCard className="p-6 h-full flex flex-col hover:scale-105 transition-transform duration-300 bg-green-500/5 border-green-500/20 shadow-[0_8px_16px_-4px_rgba(34,197,94,0.1)] hover:bg-green-500/10 hover:shadow-[0_20px_40px_-4px_rgba(34,197,94,0.2)] hover:border-green-500/30">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-green-500 mb-2">TRIALHAMMER</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  是创立于 2016 年的 Minecraft 社区，本代服务器 Innova 开设于 2022 年，以插件机制与自定义地图为主要玩法。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-green-500/30 text-green-500 hover:border-green-500/60 hover:bg-green-500/5 hover:text-green-600 transition-all duration-200 rounded-full">
                    <Link href="https://wiki.hammer.moe" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </GlassCard>

            {/* RIA */}
            <GlassCard className="p-6 h-full flex flex-col hover:scale-105 transition-transform duration-300 bg-red-500/5 border-red-500/20 shadow-[0_8px_16px_-4px_rgba(239,68,68,0.1)] hover:bg-red-500/10 hover:shadow-[0_20px_40px_-4px_rgba(239,68,68,0.2)] hover:border-red-500/30">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-red-500 mb-2">RIA</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  以广袤的大陆、无数的地标、深厚的文化饱受赞美，七年来已有数千玩家到访，数百地标建立其上，其故事仍在不断续写。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-red-500/30 text-red-500 hover:border-red-500/60 hover:bg-red-500/5 hover:text-red-600 transition-all duration-200 rounded-full">
                    <Link href="https://wiki.ria.red" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </GlassCard>

            {/* INF */}
            <GlassCard className="p-6 h-full flex flex-col hover:scale-105 transition-transform duration-300 bg-purple-500/5 border-purple-500/20 shadow-[0_8px_16px_-4px_rgba(168,85,247,0.1)] hover:bg-purple-500/10 hover:shadow-[0_20px_40px_-4px_rgba(168,85,247,0.2)] hover:border-purple-500/30">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-purple-500 mb-2">INF</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  INF 是一个新生的 Minecraft 社区，目前活跃在2025年7月初开放的 island 筑境。以&ldquo;为远道而来的旅人提供任其挥洒的画卷&rdquo;为愿景，致力于营造和谐稳定的交友与游玩环境。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-purple-500/30 text-purple-500 hover:border-purple-500/60 hover:bg-purple-500/5 hover:text-purple-600 transition-all duration-200 rounded-full">
                    <Link href="https://wiki.infinf.info" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </GlassCard>

            {/* 天际服 */}
            <GlassCard className="p-6 h-full flex flex-col hover:scale-105 transition-transform duration-300 bg-blue-500/5 border-blue-500/20 shadow-[0_8px_16px_-4px_rgba(59,130,246,0.1)] hover:bg-blue-500/10 hover:shadow-[0_20px_40px_-4px_rgba(59,130,246,0.2)] hover:border-blue-500/30">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-blue-500 mb-2">天际服</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  天际服是一个致力于打造温馨友善 Minecraft 公益社区，采用正版验证 + 公益免费的模式，确保游戏环境公平和谐。同时拥有大量的黑名单样本和反作弊机制，能够从根源杜绝影响游戏体验的情况。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-blue-500/30 text-blue-500 hover:border-blue-500/60 hover:bg-blue-500/5 hover:text-blue-600 transition-all duration-200 rounded-full">
                    <Link href="https://wiki.tianjimc.com" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
