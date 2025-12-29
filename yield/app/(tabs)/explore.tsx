import { PoolList } from '@/components/PoolList';
import { PoolData } from '@/components/PoolCard';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePoolsData, calculateTotalTVL, formatTotalTVL } from '@/lib/usePoolsData';
import { View, RefreshControl } from 'react-native';
import {
    CompassIcon,
    TrendingUpIcon,
    CoinsIcon,
    LayersIcon,
    RefreshCwIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useState, useCallback } from 'react';

export default function ExploreScreen() {
    const { pools, totalProtocols, isLoading, error, refetch } = usePoolsData();
    const [refreshing, setRefreshing] = useState(false);

    const totalTVL = calculateTotalTVL(pools);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        refetch();
        // Small delay for UX
        setTimeout(() => setRefreshing(false), 500);
    }, [refetch]);

    const handlePoolPress = (pool: PoolData) => {
        router.push({
            pathname: '/pool/[slug]' as any,
            params: {
                slug: pool.slug || pool.name.toLowerCase().replace(/\s+/g, '-'),
                name: pool.name,
                tvl: pool.tvl?.toString() || '0',
                apy: pool.apy || '',
                category: pool.category,
                change_7d: pool.change_7d || '',
                apyNote: pool.apyNote || '',
                apySource: pool.apySource || '',
            },
        });
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Explore Pools',
                    headerShown: true,
                }}
            />
            <View className="flex-1 bg-background">
                {/* Header Stats Section */}
                <View className="bg-card border-b border-border px-6 py-5">
                    {/* Title Row */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <CompassIcon size={24} className="text-primary" />
                            <Text className="text-xl font-bold text-foreground">
                                DeFi Pools
                            </Text>
                        </View>
                        <Button
                            variant="ghost"
                            size="icon"
                            onPress={refetch}
                            disabled={isLoading}
                        >
                            <RefreshCwIcon
                                size={18}
                                className={isLoading ? 'text-muted-foreground' : 'text-foreground'}
                            />
                        </Button>
                    </View>

                    {/* Stats Cards */}
                    <View className="flex-row gap-3">
                        {/* Total TVL */}
                        <Card className="flex-1 bg-primary/5 border-primary/10 p-4">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <CoinsIcon size={14} className="text-primary" />
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Total TVL
                                </Text>
                            </View>
                            <Text className="text-xl font-bold text-foreground">
                                {isLoading ? '...' : formatTotalTVL(totalTVL)}
                            </Text>
                        </Card>

                        {/* Total Protocols */}
                        <Card className="flex-1 bg-muted/50 p-4">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <LayersIcon size={14} className="text-muted-foreground" />
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Protocols
                                </Text>
                            </View>
                            <Text className="text-xl font-bold text-foreground">
                                {isLoading ? '...' : totalProtocols}
                            </Text>
                        </Card>

                        {/* Active Pools */}
                        <Card className="flex-1 bg-emerald-500/5 border-emerald-500/10 p-4">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <TrendingUpIcon size={14} className="text-emerald-500" />
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Available
                                </Text>
                            </View>
                            <Text className="text-xl font-bold text-foreground">
                                {isLoading ? '...' : pools.length}
                            </Text>
                        </Card>
                    </View>
                </View>

                {/* Pools List */}
                <View className="flex-1 px-4 pt-4">
                    <PoolList
                        pools={pools}
                        isLoading={isLoading}
                        error={error}
                        onRetry={refetch}
                        onPoolPress={handlePoolPress}
                    />
                </View>
            </View>
        </>
    );
}
