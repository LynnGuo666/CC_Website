import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
              联合锦标赛
            </span>
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl text-foreground/80">
              TRIALHAMMER x RIA x INF
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            体验前所未有的电竞盛宴，见证竞技精神与科技创新的完美融合
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center">
            <Link href="/matches">
              <Button 
                size="lg" 
                className="btn-hover gradient-apple text-white shadow-2xl shadow-primary/25 min-w-[200px] h-14 text-lg font-semibold focus-ring"
              >
                立即观赛
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 比赛介绍 Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            比赛介绍
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <Card className="glass card-hover p-8">
              <CardContent className="text-lg leading-relaxed text-muted-foreground space-y-6">
                <p>
                  2023年8月是RIAZth开服的第五周年整，也是TRIALHAMMER（锤子）开服的七周年。值此周年庆时机，两个服务器首次开展了联动锦标赛活动——SCC夏季联合锦标赛。
                </p>
                <p>
                  SCC类似知名的Minecraft Championships系列小游戏比赛，是一个由多项小游戏组成的竞赛活动。所有参与者将以四人被分为若干小队，并在各个项目中积累得分，最终决出冠军。
                </p>
                <p>
                  本次SCC包含了如TNTRun、跑酷、空岛战争、战斗方框等涉及各个类型的共计8个项目。SCC夏季联合锦标赛于2023年8月5日晚举办。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 游戏介绍 Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            游戏介绍
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "TNTRun", description: "在不断崩塌的地面上奔跑求生", icon: "💥" },
              { name: "跑酷", description: "考验敏捷与技巧的速度竞赛", icon: "🏃" },
              { name: "空岛战争", description: "在空中岛屿间展开激烈战斗", icon: "⚔️" },
              { name: "战斗方框", description: "在狭小空间内的生存竞技", icon: "🛡️" },
              { name: "建造大师", description: "展现创意与建筑技巧", icon: "🏗️" },
              { name: "射击游戏", description: "精准射击的竞技挑战", icon: "🏹" },
              { name: "团队协作", description: "考验团队配合的综合项目", icon: "🤝" },
              { name: "策略游戏", description: "智慧与策略的终极较量", icon: "🧠" }
            ].map((game, index) => (
              <Card key={index} className="glass card-hover text-center p-6">
                <CardHeader className="pb-4">
                  <div className="text-4xl mb-4">{game.icon}</div>
                  <CardTitle className="text-xl">{game.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 比赛风采 Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            比赛风采
          </h2>
          
          <div className="text-center">
            <Card className="glass card-hover p-12">
              <CardContent>
                <div className="text-6xl mb-6">📸</div>
                <h3 className="text-2xl font-semibold mb-4">精彩瞬间即将展示</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  这里将通过配置文件展示比赛中的精彩照片和视频，敬请期待！
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 选手风采 Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            选手风采
          </h2>
          
          <div className="text-center">
            <Card className="glass card-hover p-12">
              <CardContent>
                <div className="text-6xl mb-6">🏆</div>
                <h3 className="text-2xl font-semibold mb-4">S级玩家展示</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  这里将展示各个小游戏中标准分排名顶尖的S级玩家，展现竞技巅峰！
                </p>
                <div className="mt-8">
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
                    即将推出
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
