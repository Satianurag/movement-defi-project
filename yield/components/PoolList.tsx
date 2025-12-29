import { PoolCard, PoolData } from '@/components/PoolCard';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RefreshCwIcon, AlertCircleIcon, InboxIcon } from 'lucide-react-native';
import { View, ScrollView, ActivityIndicator, Platform } from 'react-native';

interface PoolListProps {
    pools: PoolData[];
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    onPoolPress?: (pool: PoolData) => void;
}

function LoadingSkeleton() {
    return (
        <View className="gap-4">
            {[1, 2, 3].map((i) => (
                <Card
                    key={i}
                    className="p-4 opacity-50"
                >
                    {/* Header skeleton */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <View className="h-8 w-8 rounded-full bg-muted" />
                            <View className="h-5 w-24 rounded bg-muted" />
                        </View>
                        <View className="h-6 w-20 rounded-full bg-muted" />
                    </View>
                    {/* Metrics skeleton */}
                    <View className="flex-row gap-4">
                        {[1, 2, 3].map((j) => (
                            <View key={j} className="flex-1 bg-muted/50 rounded-lg p-3">
                                <View className="h-3 w-8 rounded bg-muted mb-2" />
                                <View className="h-5 w-16 rounded bg-muted" />
                            </View>
                        ))}
                    </View>
                </Card>
            ))}
        </View>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <View className="items-center justify-center py-12 px-6">
            <View className="h-16 w-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
                <AlertCircleIcon size={32} className="text-destructive" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">
                Failed to Load Pools
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-6">
                {message}
            </Text>
            {onRetry && (
                <Button onPress={onRetry} variant="outline">
                    <RefreshCwIcon size={16} className="text-foreground" />
                    <Text>Try Again</Text>
                </Button>
            )}
        </View>
    );
}

function EmptyState() {
    return (
        <View className="items-center justify-center py-12 px-6">
            <View className="h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
                <InboxIcon size={32} className="text-muted-foreground" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">
                No Pools Available
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
                There are no DeFi pools to display at the moment. Check back later!
            </Text>
        </View>
    );
}

export function PoolList({
    pools,
    isLoading = false,
    error = null,
    onRetry,
    onPoolPress,
}: PoolListProps) {
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    if (pools.length === 0) {
        return <EmptyState />;
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        >
            {pools.map((pool, index) => (
                <PoolCard
                    key={pool.name || index}
                    pool={pool}
                    onPress={() => onPoolPress?.(pool)}
                />
            ))}
        </ScrollView>
    );
}
