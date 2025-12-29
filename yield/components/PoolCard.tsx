import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
    TrendingUpIcon,
    TrendingDownIcon,
    CoinsIcon,
    PercentIcon,
    LayersIcon,
} from 'lucide-react-native';
import { View, Pressable, Platform } from 'react-native';

// Category color mapping for visual distinction
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Yield Aggregator': {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        border: 'border-emerald-500/20',
    },
    'DEX': {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/20',
    },
    'DEX/AMM': {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/20',
    },
    'Lending': {
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        border: 'border-purple-500/20',
    },
    'Liquidity Management': {
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        border: 'border-orange-500/20',
    },
    'Staking': {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-500',
        border: 'border-cyan-500/20',
    },
    default: {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-border',
    },
};

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
}

// Format large numbers (e.g., 36907132 -> $36.9M)
function formatTVL(value: number): string {
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
}

// Parse change string to determine if positive/negative
function parseChange(change?: string): { value: string; isPositive: boolean } {
    if (!change) return { value: '0%', isPositive: true };
    const isPositive = !change.startsWith('-');
    return { value: change.replace(/^-/, ''), isPositive };
}

// Get APY color based on value range
function getApyColorClass(apy?: string): string {
    if (!apy) return 'text-muted-foreground';
    // Extract first number from APY string (e.g., "8-15%" -> 8)
    const match = apy.match(/(\d+)/);
    if (!match) return 'text-muted-foreground';
    const value = parseInt(match[1], 10);
    if (value >= 15) return 'text-emerald-500';
    if (value >= 8) return 'text-yellow-500';
    return 'text-muted-foreground';
}

export function PoolCard({ pool, onPress }: PoolCardProps) {
    const categoryStyle = CATEGORY_COLORS[pool.category] || CATEGORY_COLORS.default;
    const { value: changeValue, isPositive } = parseChange(pool.change_7d);
    const apyColor = getApyColorClass(pool.apy);

    return (
        <Pressable
            onPress={onPress}
            className={cn(
                'rounded-xl border border-border bg-card p-4 shadow-sm',
                'active:opacity-80 active:scale-[0.98]',
                Platform.select({
                    web: 'hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer',
                })
            )}
        >
            {/* Header: Name + Category */}
            <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
                            <LayersIcon size={16} className="text-primary" />
                        </View>
                        <Text className="text-lg font-semibold text-foreground">
                            {pool.name}
                        </Text>
                    </View>
                </View>
                {/* Category Badge */}
                <View
                    className={cn(
                        'px-2.5 py-1 rounded-full border',
                        categoryStyle.bg,
                        categoryStyle.border
                    )}
                >
                    <Text className={cn('text-xs font-medium', categoryStyle.text)}>
                        {pool.category}
                    </Text>
                </View>
            </View>

            {/* Metrics Grid */}
            <View className="flex-row gap-4">
                {/* TVL */}
                <View className="flex-1 bg-muted/50 rounded-lg p-3">
                    <View className="flex-row items-center gap-1.5 mb-1">
                        <CoinsIcon size={12} className="text-muted-foreground" />
                        <Text className="text-xs text-muted-foreground font-medium">TVL</Text>
                    </View>
                    <Text className="text-base font-bold text-foreground">
                        {formatTVL(pool.tvl)}
                    </Text>
                </View>

                {/* APY */}
                <View className="flex-1 bg-muted/50 rounded-lg p-3">
                    <View className="flex-row items-center gap-1.5 mb-1">
                        <PercentIcon size={12} className="text-muted-foreground" />
                        <Text className="text-xs text-muted-foreground font-medium">APY</Text>
                    </View>
                    <Text className={cn('text-base font-bold', apyColor)}>
                        {pool.apy || 'N/A'}
                    </Text>
                </View>

                {/* 7D Change */}
                <View className="flex-1 bg-muted/50 rounded-lg p-3">
                    <View className="flex-row items-center gap-1.5 mb-1">
                        {isPositive ? (
                            <TrendingUpIcon size={12} className="text-emerald-500" />
                        ) : (
                            <TrendingDownIcon size={12} className="text-red-500" />
                        )}
                        <Text className="text-xs text-muted-foreground font-medium">7D</Text>
                    </View>
                    <Text
                        className={cn(
                            'text-base font-bold',
                            isPositive ? 'text-emerald-500' : 'text-red-500'
                        )}
                    >
                        {isPositive ? '+' : '-'}{changeValue}
                    </Text>
                </View>
            </View>

            {/* APY Source Note (subtle footer) */}
            {pool.apyNote && (
                <View className="mt-3 pt-3 border-t border-border/50">
                    <Text className="text-xs text-muted-foreground italic">
                        {pool.apyNote}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}
