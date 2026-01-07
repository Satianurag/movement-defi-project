import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    TrendingUpIcon,
    TrendingDownIcon,
    ChevronRightIcon,
} from 'lucide-react-native';
import { View, Pressable, Platform } from 'react-native';

export interface PoolData {
    name: string;
    tvl: number;
    category: string;
    change_7d?: string;
    apy?: string;
    apyNote?: string;
    apySource?: string;
    slug?: string;
    logo?: string;
}

interface PoolCardProps {
    pool: PoolData;
    onPress?: () => void;
    loading?: boolean;
}

function formatTVL(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
}

function parseChange(change?: string): { value: string; isPositive: boolean } {
    if (!change) return { value: '0%', isPositive: true };
    const isPositive = !change.startsWith('-');
    return { value: change.replace(/^-/, ''), isPositive };
}

// Skeleton loading state
function PoolCardSkeleton() {
    return (
        <Card className="overflow-hidden border-border/50">
            <View className="flex-row items-center justify-between p-4">
                {/* Left: Name & Category skeleton */}
                <View className="flex-1 mr-3 gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </View>

                {/* Right: APY & Change skeleton */}
                <View className="items-end mr-2 gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                </View>

                {/* Chevron placeholder */}
                <View className="w-[18px]" />
            </View>
        </Card>
    );
}

import React from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';

function PoolCardComponent({ pool, onPress, loading }: PoolCardProps) {
    if (loading) {
        return <PoolCardSkeleton />;
    }

    const { value: changeValue, isPositive } = parseChange(pool.change_7d);

    // Determine APY color based on value
    const apyColor = pool.apy?.includes('%')
        ? 'text-primary'
        : 'text-foreground';

    return (
        <Card className="overflow-hidden border-border/50">
            <Pressable
                onPress={onPress}
                className={cn(
                    'flex-row items-center justify-between p-4',
                    'active:bg-muted/50',
                    Platform.select({
                        web: 'hover:bg-muted/20 hover:scale-[1.01] hover:shadow-sm transition-all duration-300 cursor-pointer',
                    })
                )}
                accessibilityRole="button"
                accessibilityLabel={`${pool.name} pool with ${pool.apy || 'unknown'} APY`}
            >
                {/* Left: Name & Category */}
                <View className="flex-1 mr-3">
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {pool.name}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                        <Text className="text-xs text-muted-foreground">{pool.category}</Text>
                        <Text className="text-xs text-muted-foreground">·</Text>
                        <AnimatedNumber
                            value={pool.tvl}
                            formatter={formatTVL}
                            className="text-xs text-muted-foreground"
                        />
                    </View>
                </View>

                {/* Right: APY & Change */}
                <View className="items-end mr-2">
                    <Text className={cn('text-base font-bold', apyColor)}>
                        {pool.apy || 'N/A'}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                        {isPositive ? (
                            <TrendingUpIcon size={12} className="text-success" />
                        ) : (
                            <TrendingDownIcon size={12} className="text-destructive" />
                        )}
                        <Text className={cn('text-xs font-medium', isPositive ? 'text-success' : 'text-destructive')}>
                            {isPositive ? '+' : '-'}{changeValue}
                        </Text>
                    </View>
                </View>

                {/* Chevron */}
                <ChevronRightIcon size={18} className="text-muted-foreground" />
            </Pressable>
        </Card>
    );
}

// Memoize the component to prevent unnecessary re-renders
export const PoolCard = React.memo(PoolCardComponent, (prev, next) => {
    return (
        prev.pool.name === next.pool.name &&
        prev.pool.tvl === next.pool.tvl &&
        prev.pool.apy === next.pool.apy &&
        prev.pool.change_7d === next.pool.change_7d &&
        prev.loading === next.loading
    );
});

export { PoolCardSkeleton };

