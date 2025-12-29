import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { PoolData } from '@/components/PoolCard';

// Backend API URL - Android emulator uses 10.0.2.2 to reach host localhost
const getApiBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    // Android emulator: use 10.0.2.2 to reach host machine's localhost
    // iOS simulator & web: localhost works fine
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

interface PoolsApiResponse {
    success: boolean;
    data: {
        protocols: PoolData[];
        prices: Record<string, { usd: number }>;
        totalProtocols: number;
        note?: string;
        timestamp: string;
    };
}

interface UsePoolsDataReturn {
    pools: PoolData[];
    prices: Record<string, { usd: number }>;
    totalProtocols: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function usePoolsData(): UsePoolsDataReturn {
    const [pools, setPools] = useState<PoolData[]>([]);
    const [prices, setPrices] = useState<Record<string, { usd: number }>>({});
    const [totalProtocols, setTotalProtocols] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/defi/metrics`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json: PoolsApiResponse = await response.json();

            if (!json.success) {
                throw new Error('API returned unsuccessful response');
            }

            setPools(json.data.protocols || []);
            setPrices(json.data.prices || {});
            setTotalProtocols(json.data.totalProtocols || 0);
        } catch (err) {
            console.error('Failed to fetch pools:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to connect to the server. Please check if the backend is running.'
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPools();
    }, [fetchPools]);

    return {
        pools,
        prices,
        totalProtocols,
        isLoading,
        error,
        refetch: fetchPools,
    };
}

// Calculate total TVL from all pools
export function calculateTotalTVL(pools: PoolData[]): number {
    return pools.reduce((sum, pool) => sum + (pool.tvl || 0), 0);
}

// Format TVL for header display
export function formatTotalTVL(value: number): string {
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
}
