import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DonutChart } from '@/components/charts/DonutChart';
import { PortfolioSummary } from '@/lib/usePortfolio';
import { LayersIcon, WalletIcon, TrendingUpIcon } from 'lucide-react-native';

interface PortfolioAnalyticsProps {
    data: PortfolioSummary;
}

const COLORS = ['#FA4616', '#16A34A', '#FACC15', '#3B82F6', '#EC4899'];

export function PortfolioAnalytics({ data }: PortfolioAnalyticsProps) {

    // Prepare data for DonutChart
    const chartData = useMemo(() => {
        if (!data.positions) return [];

        return data.positions.map((pos, index) => {
            // value string to number (remove $ and ,)
            const rawValue = parseFloat(pos.amount.replace(/[^0-9.-]+/g, ""));
            return {
                name: pos.name,
                value: rawValue,
                color: COLORS[index % COLORS.length]
            };
        }).filter(d => d.value > 0);
    }, [data.positions]);

    return (
        <View className="gap-4">
            {/* Allocation Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent className="items-center">
                    {chartData.length > 0 ? (
                        <DonutChart
                            data={chartData}
                            height={220}
                            width={300}
                            radius={80}
                            innerRadius={60}
                        />
                    ) : (
                        <View className="h-40 items-center justify-center">
                            <Text className="text-muted-foreground">No assets to display</Text>
                        </View>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <View>
                <Text className="text-lg font-semibold mb-3">Breakdown</Text>
                <View className="gap-3">
                    {chartData.map((item: any, index: number) => (
                        <Card key={index} className="flex-row items-center p-3">
                            <View
                                style={{ backgroundColor: item.color, opacity: 0.2 }}
                                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            >
                                <LayersIcon size={18} color={item.color} style={{ opacity: 1 }} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium">{item.name}</Text>
                                <Text className="text-xs text-muted-foreground">
                                    {((item.value / data.positions.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount.replace(/[^0-9.-]+/g, "")), 0)) * 100).toFixed(1)}%
                                </Text>
                            </View>
                            <Text className="font-bold">
                                ${item.value.toLocaleString()}
                            </Text>
                        </Card>
                    ))}
                </View>
            </View>
        </View>
    );
}
