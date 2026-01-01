import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { FuelIcon } from 'lucide-react-native';
import { createPublicClient, http, formatGwei } from 'viem';


// Define Movement Testnet chain if not available in viem/chains standard list
const movementChain = {
    id: 30732,
    name: 'Movement Testnet',
    network: 'movement-testnet',
    nativeCurrency: {
        name: 'Move',
        symbol: 'MOVE',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ['https://mevm.testnet.imola.movementlabs.xyz'] },
        public: { http: ['https://mevm.testnet.imola.movementlabs.xyz'] },
    },
} as const;

const client = createPublicClient({
    chain: movementChain,
    transport: http()
});

export function GasFeePreview() {
    const [gasPrice, setGasPrice] = useState<string | null>(null);

    useEffect(() => {
        const fetchGas = async () => {
            try {
                const price = await client.getGasPrice();
                setGasPrice(formatGwei(price));
            } catch (e) {
                console.error('Failed to fetch gas price', e);
            }
        };
        fetchGas();
        // Refresh every 30s
        const interval = setInterval(fetchGas, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View className="flex-row items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
            <FuelIcon size={12} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground font-medium">
                {gasPrice ? `~${parseFloat(gasPrice).toFixed(2)} Gwei` : 'Est. Fee: Low'}
            </Text>
        </View>
    );
}
