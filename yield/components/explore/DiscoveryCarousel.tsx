import { View, ScrollView, Pressable, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PoolData } from '@/components/PoolCard';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/utils';
import { TrendingUpIcon, FlameIcon, SparklesIcon, ArrowRightIcon } from 'lucide-react-native';

interface DiscoveryCarouselProps {
    pools: PoolData[];
    onPoolPress: (pool: PoolData) => void;
    isLoading?: boolean;
}

function DiscoveryCard({ pool, onPress }: { pool: PoolData; onPress: () => void }) {
    // Generate a pseudo-random gradient based on pool name length for variety
    const isNew = pool.name.length % 3 === 0;
    const isHot = !isNew;

    return (
        <Pressable onPress={onPress}>
            <Card className="w-[280px] h-[160px] ml-4 overflow-hidden border-0 shadow-lg relative group">
                <LinearGradient
                    colors={['#FA4616', '#fa6944']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0 opacity-90"
                />

                {/* Decorative background circle */}
                <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                <View className="p-5 h-full justify-between">
                    <View className="flex-row justify-between items-start">
                        {/* Status Badge */}
                        <Badge
                            variant="secondary"
                            className={cn(
                                "border-white/20 backdrop-blur-md",
                                isHot ? "bg-orange-500/30" : "bg-blue-500/30"
                            )}
                        >
                            <View className="flex-row items-center gap-1">
                                {isHot ? (
                                    <FlameIcon size={12} className="text-white" fill="currentColor" />
                                ) : (
                                    <SparklesIcon size={12} className="text-white" fill="currentColor" />
                                )}
                                <Text className="text-white text-xs font-bold">
                                    {isHot ? 'HOT' : 'NEW'}
                                </Text>
                            </View>
                        </Badge>

                        {/* APY Badge */}
                        <View className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                            <Text className="text-white font-bold text-xs">
                                {pool.apy} APY
                            </Text>
                        </View>
                    </View>

                    <View>
                        <Text className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">
                            {pool.category}
                        </Text>
                        <Text className="text-white text-xl font-bold mb-2" numberOfLines={1}>
                            {pool.name}
                        </Text>
                        <View className="flex-row items-center gap-2">
                            <View className="bg-white/20 rounded-full px-2 py-0.5">
                                <Text className="text-white text-xs font-medium">
                                    TVL: {formatTVL(pool.tvl)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Card>
        </Pressable>
    );
}

function formatTVL(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
}

export function DiscoveryCarousel({ pools, onPoolPress, isLoading }: DiscoveryCarouselProps) {
    // Sort by APY for "discovery" logic
    const featuredPools = pools
        .slice()
        .sort((a, b) => {
            const getAPY = (p: PoolData) => parseFloat((p.apy || '0').replace('%', ''));
            return getAPY(b) - getAPY(a);
        })
        .slice(0, 5);

    if (isLoading) {
        return (
            <View>
                <View className="px-4 mb-3 flex-row items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-16" />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-0">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <View key={i} className="ml-4">
                            <Skeleton className="w-[280px] h-[160px] rounded-xl" />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View className="mb-6">
            <View className="px-4 mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <FlameIcon size={18} className="text-primary" />
                    <Text className="text-lg font-bold text-foreground">Discover</Text>
                </View>
                <Pressable className="flex-row items-center">
                    <Text className="text-primary text-sm font-medium mr-1">View All</Text>
                    <ArrowRightIcon size={14} className="text-primary" />
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
            >
                {featuredPools.map((pool) => (
                    <DiscoveryCard
                        key={pool.slug || pool.name}
                        pool={pool}
                        onPress={() => onPoolPress(pool)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
