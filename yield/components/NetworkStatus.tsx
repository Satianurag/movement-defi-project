import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { WifiIcon } from 'lucide-react-native';

export function NetworkStatus() {
    return (
        <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <View className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            <Text className="text-xs font-medium text-emerald-500">
                Movement Testnet
            </Text>
        </View>
    );
}
