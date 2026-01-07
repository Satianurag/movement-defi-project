import React, { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FarmList } from '@/components/farming/FarmList';
import { MSTStakingCard } from '@/components/staking/MSTStakingCard';
import { USDMCard } from '@/components/stablecoin/USDMCard';
import { CoinsIcon, LayersIcon, TrendingUpIcon, WalletIcon } from 'lucide-react-native';
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
                {/* Enhanced Section Selector with unified styling */}
                <View className="flex-row px-4 py-3 gap-2 border-b border-border bg-card/80">
                    <Button
                        variant={activeSection === 'farms' ? 'default' : 'ghost'}
                        size="sm"
                        onPress={() => setActiveSection('farms')}
                        className={`flex-1 ${activeSection === 'farms' ? 'shadow-lg shadow-primary/20' : ''}`}
                    >
                        <LayersIcon size={16} className={activeSection === 'farms' ? "text-primary-foreground" : "text-muted-foreground"} />
                        <Text className={activeSection === 'farms' ? "text-primary-foreground font-semibold" : "text-foreground"}>Farms</Text>
                        {/* Badge placeholder for count */}
                    </Button>
                    <Button
                        variant={activeSection === 'staking' ? 'default' : 'ghost'}
                        size="sm"
                        onPress={() => setActiveSection('staking')}
                        className={`flex-1 ${activeSection === 'staking' ? 'shadow-lg shadow-primary/20' : ''}`}
                    >
                        <TrendingUpIcon size={16} className={activeSection === 'staking' ? "text-primary-foreground" : "text-muted-foreground"} />
                        <Text className={activeSection === 'staking' ? "text-primary-foreground font-semibold" : "text-foreground"}>Staking</Text>
                    </Button>
                    <Button
                        variant={activeSection === 'stablecoin' ? 'default' : 'ghost'}
                        size="sm"
                        onPress={() => setActiveSection('stablecoin')}
                        className={`flex-1 ${activeSection === 'stablecoin' ? 'shadow-lg shadow-primary/20' : ''}`}
                    >
                        <CoinsIcon size={16} className={activeSection === 'stablecoin' ? "text-primary-foreground" : "text-muted-foreground"} />
                        <Text className={activeSection === 'stablecoin' ? "text-primary-foreground font-semibold" : "text-foreground"}>USDM</Text>
                    </Button>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerClassName="p-4 gap-4 pb-24"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FA4616" />
                    }
                >
                    {/* Enhanced Connection Banner */}
                    {!address && (
                        <View className="bg-warning/10 border border-warning/30 p-4 rounded-xl mb-4">
                            <View className="flex-row items-center gap-3">
                                <View className="h-10 w-10 rounded-full bg-warning/20 items-center justify-center">
                                    <WalletIcon size={20} className="text-warning" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold">Connect Wallet</Text>
                                    <Text className="text-muted-foreground text-sm">Sign in to earn rewards</Text>
                                </View>
                                <Button size="sm" onPress={() => require('expo-router').router.push('/sign-in')}>
                                    <Text className="font-semibold">Connect</Text>
                                </Button>
                            </View>
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
