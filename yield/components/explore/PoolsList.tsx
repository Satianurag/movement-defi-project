
import { View, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { PoolCard, PoolData } from '@/components/PoolCard';
import { SearchIcon, SlidersHorizontalIcon, XIcon, ListFilterIcon } from 'lucide-react-native';
import { useState, useMemo } from 'react';

interface PoolsListProps {
    pools: PoolData[];
    onPoolPress: (pool: PoolData) => void;
    isLoading?: boolean;
}

export function PoolsList({ pools, onPoolPress, isLoading }: PoolsListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'stable' | 'volatile'>('all');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const filteredPools = useMemo(() => {
        return pools.filter(pool => {
            const matchesSearch = pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.category?.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeFilter === 'all') return matchesSearch;

            const isStable = pool.name.includes('USD') || pool.category?.includes('Stable');
            return matchesSearch && (activeFilter === 'stable' ? isStable : !isStable);
        });
    }, [pools, searchQuery, activeFilter]);

    return (
        <View className="px-4 pb-24">
            {/* Header / Filter Bar */}
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-black text-foreground">
                    All Pools
                </Text>

                <View className="flex-row gap-2">
                    <Button
                        variant={isSearchVisible ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onPress={() => {
                            setIsSearchVisible(!isSearchVisible);
                            if (isSearchVisible) setSearchQuery('');
                        }}
                    >
                        {isSearchVisible ? <XIcon size={18} className="text-foreground" /> : <SearchIcon size={18} className="text-foreground" />}
                    </Button>
                </View>
            </View>

            {/* Expandable Search & Filter Area */}
            {isSearchVisible && (
                <View className="mb-4 gap-3 animate-in fade-in slide-in-from-top-2">
                    <View className="flex-row items-center bg-muted/50 rounded-xl px-3 h-10 border border-border">
                        <SearchIcon size={16} className="text-muted-foreground mr-2" />
                        <TextInput
                            placeholder="Search by name or token..."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 text-foreground text-sm h-full"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>

                    <View className="flex-row gap-2">
                        {['all', 'stable', 'volatile'].map((filter) => (
                            <Button
                                key={filter}
                                variant={activeFilter === filter ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 rounded-full px-3"
                                onPress={() => setActiveFilter(filter as any)}
                            >
                                <Text className={`text-xs capitalize ${activeFilter === filter ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                    {filter}
                                </Text>
                            </Button>
                        ))}
                    </View>
                </View>
            )}

            {/* List */}
            <View className="gap-3">
                {isLoading ? (
                    <Text className="text-center text-muted-foreground py-8">Loading opportunities...</Text>
                ) : filteredPools.length > 0 ? (
                    filteredPools.map((pool) => (
                        <PoolCard
                            key={pool.slug || pool.name}
                            pool={pool}
                            onPress={() => onPoolPress(pool)}
                        />
                    ))
                ) : (
                    <View className="items-center py-8">
                        <Text className="text-muted-foreground font-medium">No pools found matching your criteria</Text>
                        <Button variant="link" onPress={() => { setSearchQuery(''); setActiveFilter('all'); }}>
                            <Text className="text-primary">Clear all filters</Text>
                        </Button>
                    </View>
                )}
            </View>
        </View>
    );
}
