"use client";

import { useState, useEffect } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartPie } from "lucide-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

type RadarData = Record<string, number>;

interface PlayerRadarChartProps {
    userId: number;
    /** 服务端预取的「综合」雷达数据，用于首屏直接渲染，消除 loading 闪烁 */
    initialData?: RadarData;
    userMatches?: Array<{ id: number; name: string }>;
    className?: string;
}

// Mapping from English keys to Chinese labels
const DIMENSION_LABELS: Record<string, string> = {
    "武力": "武力",
    "协作": "协作",
    "策略": "策略",
    "爆发": "爆发",
    "知识": "知识",
    "身法": "身法",
};

// Order of dimensions for the chart (六维)
const DIMENSION_ORDER = ["武力", "爆发", "知识", "身法", "协作", "策略"];

// 颜色通过 ChartConfig + CSS 变量注入：
// ChartContainer 会把 `color` 编译为 `--color-radar`，
// recharts 元素写 `fill="var(--color-radar)"` 即拿到合法颜色（--chart-1），
// 彻底绕开 `hsl(var(--primary))` 这种把已是颜色值的变量再塞进 hsl() 的错误用法。
const chartConfig = {
    radar: {
        label: "能力值",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export default function PlayerRadarChart({ userId, initialData, userMatches, className }: PlayerRadarChartProps) {
    const [selectedMatch, setSelectedMatch] = useState<string>("all");
    const [data, setData] = useState<RadarData | null>(initialData ?? null);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        const loadRadarData = async () => {
            // 综合视图复用服务端预取数据，无需再次请求
            if (selectedMatch === "all" && initialData) {
                setData(initialData);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { getUserRadar } = await import('@/services/userService');
                const matchId = selectedMatch === "all" ? undefined : parseInt(selectedMatch);
                const radarData = await getUserRadar(userId, matchId);
                setData(radarData);
            } catch (err) {
                console.error("Failed to load radar data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadRadarData();
    }, [userId, selectedMatch, initialData]);

    if (loading) {
        return (
            <Card className={`glass overflow-hidden ${className}`}>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="text-muted-foreground">加载中...</div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className={`glass overflow-hidden ${className}`}>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="text-muted-foreground">暂无数据</div>
                </CardContent>
            </Card>
        );
    }

    // Transform data for Recharts
    const chartData = DIMENSION_ORDER.map((key) => ({
        subject: DIMENSION_LABELS[key] || key,
        A: data[key] || 0,
        fullMark: 100,
    }));

    // Calculate average score for display
    const totalScore = Object.values(data).reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / DIMENSION_ORDER.length);

    return (
        <Card className={`glass overflow-hidden ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <ChartPie className="w-5 h-5 text-primary" strokeWidth={2} />
                        能力雷达
                    </CardTitle>
                    <div className="text-sm font-medium text-muted-foreground">
                        综合评分: <span className="text-primary font-bold text-lg">{averageScore}</span>
                    </div>
                </div>

                {/* Match Selector */}
                {userMatches && userMatches.length > 0 && (
                    <div className="mt-3">
                        <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="选择赛事" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">综合</Badge>
                                        <span>所有赛事</span>
                                    </div>
                                </SelectItem>
                                {userMatches.map((match) => (
                                    <SelectItem key={match.id} value={match.id.toString()}>
                                        {match.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="var(--color-radar)" strokeOpacity={0.3} strokeWidth={1.5} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="能力值"
                            dataKey="A"
                            stroke="var(--color-radar)"
                            strokeWidth={3}
                            fill="var(--color-radar)"
                            fillOpacity={0.4}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    nameKey="radar"
                                    labelKey="subject"
                                />
                            }
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
