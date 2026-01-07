import { View, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { PoolCard, PoolData, PoolCardSkeleton } from '@/components/PoolCard';
import { SearchIcon, XIcon, ListIcon } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Pressable } from 'react-native';

interface PoolsListProps {
    pools: PoolData[];
    onPoolPress: (pool: PoolData) => void;
    isLoading?: boolean;
}

// Skeleton loading state component
function PoolsListSkeleton() {
    return (
        <View className="gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <PoolCardSkeleton key={i} />
            ))}
        </View>
    );
}

export function PoolsList({ pools, onPoolPress, isLoading }: PoolsListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPools = useMemo(() => {
        if (!searchQuery.trim()) return pools;
        const q = searchQuery.toLowerCase();
        return pools.filter(pool =>
            pool.name.toLowerCase().includes(q) ||
            pool.category?.toLowerCase().includes(q)
        );
    }, [pools, searchQuery]);

    return (
        <View className="flex-1 px-4 pt-4 pb-24">
            {/* Simple Search Bar */}
            <View className="flex-row items-center bg-muted/50 rounded-xl px-3 h-11 border border-border/50 mb-4">
                <SearchIcon size={16} className="text-muted-foreground" />
                <TextInput
                    placeholder="Search pools..."
                    placeholderTextColor="#71717A"
                    className="flex-1 text-foreground text-sm ml-2"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    accessibilityLabel="Search pools"
                    accessibilityHint="Type to filter pools by name or category"
                />
                {searchQuery.length > 0 && (
                    <Pressable
                        onPress={() => setSearchQuery('')}
                        accessibilityLabel="Clear search"
                        accessibilityRole="button"
                    >
                        <XIcon size={16} className="text-muted-foreground" />
                    </Pressable>
                )}
            </View>

            {/* Pool List */}
            <View className="gap-2">
                {isLoading ? (
                    <PoolsListSkeleton />
                ) : filteredPools.length > 0 ? (
                    filteredPools.map((pool) => (
                        <PoolCard
                            key={pool.slug || pool.name}
                            pool={pool}
                            onPress={() => onPoolPress(pool)}
                        />
                    ))
                ) : (
                    <View className="items-center py-12">
                        <View className="h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
                            <ListIcon size={28} className="text-muted-foreground" />
                        </View>
                        <Text className="text-lg font-semibold text-foreground mb-1">No pools found</Text>
                        <Text className="text-muted-foreground text-center px-8">
                            {searchQuery
                                ? `No results for "${searchQuery}"`
                                : 'No pools available at the moment'}
                        </Text>
                        {searchQuery && (
                            <Pressable
                                onPress={() => setSearchQuery('')}
                                className="mt-4"
                                accessibilityLabel="Clear search"
                                accessibilityRole="button"
                            >
                                <Text className="text-primary font-semibold">Clear search</Text>
                            </Pressable>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

