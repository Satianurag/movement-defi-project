
import { View, ScrollView, RefreshControl, ImageBackground } from 'react-native';
import { Stack, router } from 'expo-router';
import { usePoolsData, calculateTotalTVL } from '@/lib/usePoolsData';
import { PoolData } from '@/components/PoolCard';
import { useState, useCallback, useMemo } from 'react';

// New Components
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { DiscoveryCarousel } from '@/components/explore/DiscoveryCarousel';
import { MarketPulse } from '@/components/explore/MarketPulse';
import { TrendingSection } from '@/components/explore/TrendingSection';
import { PoolsList } from '@/components/explore/PoolsList';

export default function ExploreScreen() {
    const { pools, totalProtocols, isLoading, refetch } = usePoolsData();
    const [refreshing, setRefreshing] = useState(false);

    const totalTVL = calculateTotalTVL(pools);

    // Find highest APY for Market Pulse
    const topAPY = useMemo(() => {
        if (!pools.length) return "0%";
        // Simply finding the string with highest number for display
        // In prod, this would be a calculated number
        const apys = pools.map(p => {
            const match = p.apy?.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });
        const max = Math.max(...apys);
        return max > 0 ? `~${max}%` : "N/A";
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

            {/* Header - Fixed at top */}
            <ExploreHeader />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FA4616" // Primary orange
                        colors={["#FA4616"]}
                    />
                }
                contentContainerStyle={{ paddingTop: 8 }}
            >
                {/* 1. Hero / Discovery */}
                <DiscoveryCarousel />

                {/* 2. Global Stats */}
                <MarketPulse
                    totalTVL={totalTVL}
                    topAPY={topAPY}
                    activePools={pools.length}
                    isLoading={isLoading}
                />

                {/* 3. Trending & Hot */}
                <TrendingSection
                    pools={pools}
                    onPoolPress={handlePoolPress}
                />

                {/* 4. Full List with Filters */}
                <PoolsList
                    pools={pools}
                    onPoolPress={handlePoolPress}
                    isLoading={isLoading}
                />
            </ScrollView>
        </View>
    );
}
