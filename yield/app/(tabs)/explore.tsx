
import { View, ScrollView, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { usePoolsData, calculateTotalTVL, formatTotalTVL } from '@/lib/usePoolsData';
import { PoolData } from '@/components/PoolCard';
import { useState, useCallback, useMemo } from 'react';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Minimal Components
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { PoolsList } from '@/components/explore/PoolsList';
import { DiscoveryCarousel } from '@/components/explore/DiscoveryCarousel';
import { MarketPulse } from '@/components/explore/MarketPulse';

export default function ExploreScreen() {
    const { pools, isLoading, refetch } = usePoolsData();
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    const totalTVL = calculateTotalTVL(pools);

    const topAPY = useMemo(() => {
        if (!pools.length) return "0%";
        const apys = pools.map(p => {
            const match = p.apy?.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });
        const max = Math.max(...apys);
        return max > 0 ? `${max}%` : "N/A";
    }, [pools]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        refetch();
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
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Minimal Header */}
            <ExploreHeader />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FA4616"
                        colors={["#FA4616"]}
                    />
                }
            >
                {/* Discovery Carousel */}
                <DiscoveryCarousel
                    pools={pools}
                    onPoolPress={handlePoolPress}
                    isLoading={isLoading}
                />

                {/* Market Pulse with Sparklines */}
                <MarketPulse
                    totalTVL={totalTVL}
                    isLoading={isLoading}
                />

                {/* Main Pool List */}
                <PoolsList
                    pools={pools}
                    onPoolPress={handlePoolPress}
                    isLoading={isLoading}
                />
            </ScrollView>
        </View>
    );
}
