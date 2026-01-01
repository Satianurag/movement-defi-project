import React, { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import {
    DollarSignIcon,
    TrendingUpIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    ShieldIcon,
} from 'lucide-react-native';
import { useUSDMPosition, useMintUSDM, useBurnUSDM } from '@/lib/useUSDM';
import { useWallet } from '@/lib/useWallet';
import { useToast } from '@/context/ToastContext';

function formatAmount(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(2);
}

const COLLATERAL_TYPES = ['MOVE', 'USDC', 'ETH', 'BTC'];

export function USDMCard() {
    const [mode, setMode] = useState<'mint' | 'burn'>('mint');
    const [collateralType, setCollateralType] = useState('MOVE');
    const [collateralAmount, setCollateralAmount] = useState('');
    const [usdmAmount, setUsdmAmount] = useState('');
    const { address: userAddress } = useWallet();
    const { showToast } = useToast();

    const { data: position } = useUSDMPosition(userAddress, collateralType);
    const mintUSDM = useMintUSDM();
    const burnUSDM = useBurnUSDM();

    const hasPosition = position && parseFloat(position.debt) > 0;
    const isLoading = mintUSDM.isPending || burnUSDM.isPending;

    const getStatusColor = () => {
        if (!position) return 'text-muted-foreground';
        switch (position.status) {
            case 'safe': return 'text-emerald-500';
            case 'warning': return 'text-amber-500';
            case 'danger': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    const handleSubmit = () => {
        if (!userAddress) {
            showToast('Please connect your wallet first', 'warning', 'Wallet Required');
            return;
        }

        if (mode === 'mint') {
            if (!collateralAmount || !usdmAmount) {
                showToast('Please enter both collateral and USDM amounts', 'warning', 'Invalid Input');
                return;
            }
            mintUSDM.mutate({
                collateralType,
                collateralAmount,
                usdmAmount,
                userAddress
            }, {
                onSuccess: () => {
                    showToast(`Minted ${usdmAmount} USDM`, 'success', 'Success');
                    setCollateralAmount('');
                    setUsdmAmount('');
                },
                onError: (error: Error) => showToast(error.message, 'error', 'Error'),
            });
        } else {
            if (!usdmAmount) {
                showToast('Please enter USDM amount to burn', 'warning', 'Invalid Input');
                return;
            }
            burnUSDM.mutate({
                collateralType,
                usdmAmount,
                userAddress
            }, {
                onSuccess: () => {
                    showToast(`Burned ${usdmAmount} USDM`, 'success', 'Success');
                    setUsdmAmount('');
                },
                onError: (error: Error) => showToast(error.message, 'error', 'Error'),
            });
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View className="h-10 w-10 rounded-full bg-blue-500/10 items-center justify-center">
                            <DollarSignIcon size={20} className="text-blue-500" />
                        </View>
                        <View>
                            <CardTitle className="text-lg">USDM Stablecoin</CardTitle>
                            <CardDescription>Collateralized minting</CardDescription>
                        </View>
                    </View>
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20">
                        <Text className="text-blue-500 text-xs font-bold">1 USDM = $1</Text>
                    </Badge>
                </View>
            </CardHeader>

            <CardContent className="pt-4">
                {/* Current Position */}
                {hasPosition && (
                    <View className="bg-muted/50 rounded-lg p-4 mb-4">
                        <Text className="text-sm font-medium text-foreground mb-3">Your Position</Text>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Text className="text-xs text-muted-foreground mb-1">Collateral</Text>
                                <Text className="text-lg font-bold text-foreground">
                                    {formatAmount(position!.collateral)} {collateralType}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-muted-foreground mb-1">Debt</Text>
                                <Text className="text-lg font-bold text-foreground">
                                    {formatAmount(position!.debt)} USDM
                                </Text>
                            </View>
                        </View>

                        {/* Collateral Ratio */}
                        <View className="mt-3 pt-3 border-t border-border">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-1.5">
                                    <ShieldIcon size={14} className={getStatusColor()} />
                                    <Text className="text-sm text-muted-foreground">Collateral Ratio</Text>
                                </View>
                                <Text className={cn('text-lg font-bold', getStatusColor())}>
                                    {position!.collateralRatio.toFixed(0)}%
                                </Text>
                            </View>
                            <View className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                                <View
                                    className={cn(
                                        'h-full rounded-full',
                                        position!.status === 'safe' ? 'bg-emerald-500' :
                                            position!.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `${Math.min(position!.collateralRatio / 2, 100)}%` }}
                                />
                            </View>
                            <View className="flex-row justify-between mt-1">
                                <Text className="text-xs text-red-500">110% (Min)</Text>
                                <Text className="text-xs text-emerald-500">200%+ (Safe)</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Mode Toggle */}
                <View className="flex-row gap-2 mb-4">
                    <Button
                        variant={mode === 'mint' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onPress={() => setMode('mint')}
                    >
                        <ArrowDownIcon size={14} />
                        <Text>Mint USDM</Text>
                    </Button>
                    <Button
                        variant={mode === 'burn' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onPress={() => setMode('burn')}
                        disabled={!hasPosition}
                    >
                        <ArrowUpIcon size={14} />
                        <Text>Burn USDM</Text>
                    </Button>
                </View>

                {/* Collateral Type Selector */}
                <View className="mb-4">
                    <Text className="text-sm text-muted-foreground mb-2">Collateral Type</Text>
                    <View className="flex-row gap-2">
                        {COLLATERAL_TYPES.map((type) => (
                            <Button
                                key={type}
                                variant={collateralType === type ? 'default' : 'outline'}
                                size="sm"
                                onPress={() => setCollateralType(type)}
                            >
                                <Text>{type}</Text>
                            </Button>
                        ))}
                    </View>
                </View>

                {/* Inputs */}
                {mode === 'mint' && (
                    <View className="mb-4">
                        <Text className="text-sm text-muted-foreground mb-2">Collateral Amount</Text>
                        <TextInput
                            value={collateralAmount}
                            onChangeText={setCollateralAmount}
                            placeholder={`${collateralType} to deposit`}
                            keyboardType="decimal-pad"
                            className="h-12 px-4 rounded-md border border-border bg-background text-foreground text-lg mb-3"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                )}

                <View className="mb-4">
                    <Text className="text-sm text-muted-foreground mb-2">
                        USDM to {mode === 'mint' ? 'Mint' : 'Burn'}
                    </Text>
                    <TextInput
                        value={usdmAmount}
                        onChangeText={setUsdmAmount}
                        placeholder="USDM amount"
                        keyboardType="decimal-pad"
                        className="h-12 px-4 rounded-md border border-border bg-background text-foreground text-lg"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Submit Button */}
                <Button
                    variant={mode === 'mint' ? 'default' : 'destructive'}
                    className="w-full"
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <DollarSignIcon size={16} />
                    <Text>
                        {isLoading
                            ? 'Processing...'
                            : mode === 'mint'
                                ? 'Mint USDM'
                                : 'Burn USDM'
                        }
                    </Text>
                </Button>
            </CardContent>
        </Card>
    );
}
