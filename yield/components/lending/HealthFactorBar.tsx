import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ShieldIcon, ShieldAlertIcon, ShieldXIcon } from 'lucide-react-native';

interface HealthFactorBarProps {
    healthFactor: number | null;
    status: 'safe' | 'warning' | 'danger' | 'unknown';
    description?: string;
}

export function HealthFactorBar({ healthFactor, status, description }: HealthFactorBarProps) {
    // Convert health factor to percentage (capped at 200% for display)
    const percentage = healthFactor
        ? Math.min((healthFactor / 2) * 100, 100)
        : 0;

    const getStatusColor = () => {
        switch (status) {
            case 'safe': return 'text-emerald-500';
            case 'warning': return 'text-amber-500';
            case 'danger': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };

    const getProgressColor = () => {
        switch (status) {
            case 'safe': return 'bg-emerald-500';
            case 'warning': return 'bg-amber-500';
            case 'danger': return 'bg-red-500';
            default: return 'bg-muted-foreground';
        }
    };

    const StatusIcon = () => {
        switch (status) {
            case 'safe': return <ShieldIcon size={20} className="text-emerald-500" />;
            case 'warning': return <ShieldAlertIcon size={20} className="text-amber-500" />;
            case 'danger': return <ShieldXIcon size={20} className="text-red-500" />;
            default: return <ShieldIcon size={20} className="text-muted-foreground" />;
        }
    };

    return (
        <View className="bg-muted/50 rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                    <StatusIcon />
                    <Text className="text-sm font-medium text-foreground">Health Factor</Text>
                </View>
                <Text className={cn('text-lg font-bold', getStatusColor())}>
                    {healthFactor ? healthFactor.toFixed(2) : '--'}
                </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <View
                    className={cn('h-full rounded-full', getProgressColor())}
                    style={{ width: `${percentage}%` }}
                />
            </View>

            {/* Scale Labels */}
            <View className="flex-row justify-between">
                <Text className="text-xs text-red-500">0 (Liquidation)</Text>
                <Text className="text-xs text-amber-500">1.0</Text>
                <Text className="text-xs text-emerald-500">2.0+ (Safe)</Text>
            </View>

            {/* Description */}
            {description && (
                <Text className={cn('text-xs mt-2', getStatusColor())}>
                    {description}
                </Text>
            )}
        </View>
    );
}
