import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { FuelIcon } from 'lucide-react-native';
import { createPublicClient, http, formatGwei } from 'viem';

// RPC endpoints to try in order (mainnet is more stable)
const RPC_ENDPOINTS = [
    'https://movement.lava.build',
    'https://mevm.testnet.imola.movementlabs.xyz',
];

// Movement Mainnet chain configuration
const movementMainnet = {
    id: 3073,
    name: 'Movement Mainnet',
    network: 'movement',
    nativeCurrency: {
        name: 'Move',
        symbol: 'MOVE',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: [RPC_ENDPOINTS[0]] },
        public: { http: [RPC_ENDPOINTS[0]] },
    },
} as const;

// Create clients for each RPC endpoint
const createClient = (rpcUrl: string) => createPublicClient({
    chain: { ...movementMainnet, rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } } },
    transport: http(rpcUrl, { timeout: 5000 })
});

export function GasFeePreview() {
    const [gasPrice, setGasPrice] = useState<string | null>(null);

    useEffect(() => {
        const fetchGas = async () => {
            // Try each RPC endpoint in order until one works
            for (const rpcUrl of RPC_ENDPOINTS) {
                try {
                    const client = createClient(rpcUrl);
                    const price = await client.getGasPrice();
                    setGasPrice(formatGwei(price));
                    return; // Success, exit the loop
                } catch {
                    // Try next endpoint
                    continue;
                }
            }
            // All endpoints failed - show loading state instead of error
            setGasPrice(null);
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
