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
    UsersIcon,
} from 'lucide-react-native';
import {
    useMSTStakingInfo,
    useMSTStakingStats,
    useStakeMST,
    useUnstakeMST,
    useClaimMSTRewards
} from '@/lib/useMSTStaking';
import { useWallet } from '@/lib/useWallet';
import { useToast } from '@/context/ToastContext';

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
    return num.toFixed(2);
}

export function MSTStakingCard() {
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState<'stake' | 'unstake'>('stake');
    const { address: userAddress } = useWallet();
    const { showToast } = useToast();

    const { data: stakingInfo } = useMSTStakingInfo(userAddress);
    const { data: stats } = useMSTStakingStats();
    const stakeMST = useStakeMST();
    const unstakeMST = useUnstakeMST();
    const claimRewards = useClaimMSTRewards();

    const hasStakedPosition = stakingInfo && parseFloat(stakingInfo.stakedAmount) > 0;
    const hasPendingRewards = stakingInfo && parseFloat(stakingInfo.pendingRewards) > 0;
    const isLoading = stakeMST.isPending || unstakeMST.isPending || claimRewards.isPending;

    const handleSubmit = () => {
        if (!userAddress) {
            showToast('Please connect your wallet first', 'warning', 'Wallet Required');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            showToast('Please enter a valid amount', 'warning', 'Invalid Amount');
            return;
        }

        if (mode === 'stake') {
            stakeMST.mutate({ amount, userAddress }, {
                onSuccess: () => {
                    showToast(`Staked ${amount} MST`, 'success', 'Success');
                    setAmount('');
                },
                onError: (error: Error) => showToast(error.message, 'error', 'Error'),
            });
        } else {
            unstakeMST.mutate({ amount, userAddress }, {
                onSuccess: () => {
                    showToast(`Unstaked ${amount} MST`, 'success', 'Success');
                    setAmount('');
                },
                onError: (error: Error) => showToast(error.message, 'error', 'Error'),
            });
        }
    };

    const handleClaim = () => {
        if (!userAddress) return;
        claimRewards.mutate({ userAddress }, {
            onSuccess: () => showToast('Rewards claimed!', 'success', 'Success'),
            onError: (error: Error) => showToast(error.message, 'error', 'Error'),
        });
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View className="h-10 w-10 rounded-full bg-purple-500/10 items-center justify-center">
                            <CoinsIcon size={20} className="text-purple-500" />
                        </View>
                        <View>
                            <CardTitle className="text-lg">MST Staking</CardTitle>
                            <CardDescription>Earn protocol rewards</CardDescription>
                        </View>
                    </View>
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20">
                        <Text className="text-purple-500 text-xs font-bold">
                            {stats?.apr.toFixed(1) || '--'}% APR
                        </Text>
                    </Badge>
                </View>
            </CardHeader>

            <CardContent className="pt-4">
                {/* Protocol Stats */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-muted/50 rounded-lg p-3">
                        <View className="flex-row items-center gap-1.5 mb-1">
                            <CoinsIcon size={12} className="text-muted-foreground" />
                            <Text className="text-xs text-muted-foreground">Total Staked</Text>
                        </View>
                        <Text className="text-lg font-bold text-foreground">
                            {stats ? formatAmount(stats.totalStaked) : '--'} MST
                        </Text>
                    </View>

                    <View className="flex-1 bg-muted/50 rounded-lg p-3">
                        <View className="flex-row items-center gap-1.5 mb-1">
                            <UsersIcon size={12} className="text-muted-foreground" />
                            <Text className="text-xs text-muted-foreground">Stakers</Text>
                        </View>
                        <Text className="text-lg font-bold text-foreground">
                            {stats?.totalStakers.toLocaleString() || '--'}
                        </Text>
                    </View>
                </View>

                {/* User Position */}
                {hasStakedPosition && (
                    <View className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 mb-4">
                        <Text className="text-xs text-muted-foreground mb-1">Your Staked</Text>
                        <Text className="text-xl font-bold text-purple-500">
                            {formatAmount(stakingInfo!.stakedAmount)} MST
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
                                    {formatAmount(stakingInfo!.pendingRewards)} MST
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
                        value={amount}
                        onChangeText={setAmount}
                        placeholder={`Amount to ${mode}`}
                        keyboardType="decimal-pad"
                        className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-foreground"
                        placeholderTextColor="#9CA3AF"
                    />
                    <Button
                        variant={mode === 'stake' ? 'default' : 'destructive'}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Text>{isLoading ? '...' : mode === 'stake' ? 'Stake' : 'Unstake'}</Text>
                    </Button>
                </View>
            </CardContent>
        </Card>
    );
}
