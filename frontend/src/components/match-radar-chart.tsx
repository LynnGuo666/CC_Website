"use client";

import { useState } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartPie } from "lucide-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

type RadarData = Record<string, number>;

interface MatchRadarChartProps {
    userId: number;
    matchId: number;
    userName: string;
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

// 颜色通过 ChartConfig + CSS 变量注入，与 player-radar-chart 保持一致。
const chartConfig = {
    radar: {
        label: "能力值",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export default function MatchRadarChart({ userId, matchId, userName, className }: MatchRadarChartProps) {
    const [data, setData] = useState<RadarData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const loadRadarData = async () => {
        if (data) {
            setIsVisible(!isVisible);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { getUserRadar } = await import('@/services/userService');
            const radarData = await getUserRadar(userId, matchId);
            setData(radarData);
            setIsVisible(true);
        } catch (err) {
            console.error("Failed to load radar data:", err);
            setError("加载雷达图数据失败");
        } finally {
            setLoading(false);
        }
    };

    // Transform data for Recharts
    const chartData = data ? DIMENSION_ORDER.map((key) => ({
        subject: DIMENSION_LABELS[key] || key,
        A: data[key] || 0,
        fullMark: 100,
    })) : [];

    // Calculate average score for display
    const totalScore = data ? Object.values(data).reduce((sum, score) => sum + score, 0) : 0;
    const averageScore = data ? Math.round(totalScore / DIMENSION_ORDER.length) : 0;

    return (
        <div className={className}>
            <Button
                onClick={loadRadarData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="mb-4"
            >
                {loading ? "加载中..." : isVisible ? "隐藏雷达图" : "查看能力雷达"}
            </Button>

            {error && (
                <div className="text-sm text-destructive mb-4">{error}</div>
            )}

            {isVisible && data && (
                <Card className="glass overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ChartPie className="w-4 h-4 text-primary" strokeWidth={2} />
                                {userName} - 本赛事能力
                            </CardTitle>
                            <div className="text-sm font-medium text-muted-foreground">
                                综合评分: <span className="text-primary font-bold text-base">{averageScore}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full">
                        <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                                <PolarGrid stroke="var(--color-radar)" strokeOpacity={0.3} strokeWidth={1.5} />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 600 }}
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
                                    strokeWidth={2.5}
                                    fill="var(--color-radar)"
                                    fillOpacity={0.3}
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
            )}
        </div>
    );
}
