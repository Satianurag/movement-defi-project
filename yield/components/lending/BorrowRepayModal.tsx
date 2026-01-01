import React, { useState } from 'react';
import { View, TextInput, Alert, Modal, Pressable } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    XIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    WalletIcon,
} from 'lucide-react-native';
import { HealthFactorBar } from './HealthFactorBar';
import { GasFeePreview } from '@/components/GasFeePreview'; // Assume absolute path or relative
import { useBorrow, useRepay, useHealthFactor } from '@/lib/useBorrow';
import { useWallet } from '@/lib/useWallet';
import { useToast } from '@/context/ToastContext';

interface BorrowRepayModalProps {
    visible: boolean;
    onClose: () => void;
    asset: string;
    assetSymbol: string;
    borrowedAmount?: string;
    availableToBorrow?: string;
}

export function BorrowRepayModal({
    visible,
    onClose,
    asset,
    assetSymbol,
    borrowedAmount = '0',
    availableToBorrow = '0',
}: BorrowRepayModalProps) {
    const [mode, setMode] = useState<'borrow' | 'repay'>('borrow');
    const [amount, setAmount] = useState('');
    const { address: userAddress } = useWallet();
    const { showToast } = useToast();

    const { data: healthData } = useHealthFactor(userAddress);
    const borrow = useBorrow();
    const repay = useRepay();

    const isLoading = borrow.isPending || repay.isPending;
    const hasBorrowedPosition = parseFloat(borrowedAmount) > 0;

    const handleSubmit = () => {
        if (!userAddress) {
            showToast('Please connect your wallet first', 'warning', 'Wallet Required');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            showToast('Please enter a valid amount', 'warning', 'Invalid Amount');
            return;
        }

        if (mode === 'borrow') {
            borrow.mutate({ asset, amount, userAddress }, {
                onSuccess: () => {
                    showToast(`Borrowed ${amount} ${assetSymbol}`, 'success', 'Success');
                    setAmount('');
                },
                onError: (error: Error) => {
                    showToast(error.message, 'error', 'Error');
                },
            });
        } else {
            repay.mutate({ asset, amount, userAddress }, {
                onSuccess: () => {
                    showToast(`Repaid ${amount} ${assetSymbol}`, 'success', 'Success');
                    setAmount('');
                },
                onError: (error: Error) => {
                    showToast(error.message, 'error', 'Error');
                },
            });
        }
    };

    const handleMaxRepay = () => {
        setAmount(borrowedAmount);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50 justify-end"
                onPress={onClose}
            >
                <Pressable onPress={() => { }}>
                    <Card className="rounded-b-none">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>{mode === 'borrow' ? 'Borrow' : 'Repay'} {assetSymbol}</CardTitle>
                            <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center">
                                <XIcon size={20} className="text-muted-foreground" />
                            </Pressable>
                        </CardHeader>

                        <CardContent>
                            {/* Mode Toggle */}
                            <View className="flex-row gap-2 mb-4">
                                <Button
                                    variant={mode === 'borrow' ? 'default' : 'outline'}
                                    size="sm"
                                    className="flex-1"
                                    onPress={() => setMode('borrow')}
                                >
                                    <ArrowDownIcon size={14} />
                                    <Text>Borrow</Text>
                                </Button>
                                <Button
                                    variant={mode === 'repay' ? 'default' : 'outline'}
                                    size="sm"
                                    className="flex-1"
                                    onPress={() => setMode('repay')}
                                    disabled={!hasBorrowedPosition}
                                >
                                    <ArrowUpIcon size={14} />
                                    <Text>Repay</Text>
                                </Button>
                            </View>

                            {/* Health Factor */}
                            {healthData && (
                                <View className="mb-4">
                                    <HealthFactorBar
                                        healthFactor={healthData.healthFactor}
                                        status={healthData.status}
                                        description={healthData.description}
                                    />
                                </View>
                            )}

                            {/* Position Info */}
                            <View className="flex-row gap-3 mb-4">
                                <View className="flex-1 bg-muted/50 rounded-lg p-3">
                                    <Text className="text-xs text-muted-foreground mb-1">
                                        {mode === 'borrow' ? 'Available to Borrow' : 'Your Debt'}
                                    </Text>
                                    <Text className="text-lg font-bold text-foreground">
                                        {mode === 'borrow' ? availableToBorrow : borrowedAmount} {assetSymbol}
                                    </Text>
                                </View>
                                {hasBorrowedPosition && mode === 'repay' && (
                                    <View className="flex-1 bg-amber-500/10 rounded-lg p-3">
                                        <Text className="text-xs text-muted-foreground mb-1">Outstanding</Text>
                                        <Text className="text-lg font-bold text-amber-500">
                                            {borrowedAmount} {assetSymbol}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Amount Input */}
                            <View className="mb-4">
                                <Text className="text-sm text-muted-foreground mb-2">Amount</Text>
                                <View className="flex-row gap-2">
                                    <TextInput
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholder={`Amount to ${mode}`}
                                        keyboardType="decimal-pad"
                                        className="flex-1 h-12 px-4 rounded-md border border-border bg-background text-foreground text-lg"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                    {mode === 'repay' && hasBorrowedPosition && (
                                        <Button variant="outline" onPress={handleMaxRepay}>
                                            <Text>Max</Text>
                                        </Button>
                                    )}
                                </View>
                            </View>

                            {/* Warning for low health factor */}
                            {mode === 'borrow' && healthData?.status === 'warning' && (
                                <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                                    <Text className="text-amber-500 text-sm">
                                        ⚠️ Borrowing more may put your position at risk
                                    </Text>
                                </View>
                            )}
                        </CardContent>

                        <CardFooter className="flex-col gap-3">
                            <View className="w-full flex-row justify-between items-center">
                                <Text className="text-xs text-muted-foreground">Network Cost</Text>
                                <GasFeePreview />
                            </View>
                            <Button
                                variant={mode === 'borrow' ? 'default' : 'secondary'}
                                className="w-full"
                                onPress={handleSubmit}
                                disabled={isLoading || !amount}
                            >
                                <WalletIcon size={16} />
                                <Text>
                                    {isLoading
                                        ? 'Processing...'
                                        : mode === 'borrow'
                                            ? `Borrow ${assetSymbol}`
                                            : `Repay ${assetSymbol}`
                                    }
                                </Text>
                            </Button>
                        </CardFooter>
                    </Card>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
