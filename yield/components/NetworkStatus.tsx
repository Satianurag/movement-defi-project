import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ActivityIcon, WifiIcon, LayersIcon, ZapIcon } from 'lucide-react-native';
import { AnimatedNumber } from '@/components/ui/animated-number';

export function NetworkStatus() {
    // Mock data for network status
    const gasPrice = 2; // Gwei
    const blockHeight = 12456789;
    const latency = 45; // ms

    return (
        <Popover>
            <PopoverTrigger asChild>
                <TouchableOpacity
                    className="bg-muted/20 px-3 py-1.5 rounded-full flex-row items-center gap-2 border border-border/5"
                    activeOpacity={0.7}
                >
                    <View className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <Text className="text-xs font-medium text-foreground hidden sm:flex">Movement Testnet</Text>
                </TouchableOpacity>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 overflow-hidden" insets={{ top: 60, right: 16 }}>
                {/* Header */}
                <View className="bg-muted/20 p-3 border-b border-border">
                    <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <Text className="font-semibold text-sm">Movement Testnet</Text>
                    </View>
                    <Text className="text-xs text-muted-foreground mt-0.5 ml-4">Network Operational</Text>
                </View>

                {/* Stats */}
                <View className="p-3 gap-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <WifiIcon size={14} className="text-muted-foreground" />
                            <Text className="text-sm text-foreground">Latency</Text>
                        </View>
                        <Text className="text-sm font-medium text-success">{latency}ms</Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <ZapIcon size={14} className="text-muted-foreground" />
                            <Text className="text-sm text-foreground">Gas Price</Text>
                        </View>
                        <Text className="text-sm font-medium text-foreground">
                            {gasPrice} <Text className="text-xs text-muted-foreground">Gwei</Text>
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <LayersIcon size={14} className="text-muted-foreground" />
                            <Text className="text-sm text-foreground">Block Height</Text>
                        </View>
                        <AnimatedNumber
                            value={blockHeight}
                            formatter={(val) => val.toLocaleString()}
                            className="text-sm font-medium text-foreground tabular-nums"
                        />
                    </View>
                </View>

                {/* Footer */}
                <View className="bg-muted/10 p-2 border-t border-border items-center">
                    <Text className="text-[10px] text-muted-foreground">Latest block 2s ago</Text>
                </View>
            </PopoverContent>
        </Popover>
    );
}
