import { View, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as d3 from 'd3-shape';
import * as scale from 'd3-scale';
import { TrendingUpIcon, TrendingDownIcon, ActivityIcon, DollarSignIcon, UsersIcon } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface MarketPulseProps {
    totalTVL: number;
    isLoading?: boolean;
}

// Mock data generator for sparklines
const generateSparklineData = (points: number = 20, trend: 'up' | 'down' | 'neutral' = 'up') => {
    let current = 100;
    return Array.from({ length: points }, (_, i) => {
        const noise = (Math.random() - 0.5) * 10;
        const trendFactor = trend === 'up' ? 2 : trend === 'down' ? -2 : 0;
        current += noise + trendFactor;
        return current;
    });
};

interface SparklineProps {
    data: number[];
    width: number;
    height: number;
    color: string;
}

function Sparkline({ data, width, height, color }: SparklineProps) {
    const min = Math.min(...data);
    const max = Math.max(...data);

    const xScale = scale.scaleLinear().domain([0, data.length - 1]).range([0, width]);
    const yScale = scale.scaleLinear().domain([min, max]).range([height, 0]);

    const lineGenerator = d3.line()
        .x((_: any, i: number) => xScale(i))
        .y((d: any) => yScale(d as number))
        .curve(d3.curveBasis);

    const path = lineGenerator(data) || '';

    return (
        <Svg width={width} height={height}>
            <Path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function MetricCard({
    title,
    value,
    change,
    isPositive,
    icon: Icon,
    data,
    colorClass,
    strokeColor
}: {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: any;
    data: number[];
    colorClass: string;
    strokeColor: string;
}) {
    return (
        <Card className="flex-1 p-4 shadow-sm border-border/50">
            <View className="flex-row justify-between items-start mb-2">
                <View className={cn("p-2 rounded-lg", colorClass)}>
                    <Icon size={16} className="text-foreground" />
                </View>
                <View className={cn(
                    "flex-row items-center gap-1 px-1.5 py-0.5 rounded-full",
                    isPositive ? "bg-success/10" : "bg-destructive/10"
                )}>
                    {isPositive ? (
                        <TrendingUpIcon size={10} className="text-success" />
                    ) : (
                        <TrendingDownIcon size={10} className="text-destructive" />
                    )}
                    <Text className={cn("text-[10px] font-bold", isPositive ? "text-success" : "text-destructive")}>
                        {change}
                    </Text>
                </View>
            </View>

            <View className="mb-2">
                <Text className="text-muted-foreground text-xs font-medium">{title}</Text>
                <Text className="text-lg font-bold text-foreground">{value}</Text>
            </View>

            <View className="h-8 w-full justify-end">
                <Sparkline
                    data={data}
                    width={80}
                    height={32}
                    color={strokeColor}
                />
            </View>
        </Card>
    );
}

export function MarketPulse({ totalTVL, isLoading }: MarketPulseProps) {
    const tvlData = useMemo(() => generateSparklineData(20, 'up'), []);
    const volumeData = useMemo(() => generateSparklineData(20, 'neutral'), []);
    const usersData = useMemo(() => generateSparklineData(20, 'up'), []);

    if (isLoading) {
        return (
            <View className="flex-row gap-3 px-4 mb-6">
                <Skeleton className="flex-1 h-32 rounded-xl" />
                <Skeleton className="flex-1 h-32 rounded-xl" />
                <Skeleton className="flex-1 h-32 rounded-xl" />
            </View>
        );
    }

    return (
        <View className="px-4 mb-6">
            <View className="flex-row items-center gap-2 mb-3">
                <ActivityIcon size={18} className="text-primary" />
                <Text className="text-lg font-bold text-foreground">Market Pulse</Text>
            </View>

            <View className="flex-row gap-3">
                {/* TVL Card */}
                <MetricCard
                    title="Total TVL"
                    value={formatCompact(totalTVL)}
                    change="+5.2%"
                    isPositive={true}
                    icon={DollarSignIcon}
                    data={tvlData}
                    colorClass="bg-primary/10"
                    strokeColor="#FA4616"
                />

                {/* Volume Card */}
                <MetricCard
                    title="24h Volume"
                    value="$12.5M"
                    change="-1.2%"
                    isPositive={false}
                    icon={ActivityIcon}
                    data={volumeData}
                    colorClass="bg-blue-500/10"
                    strokeColor="#3b82f6"
                />

                {/* Users Card */}
                <MetricCard
                    title="Active Users"
                    value="12.4K"
                    change="+8.4%"
                    isPositive={true}
                    icon={UsersIcon}
                    data={usersData}
                    colorClass="bg-green-500/10"
                    strokeColor="#22c55e"
                />
            </View>
        </View>
    );
}

function formatCompact(value: number): string {
    const formatter = Intl.NumberFormat('en', { notation: "compact", maximumFractionDigits: 1, style: 'currency', currency: 'USD' });
    return formatter.format(value);
}
