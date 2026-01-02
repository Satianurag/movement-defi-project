import { PoolList } from '@/components/PoolList';
import { PoolData } from '@/components/PoolCard';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePoolsData, calculateTotalTVL, formatTotalTVL } from '@/lib/usePoolsData';
import { View, ScrollView, RefreshControl } from 'react-native';
import {
    CompassIcon,
    TrendingUpIcon,
    CoinsIcon,
    LayersIcon,
    RefreshCwIcon,
    SearchIcon,
    HeartIcon,
    HeartOffIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { TextInput } from 'react-native';
import { useFavorites } from '@/context/FavoritesContext';
import { NetworkStatus } from '@/components/NetworkStatus';

export default function ExploreScreen() {
    const { pools, totalProtocols, isLoading, error, refetch } = usePoolsData();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'stable' | 'volatile' | 'favorites'>('all');
    const { isFavorite, favorites } = useFavorites();

    const totalTVL = calculateTotalTVL(pools);

    const filteredPools = useMemo(() => {
        return pools.filter(pool => {
            const matchesSearch = pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.category?.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeFilter === 'all') return matchesSearch;

            if (activeFilter === 'favorites') {
                return matchesSearch && isFavorite(pool.slug || pool.name);
            }

            // Simple heuristic for demo: assume 'stable' has 'USD' or 'Stable' in name/category
            const isStable = pool.name.includes('USD') || pool.category?.includes('Stable');
            return matchesSearch && (activeFilter === 'stable' ? isStable : !isStable);
        });
    }, [pools, searchQuery, activeFilter, isFavorite]);

    // Check if favorites filter is active but empty
    const showFavoritesEmptyState = activeFilter === 'favorites' && filteredPools.length === 0 && !isLoading;

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
            <ScrollView
                className="flex-1 bg-background"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                stickyHeaderIndices={[0]}
            >
                {/* Header Section */}
                <View className="bg-card border-b border-border px-6 py-4">
                    {/* Title Row */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <CompassIcon size={24} className="text-primary" />
                            <Text className="text-xl font-bold text-foreground">
                                DeFi Pools
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <NetworkStatus />
                            <Button
                                variant="ghost"
                                size="icon"
                                onPress={refetch}
                                disabled={isLoading}
                                testID="explore-refresh-button"
                            >
                                <RefreshCwIcon
                                    size={18}
                                    className={isLoading ? 'text-muted-foreground' : 'text-foreground'}
                                />
                            </Button>
                        </View>
                    </View>

                    {/* Stats Cards Row */}
                    <View className="flex-row gap-3 mb-4">
                        {/* Total TVL */}
                        <Card className="flex-1 bg-primary/5 border-primary/10 p-3">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <CoinsIcon size={14} className="text-primary" />
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Total TVL
                                </Text>
                            </View>
                            <Text className="text-lg font-bold text-foreground">
                                {isLoading ? '...' : formatTotalTVL(totalTVL)}
                            </Text>
                        </Card>

                        {/* Total Protocols */}
                        <Card className="flex-1 bg-muted/50 p-3">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <LayersIcon size={14} className="text-muted-foreground" />
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Protocols
                                </Text>
                            </View>
                            <Text className="text-lg font-bold text-foreground">
                                {isLoading ? '...' : totalProtocols}
                            </Text>
                        </Card>

                        {/* Active Pools */}
                        <Card className="flex-1 bg-emerald-500/5 border-emerald-500/10 p-3">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <TrendingUpIcon size={14} className="text-emerald-500" />
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Available
                                </Text>
                            </View>
                            <Text className="text-lg font-bold text-foreground">
                                {isLoading ? '...' : pools.length}
                            </Text>
                        </Card>
                    </View>

                    {/* Search Input */}
                    <View className="flex-row items-center bg-muted/50 rounded-lg px-3 py-2 border border-border mb-3">
                        <SearchIcon size={18} className="text-muted-foreground mr-2" />
                        <TextInput
                            placeholder="Search pools..."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 text-foreground h-8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            testID="explore-search-input"
                        />
                    </View>

                    {/* Filter Buttons */}
                    <View className="flex-row gap-2 flex-wrap">
                        <Button
                            variant={activeFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full px-4 h-8"
                            onPress={() => setActiveFilter('all')}
                            testID="explore-filter-all"
                        >
                            <Text className={activeFilter === 'all' ? "text-primary-foreground text-xs" : "text-foreground text-xs"}>All</Text>
                        </Button>
                        <Button
                            variant={activeFilter === 'stable' ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full px-4 h-8"
                            onPress={() => setActiveFilter('stable')}
                            testID="explore-filter-stable"
                        >
                            <Text className={activeFilter === 'stable' ? "text-primary-foreground text-xs" : "text-foreground text-xs"}>Stable</Text>
                        </Button>
                        <Button
                            variant={activeFilter === 'volatile' ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full px-4 h-8"
                            onPress={() => setActiveFilter('volatile')}
                            testID="explore-filter-volatile"
                        >
                            <Text className={activeFilter === 'volatile' ? "text-primary-foreground text-xs" : "text-foreground text-xs"}>Volatile</Text>
                        </Button>
                        <Button
                            variant={activeFilter === 'favorites' ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full px-4 h-8 flex-row gap-1"
                            onPress={() => setActiveFilter('favorites')}
                            testID="explore-filter-favorites"
                        >
                            <HeartIcon size={12} className={activeFilter === 'favorites' ? "text-primary-foreground" : "text-foreground"} />
                            <Text className={activeFilter === 'favorites' ? "text-primary-foreground text-xs" : "text-foreground text-xs"}>Favorites</Text>
                        </Button>
                    </View>
                </View>

                {/* Pools List - Now outside header View */}
                <View className="flex-1 px-4 pt-4 pb-6">
                    {showFavoritesEmptyState ? (
                        <View className="items-center justify-center py-12 px-6">
                            <View className="h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
                                <HeartOffIcon size={32} className="text-muted-foreground" />
                            </View>
                            <Text className="text-lg font-semibold text-foreground mb-2">
                                No Favorites Yet
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center mb-4">
                                Tap the heart icon on any pool to add it to your favorites for quick access.
                            </Text>
                            <Button
                                variant="outline"
                                onPress={() => setActiveFilter('all')}
                                testID="explore-view-all-pools"
                            >
                                <Text>View All Pools</Text>
                            </Button>
                        </View>
                    ) : (
                        <PoolList
                            pools={filteredPools}
                            isLoading={isLoading}
                            error={error}
                            onRetry={refetch}
                            onPoolPress={handlePoolPress}
                        />
                    )}
                </View>
            </ScrollView>
        </>
    );
}
