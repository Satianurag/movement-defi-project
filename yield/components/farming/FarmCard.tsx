import React, { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
    CoinsIcon,
    TrendingUpIcon,
    GiftIcon,
    PlusIcon,
    MinusIcon,
} from 'lucide-react-native';
import {
    Farm,
    FarmPosition,
    useClaimFarmRewards,
    usePendingRewards
} from '@/lib/useFarms';
import { useWallet } from '@/lib/useWallet';

interface FarmCardProps {
    farm: Farm;
    position?: FarmPosition;
    onStake?: (amount: string) => void;
    onUnstake?: (amount: string) => void;
}

function formatAmount(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(4);
}

export function FarmCard({ farm, position, onStake, onUnstake }: FarmCardProps) {
    const [stakeAmount, setStakeAmount] = useState('');
    const [mode, setMode] = useState<'stake' | 'unstake'>('stake');
    const { address: userAddress } = useWallet();

    const { data: pendingRewards } = usePendingRewards(farm.farmId, userAddress);
    const claimRewards = useClaimFarmRewards();

    const hasStakedPosition = position && parseFloat(position.stakedAmount) > 0;
    const hasPendingRewards = pendingRewards && parseFloat(pendingRewards.pendingRewards) > 0;

    const handleStake = () => {
        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount to stake');
            return;
        }
        onStake?.(stakeAmount);
        setStakeAmount('');
    };

    const handleUnstake = () => {
        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount to unstake');
            return;
        }
        onUnstake?.(stakeAmount);
        setStakeAmount('');
    };

    const handleClaim = () => {
        if (!userAddress) {
            Alert.alert('Wallet Required', 'Please connect your wallet first');
            return;
        }
        claimRewards.mutate({ farmId: farm.farmId, userAddress });
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View className="h-10 w-10 rounded-full bg-emerald-500/10 items-center justify-center">
                            <CoinsIcon size={20} className="text-emerald-500" />
                        </View>
                        <View>
                            <CardTitle className="text-lg">{farm.lpToken}</CardTitle>
                            <CardDescription>Earn {farm.rewardToken}</CardDescription>
                        </View>
                    </View>
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20">
                        <Text className="text-emerald-500 text-xs font-bold">{farm.multiplier}x</Text>
                    </Badge>
                </View>
            </CardHeader>

            <CardContent className="pt-4">
                {/* Stats Row */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-muted/50 rounded-lg p-3">
                        <View className="flex-row items-center gap-1.5 mb-1">
                            <TrendingUpIcon size={12} className="text-emerald-500" />
                            <Text className="text-xs text-muted-foreground">APR</Text>
                        </View>
                        <Text className="text-lg font-bold text-emerald-500">
                            {farm.apr.toFixed(1)}%
                        </Text>
                    </View>

                    <View className="flex-1 bg-muted/50 rounded-lg p-3">
                        <View className="flex-row items-center gap-1.5 mb-1">
                            <CoinsIcon size={12} className="text-muted-foreground" />
                            <Text className="text-xs text-muted-foreground">Total Staked</Text>
                        </View>
                        <Text className="text-lg font-bold text-foreground">
                            {formatAmount(farm.totalStaked)}
                        </Text>
                    </View>
                </View>

                {/* User Position */}
                {hasStakedPosition && (
                    <View className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                        <Text className="text-xs text-muted-foreground mb-1">Your Staked</Text>
                        <Text className="text-xl font-bold text-primary">
                            {formatAmount(position!.stakedAmount)} LP
                        </Text>
                    </View>
                )}

                {/* Pending Rewards */}
                {hasPendingRewards && (
                    <View className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-4">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-xs text-muted-foreground mb-1">Pending Rewards</Text>
                                <Text className="text-lg font-bold text-amber-500">
                                    {formatAmount(pendingRewards!.pendingRewards)} {pendingRewards!.rewardToken}
                                </Text>
                            </View>
                            <Button
                                variant="outline"
                                size="sm"
                                onPress={handleClaim}
                                disabled={claimRewards.isPending}
                            >
                                <GiftIcon size={14} className="text-amber-500" />
                                <Text className="text-amber-500 text-sm font-medium">
                                    {claimRewards.isPending ? 'Claiming...' : 'Claim'}
                                </Text>
                            </Button>
                        </View>
                    </View>
                )}

                {/* Mode Toggle */}
                <View className="flex-row gap-2 mb-3">
                    <Button
                        variant={mode === 'stake' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onPress={() => setMode('stake')}
                    >
                        <PlusIcon size={14} />
                        <Text>Stake</Text>
                    </Button>
                    <Button
                        variant={mode === 'unstake' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onPress={() => setMode('unstake')}
                        disabled={!hasStakedPosition}
                    >
                        <MinusIcon size={14} />
                        <Text>Unstake</Text>
                    </Button>
                </View>

                {/* Amount Input */}
                <View className="flex-row gap-2">
                    <TextInput
                        value={stakeAmount}
                        onChangeText={setStakeAmount}
                        placeholder={`Amount to ${mode}`}
                        keyboardType="decimal-pad"
                        className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-foreground"
                        placeholderTextColor="#9CA3AF"
                    />
                    <Button
                        variant={mode === 'stake' ? 'default' : 'destructive'}
                        onPress={mode === 'stake' ? handleStake : handleUnstake}
                    >
                        <Text>{mode === 'stake' ? 'Stake LP' : 'Unstake'}</Text>
                    </Button>
                </View>
            </CardContent>
        </Card>
    );
}
