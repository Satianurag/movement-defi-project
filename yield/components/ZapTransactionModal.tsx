import React from 'react';
import { Modal, View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2Icon,
    ArrowRightIcon,
    CpuIcon,
    LayersIcon,
    CoinsIcon
} from 'lucide-react-native';
import { cn } from '@/lib/utils';
import Animated, { FadeInDown } from 'react-native-reanimated';

export type ZapStep = 'initiating' | 'optimizing' | 'swapping' | 'adding_liquidity' | 'success' | 'error';

interface ZapTransactionModalProps {
    visible: boolean;
    step: ZapStep;
    onClose: () => void;
    txHash?: string;
    error?: string;
    protocolName?: string;
}

export function ZapTransactionModal({
    visible,
    step,
    onClose,
    txHash,
    error,
    protocolName = 'Protocol'
}: ZapTransactionModalProps) {

    const stepsConfig = [
        {
            id: 'initiating',
            label: 'Initiating Transaction',
            icon: CpuIcon,
            activeColor: 'text-blue-500'
        },
        {
            id: 'optimizing',
            label: 'Optimizing Strategy (Zap)',
            icon: LayersIcon,
            activeColor: 'text-purple-500',
            desc: 'Calculating optimal swap ratio...'
        },
        {
            id: 'swapping',
            label: 'Swapping Assets',
            icon: ArrowRightIcon,
            activeColor: 'text-orange-500',
            desc: 'Interacting with DEX...'
        },
        {
            id: 'adding_liquidity',
            label: 'Adding Liquidity',
            icon: CoinsIcon,
            activeColor: 'text-emerald-500',
            desc: 'Depositing into pool...'
        },
    ];

    const currentStepIndex = stepsConfig.findIndex(s => s.id === step);
    const isSuccess = step === 'success';
    const isError = step === 'error';

    // Map step to index for progress
    const getStepStatus = (index: number) => {
        if (isSuccess) return 'completed';
        if (isError) return index === currentStepIndex ? 'error' : index < currentStepIndex ? 'completed' : 'pending';
        if (index < currentStepIndex) return 'completed';
        if (index === currentStepIndex) return 'active';
        return 'pending';
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={isSuccess || isError ? onClose : undefined}
        >
            <View className="flex-1 bg-black/80 items-center justify-center p-6">
                <Card className="w-full max-w-md bg-background border-border p-6 gap-6">
                    {/* Header */}
                    <View className="items-center">
                        <Text className="text-xl font-bold text-foreground text-center">
                            {isSuccess ? 'Zap Successful! 🎉' : isError ? 'Transaction Failed' : `Depositing to ${protocolName}`}
                        </Text>
                        {!isSuccess && !isError && (
                            <Text className="text-sm text-muted-foreground text-center mt-1">
                                Please wait while we execute the strategy...
                            </Text>
                        )}
                    </View>

                    {/* Steps Visualization */}
                    <View className="gap-4">
                        {stepsConfig.map((s, index) => {
                            const status = getStepStatus(index);
                            return (
                                <View key={s.id} className="flex-row items-center gap-3">
                                    <View className={cn(
                                        "w-8 h-8 rounded-full items-center justify-center border",
                                        status === 'completed' ? "bg-emerald-500/20 border-emerald-500" :
                                            status === 'active' ? "bg-primary/20 border-primary" :
                                                status === 'error' ? "bg-red-500/20 border-red-500" :
                                                    "bg-muted border-border"
                                    )}>
                                        {status === 'completed' ? (
                                            <CheckCircle2Icon size={16} className="text-emerald-500" />
                                        ) : status === 'active' ? (
                                            <ActivityIndicator size="small" color="#EAB308" />
                                        ) : (
                                            <s.icon size={16} className={cn(
                                                status === 'error' ? "text-red-500" : "text-muted-foreground"
                                            )} />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className={cn(
                                            "font-medium",
                                            status === 'active' ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {s.label}
                                        </Text>
                                        {status === 'active' && s.desc && (
                                            <Text className="text-xs text-primary animate-pulse">
                                                {s.desc}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Result Action */}
                    {(isSuccess || isError) && (
                        <Animated.View entering={FadeInDown}>
                            {isSuccess && (
                                <View className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 mb-4">
                                    <Text className="text-emerald-500 text-center text-sm">
                                        Successfully Zapped into the pool!
                                    </Text>
                                    <Text className="text-xs text-muted-foreground text-center font-mono mt-1">
                                        Hash: {txHash?.slice(0, 10)}...
                                    </Text>
                                </View>
                            )}
                            {isError && (
                                <View className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
                                    <Text className="text-red-500 text-center text-sm">
                                        {error || 'Something went wrong.'}
                                    </Text>
                                </View>
                            )}
                            <Button onPress={onClose} className="w-full">
                                <Text>Close</Text>
                            </Button>
                        </Animated.View>
                    )}
                </Card>
            </View>
        </Modal>
    );
}
