import React, { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FarmList } from '@/components/farming/FarmList';
import { MSTStakingCard } from '@/components/staking/MSTStakingCard';
import { USDMCard } from '@/components/stablecoin/USDMCard';
import { CoinsIcon, LayersIcon, TrendingUpIcon } from 'lucide-react-native';
import { cn } from '@/lib/utils';

import { useWallet } from '@/lib/useWallet';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useQueryClient } from '@tanstack/react-query';

type EarnSection = 'farms' | 'staking' | 'stablecoin';

export default function EarnScreen() {
    const insets = useSafeAreaInsets();
    const [activeSection, setActiveSection] = useState<EarnSection>('farms');
    const [refreshing, setRefreshing] = useState(false);
    const { address } = useWallet();
    const queryClient = useQueryClient();

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['farms'] }),
            // Add other queries here
        ]);
        setRefreshing(false);
    }, [queryClient]);

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Earn Yield',
                    headerShown: true,
                    headerRight: () => (
                        <View className="mr-4">
                            <NetworkStatus />
                        </View>
                    ),
                }}
            />
            <View className="flex-1 bg-background">
                {/* Section Selector */}
                <View className="flex-row px-4 py-4 gap-2 border-b border-border bg-card">
                    <Button
                        variant={activeSection === 'farms' ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setActiveSection('farms')}
                        className="flex-1"
                    >
                        <LayersIcon size={16} className={activeSection === 'farms' ? "text-primary-foreground" : "text-foreground"} />
                        <Text>Farms</Text>
                    </Button>
                    <Button
                        variant={activeSection === 'staking' ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setActiveSection('staking')}
                        className="flex-1"
                    >
                        <TrendingUpIcon size={16} className={activeSection === 'staking' ? "text-primary-foreground" : "text-foreground"} />
                        <Text>Staking</Text>
                    </Button>
                    <Button
                        variant={activeSection === 'stablecoin' ? 'default' : 'outline'}
                        size="sm"
                        onPress={() => setActiveSection('stablecoin')}
                        className="flex-1"
                    >
                        <CoinsIcon size={16} className={activeSection === 'stablecoin' ? "text-primary-foreground" : "text-foreground"} />
                        <Text>USDM</Text>
                    </Button>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerClassName="p-4 gap-4 pb-24"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {!address && (
                        <View className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mb-4">
                            <Text className="text-amber-500 text-center font-medium">
                                Connect wallet to earn rewards
                            </Text>
                        </View>
                    )}

                    {activeSection === 'farms' && (
                        <View>
                            <View className="mb-4">
                                <Text className="text-2xl font-bold text-foreground">Liquidity Mining</Text>
                                <Text className="text-muted-foreground">Provide liquidity to earn MST rewards</Text>
                            </View>
                            <FarmList />
                        </View>
                    )}

                    {activeSection === 'staking' && (
                        <View>
                            <View className="mb-4">
                                <Text className="text-2xl font-bold text-foreground">MST Staking</Text>
                                <Text className="text-muted-foreground">Stake MST to share protocol revenue</Text>
                            </View>
                            <MSTStakingCard />
                        </View>
                    )}

                    {activeSection === 'stablecoin' && (
                        <View>
                            <View className="mb-4">
                                <Text className="text-2xl font-bold text-foreground">USDM Stablecoin</Text>
                                <Text className="text-muted-foreground">Mint stablecoin against your crypto assets</Text>
                            </View>
                            <USDMCard />
                        </View>
                    )}
                </ScrollView>
            </View>
        </>
    );
}
