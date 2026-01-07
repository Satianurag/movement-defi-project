import { PoolCard, PoolData } from '@/components/PoolCard';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { RefreshCwIcon, AlertCircleIcon, InboxIcon } from 'lucide-react-native';
import { View, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';

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
                    className="p-4"
                >
                    {/* Header skeleton */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-5 w-24 rounded" />
                        </View>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </View>
                    {/* Metrics skeleton */}
                    <View className="flex-row gap-4">
                        {[1, 2, 3].map((j) => (
                            <View key={j} className="flex-1 Sbg-muted/50 rounded-lg p-3">
                                <Skeleton className="h-3 w-8 rounded mb-2" />
                                <Skeleton className="h-5 w-16 rounded" />
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

import { FlatList } from 'react-native';
import { useResponsive } from '@/lib/useResponsive';

export function PoolList({
    pools,
    isLoading = false,
    error = null,
    onRetry,
    onPoolPress,
}: PoolListProps) {
    const { numColumns } = useResponsive();

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
        <View className="flex-1">
            <FlatList
                key={numColumns} // Force re-render when columns change
                data={pools}
                renderItem={({ item }) => (
                    <View style={{ flex: 1, padding: 8 }}>
                        <PoolCard
                            pool={item}
                            onPress={() => onPoolPress?.(item)}
                        />
                    </View>
                )}
                keyExtractor={(item, index) => item.slug || item.name || index.toString()}
                numColumns={numColumns}
                contentContainerStyle={{ padding: 8 }}
                columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
