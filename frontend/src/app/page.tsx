"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  const notificationLink = config?.notification_link || "/matches";
  const handbookText = config?.handbook_text || "访问秩序册";
  const handbookUrl = config?.handbook_url || "https://docs.qq.com/doc/DU2NTV3BsR0hwbWNn";

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Gemini风格通知标 */}
          <div className="mb-8">
            <Link href={notificationLink}>
              <div className="relative group">
                {/* 主容器 */}
                <div className="relative inline-flex items-center gap-4 px-8 py-4 rounded-2xl backdrop-blur-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/20 hover:border-white/30 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-3xl">
                  {/* 背景光晕效果 */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* 左侧动态指示器 */}
                  <div className="relative flex items-center justify-center">
                    <div className="relative">
                      <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-40"></div>
                      <div className="absolute -inset-1 w-4 h-4 bg-red-400/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* 文字内容 */}
                  <div className="relative">
                    <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500 tracking-wide">
                      {notificationText}
                    </span>
                    
                    {/* 文字下方微妙光效 */}
                    <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* 右侧脉动箭头 */}
                  <div className="relative flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                    <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* 顶部装饰线 */}
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"></div>
                  
                  {/* 底部装饰线 */}
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
                
                {/* 外部光晕 */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
                
                {/* 顶部反光效果 */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-t-2xl"></div>
              </div>
            </Link>
          </div>

          {/* Main heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              联合锦标赛
            </span>
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl text-foreground/80">
              TRIALHAMMER x RIA x INF
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          所以游目骋怀，足以极视听之娱，信可乐也。
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={notificationLink}>
              <Button 
                size="lg" 
                className="btn-hover text-primary-foreground shadow-2xl shadow-primary/25 min-w-[200px] h-14 text-lg font-semibold focus-ring bg-primary hover:bg-primary/90"
              >
                立即观赛
              </Button>
            </Link>
            <Link href={handbookUrl} target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                variant="outline"
                className="btn-hover min-w-[200px] h-14 text-lg font-semibold border-2 hover:bg-primary/10 focus-ring"
              >
                {handbookText}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 了解各个社区 Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            了解各个社区
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* TRIALHAMMER - 绿色 */}
            <Card className="glass card-hover p-6 h-full flex flex-col border-green-500/30 bg-green-500/5">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-green-500 mb-2">TRIALHAMMER</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  是创立于 2016 年的 Minecraft 社区，本代服务器 Innova 开设于 2022 年，以插件机制与自定义地图为主要玩法。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10">
                    <Link href="https://wiki.hammer.moe" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RIA - 红色 */}
            <Card className="glass card-hover p-6 h-full flex flex-col border-red-500/30 bg-red-500/5">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-red-500 mb-2">RIA</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  以广袤的大陆、无数的地标、深厚的文化饱受赞美，七年来已有数千玩家到访，数百地标建立其上，其故事仍在不断续写。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10">
                    <Link href="https://wiki.ria.red" target="_blank" rel="noopener noreferrer">
                      访问官方Wiki
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* INF - 紫色 */}
            <Card className="glass card-hover p-6 h-full flex flex-col border-purple-500/30 bg-purple-500/5">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-purple-500 mb-2">INF</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  INF 是一个新生的 Minecraft 社区，目前活跃在2025年7月初开放的 island 筑境。以"为远道而来的旅人提供任其挥洒的画卷"为愿景，致力于营造和谐稳定的交友与游玩环境。
                </p>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full border-purple-500/50 text-purple-500 hover:bg-purple-500/10">
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
