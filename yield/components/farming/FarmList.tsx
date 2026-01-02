import React from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { FarmCard } from './FarmCard';
import { useFarms, useUserFarmPositions, useStakeLP, useUnstakeLP, Farm } from '@/lib/useFarms';
import { useWallet } from '@/lib/useWallet';
import { LeafIcon } from 'lucide-react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function FarmList() {
    const { address: userAddress } = useWallet();
    const { data: farms, isLoading, error, refetch, isRefetching } = useFarms();
    const { data: positions } = useUserFarmPositions(userAddress);

    const stakeLP = useStakeLP();
    const unstakeLP = useUnstakeLP();

    const getPositionForFarm = (farmId: number) => {
        return positions?.find((p: { farmId: number }) => p.farmId === farmId);
    };

    const handleStake = (farmId: number, lpTokenType: string) => (amount: string) => {
        if (!userAddress) return;
        stakeLP.mutate({
            farmId,
            lpTokenType,
            amount,
            userAddress,
        });
    };

    const handleUnstake = (farmId: number, lpTokenType: string) => (amount: string) => {
        if (!userAddress) return;
        unstakeLP.mutate({
            farmId,
            lpTokenType,
            amount,
            userAddress,
        });
    };

    if (isLoading) {
        return (
            <View className="p-4 gap-4">
                {[1, 2].map((i) => (
                    <Card key={i} className="p-4">
                        <View className="flex-row items-center gap-3 mb-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <View className="gap-2">
                                <Skeleton className="h-4 w-32" />
                            </View>
                        </View>
                        <View className="gap-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </View>
                    </Card>
                ))}
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center py-12">
                <Text className="text-destructive">Failed to load farms</Text>
                <Text className="text-muted-foreground text-sm mt-2">{error.message}</Text>
            </View>
        );
    }

    if (!farms || farms.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-12">
                <LeafIcon size={48} className="text-muted-foreground mb-4" />
                <Text className="text-muted-foreground">No farms available</Text>
            </View>
        );
    }

    return (
        <View className="w-full gap-4">

            {/* Header */}
            <View className="flex-row items-center gap-2 mb-4">
                <LeafIcon size={24} className="text-emerald-500" />
                <Text className="text-2xl font-bold text-foreground">Farms</Text>
            </View>

            <Text className="text-muted-foreground mb-4">
                Stake LP tokens to earn rewards
            </Text>

            {/* Farm Cards */}
            {farms.map((farm: Farm) => (
                <FarmCard
                    key={farm.farmId}
                    farm={farm}
                    position={getPositionForFarm(farm.farmId)}
                    onStake={handleStake(farm.farmId, farm.lpToken)}
                    onUnstake={handleUnstake(farm.farmId, farm.lpToken)}
                />
            ))}
        </View>
    );
}
