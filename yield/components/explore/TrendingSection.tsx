
import { View, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { PoolCard, PoolData } from '@/components/PoolCard';
import { FlameIcon, TrendingUpIcon } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';

interface TrendingSectionProps {
    pools: PoolData[];
    onPoolPress: (pool: PoolData) => void;
}

export function TrendingSection({ pools, onPoolPress }: TrendingSectionProps) {
    const [activeTab, setActiveTab] = useState<'gainers' | 'yield'>('yield');

    const trendingPools = useMemo(() => {
        const sorted = [...pools];
        if (activeTab === 'gainers') {
            // Sort by 7d change descending
            return sorted.sort((a, b) => {
                const getVal = (s?: string) => parseFloat(s?.replace(/[^0-9.-]/g, '') || '0');
                return getVal(b.change_7d) - getVal(a.change_7d);
            }).slice(0, 5);
        } else {
            // Sort by APY descending (simple parsing)
            return sorted.sort((a, b) => {
                const getVal = (s?: string) => {
                    const match = s?.match(/(\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
                };
                return getVal(b.apy) - getVal(a.apy);
            }).slice(0, 5);
        }
    }, [pools, activeTab]);

    return (
        <View className="mb-8">
            <View className="px-4 mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    {activeTab === 'yield' ?
                        <FlameIcon size={16} className="text-orange-500" fill="currentColor" /> :
                        <TrendingUpIcon size={16} className="text-success" />
                    }
                    <Text className="text-lg font-bold text-foreground">
                        {activeTab === 'yield' ? 'High Yield' : 'Top Gainers'}
                    </Text>
                </View>

                {/* Toggle */}
                <View className="flex-row bg-muted/50 rounded-full p-1 border border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-3 rounded-full ${activeTab === 'yield' ? 'bg-background shadow-sm' : ''}`}
                        onPress={() => setActiveTab('yield')}
                    >
                        <Text className={`text-[10px] font-bold ${activeTab === 'yield' ? 'text-primary' : 'text-muted-foreground'}`}>
                            Yield
                        </Text>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-3 rounded-full ${activeTab === 'gainers' ? 'bg-background shadow-sm' : ''}`}
                        onPress={() => setActiveTab('gainers')}
                    >
                        <Text className={`text-[10px] font-bold ${activeTab === 'gainers' ? 'text-success' : 'text-muted-foreground'}`}>
                            Gainers
                        </Text>
                    </Button>
                </View>
            </View>

            <View className="px-4 gap-3">
                {trendingPools.map((pool) => (
                    <PoolCard
                        key={pool.slug || pool.name}
                        pool={pool}
                        onPress={() => onPoolPress(pool)}
                    />
                ))}
            </View>
        </View>
    );
}
