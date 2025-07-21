import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
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
          {/* Main heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              TRIALHAMMER
            </span>
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl text-foreground/80">
              x RIA 联合锦标赛
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            体验前所未有的电竞盛宴，见证竞技精神与科技创新的完美融合
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/matches">
              <Button 
                size="lg" 
                className="btn-hover gradient-apple text-white shadow-2xl shadow-primary/25 min-w-[200px] h-14 text-lg font-semibold focus-ring"
              >
                立即观赛
              </Button>
            </Link>
            
            <Link href="/teams">
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-hover glass min-w-[200px] h-14 text-lg font-semibold focus-ring border-primary/20 hover:border-primary/40"
              >
                查看队伍
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">16+</div>
              <div className="text-muted-foreground">参赛队伍</div>
            </div>
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">参赛选手</div>
            </div>
            <div className="text-center p-6 rounded-2xl glass card-hover">
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">¥100K+</div>
              <div className="text-muted-foreground">奖金池</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            为什么选择我们
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl glass card-hover">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-apple flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">实时直播</h3>
              <p className="text-muted-foreground leading-relaxed">
                高清画质，零延迟的实时比赛直播，让您不错过任何精彩瞬间
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl glass card-hover">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-apple-green flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">数据分析</h3>
              <p className="text-muted-foreground leading-relaxed">
                专业的数据分析和可视化，深入了解比赛动态和选手表现
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl glass card-hover">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-apple-red flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">社区互动</h3>
              <p className="text-muted-foreground leading-relaxed">
                活跃的社区氛围，与其他电竞爱好者共同讨论和交流
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
