import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { LayersIcon, WalletIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react-native';
import { usePortfolio, PortfolioPosition } from '@/lib/usePortfolio';

// Icon mapping based on protocol
const getPositionIcon = (protocol: string) => {
    switch (protocol.toLowerCase()) {
        case 'meridian':
            return { icon: LayersIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' };
        case 'echelon market':
        case 'echelon':
            return { icon: WalletIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' };
        case 'satay finance':
        case 'satay':
            return { icon: TrendingUpIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        default:
            return { icon: WalletIcon, color: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
};

export function PortfolioSection() {
    const { data: portfolio, isLoading, error } = usePortfolio();

    // Loading state
    if (isLoading) {
        return (
            <View className="gap-4 pt-4 border-t border-border">
                <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-foreground">My Positions</Text>
                </View>
                <View className="items-center justify-center py-8">
                    <ActivityIndicator size="large" />
                    <Text className="text-muted-foreground mt-2">Loading portfolio...</Text>
                </View>
            </View>
        );
    }

    // Error or no data state
    if (error || !portfolio?.positions?.length) {
        return (
            <View className="gap-4 pt-4 border-t border-border">
                <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-foreground">My Positions</Text>
                </View>
                <Card className="p-6 items-center">
                    <AlertCircleIcon size={32} className="text-muted-foreground mb-2" />
                    <Text className="text-muted-foreground text-center">
                        {error ? 'Failed to load positions' : 'No positions found'}
                    </Text>
                    <Text className="text-xs text-muted-foreground/60 text-center mt-1">
                        Start earning by depositing into a protocol
                    </Text>
                </Card>
            </View>
        );
    }

    return (
        <View className="gap-4 pt-4 border-t border-border">
            <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-foreground">My Positions</Text>
                <View className="flex-row items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <TrendingUpIcon size={12} className="text-emerald-500" />
                    <Text className="text-xs font-medium text-emerald-500">Live</Text>
                </View>
            </View>

            {/* Net Worth Summary */}
            <View className="flex-row gap-3">
                <Card className="flex-1 bg-primary/5 border-primary/10">
                    <CardContent className="p-4">
                        <Text className="text-xs text-muted-foreground mb-1">Total Net Worth</Text>
                        <Text className="text-2xl font-bold text-foreground">
                            {portfolio.totalNetWorth}
                        </Text>
                        {portfolio.netWorthChange && (
                            <Text className="text-xs text-emerald-500 font-medium">
                                {portfolio.netWorthChange}
                            </Text>
                        )}
                    </CardContent>
                </Card>
            </View>

            {/* Positions List */}
            <View className="gap-3">
                {portfolio.positions.map((pos: PortfolioPosition) => {
                    const { icon: Icon, color, bg } = getPositionIcon(pos.protocol);
                    return (
                        <Card key={pos.id} className="flex-row items-center p-4 gap-4">
                            <View className={`h-10 w-10 rounded-full items-center justify-center ${bg}`}>
                                <Icon size={20} className={color} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-semibold text-foreground">{pos.name}</Text>
                                <Text className="text-xs text-muted-foreground">
                                    {pos.protocol} • {pos.strategy}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="font-bold text-foreground">{pos.amount}</Text>
                                {pos.apy && (
                                    <Text className="text-xs text-emerald-500">{pos.apy} APY</Text>
                                )}
                            </View>
                        </Card>
                    );
                })}
            </View>
        </View>
    );
}
