import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminDashboard() {
  const adminActions = [
    {
      title: "创建新赛事",
      description: "创建一个新的比赛，并管理其赛程",
      href: "/admin/create-match",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      gradient: "gradient-apple"
    },
    {
      title: "创建新队伍",
      description: "添加一个新的参赛队伍",
      href: "/admin/create-team",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      gradient: "gradient-apple-green"
    },
    {
      title: "创建新选手",
      description: "添加一个新的参赛选手",
      href: "/admin/create-player",
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      ),
      gradient: "gradient-apple-red"
    }
  ];

  const quickStats = [
    { label: "总赛事数", value: "8", color: "text-primary" },
    { label: "活跃队伍", value: "24", color: "text-accent" },
    { label: "注册选手", value: "120", color: "text-orange-500" },
    { label: "本月比赛", value: "5", color: "text-purple-500" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl -top-1/2 -left-1/2 w-full h-full"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            管理后台
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            全面控制您的电竞赛事平台，管理赛事、队伍和选手
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl glass card-hover">
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Admin Actions */}
          <div>
            <h2 className="text-2xl font-bold mb-8 text-center">管理操作</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adminActions.map((action, index) => (
                <Link key={index} href={action.href} className="group">
                  <Card className="h-full glass card-hover border-primary/10 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 rounded-2xl ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                      
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">需要帮助？</h3>
              <p className="text-muted-foreground mb-6">
                查看我们的管理员指南，了解如何高效管理您的电竞赛事平台。
              </p>
              <Link 
                href="/docs" 
                className="inline-flex items-center px-6 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all btn-hover focus-ring"
              >
                查看文档
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}