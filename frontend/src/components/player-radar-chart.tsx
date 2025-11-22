"use client";

import { useState, useEffect } from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
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

type RadarData = Record<string, number>;

interface PlayerRadarChartProps {
    userId: number;
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

// Order of dimensions for the chart
const DIMENSION_ORDER = ["武力", "爆发", "知识", "身法", "协作", "策略"];

export default function PlayerRadarChart({ userId, userMatches, className }: PlayerRadarChartProps) {
    const [selectedMatch, setSelectedMatch] = useState<string>("all");
    const [data, setData] = useState<RadarData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRadarData = async () => {
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
    }, [userId, selectedMatch]);

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
    const averageScore = Math.round(totalScore / 6);

    return (
        <Card className={`glass overflow-hidden ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                            />
                        </svg>
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
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="hsl(var(--primary) / 0.3)" strokeWidth={1.5} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="能力值"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fill="hsl(var(--primary))"
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                color: "hsl(var(--popover-foreground))",
                            }}
                            itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                            formatter={(value: number) => [value.toFixed(1), "分数"]}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
