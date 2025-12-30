/**
 * useProtocol Hook
 * Frontend hook for unified multi-protocol deposit/withdraw.
 */

import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

export interface Protocol {
    slug: string;
    name: string;
    type: string;
    hasAddresses: boolean;
}

export interface TransactionResult {
    success: boolean;
    hash?: string;
    protocol?: string;
    asset?: string;
    amount?: string;
    error?: string;
}

export function useProtocol() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getProtocols = useCallback(async (): Promise<Protocol[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/protocol/list`);
            const json = await response.json();
            return json.success ? json.data : [];
        } catch (err) {
            return [];
        }
    }, []);

    const deposit = useCallback(async (
        protocol: string,
        asset: string,
        amount: string,
        userAddress?: string
    ): Promise<TransactionResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/protocol/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ protocol, asset, amount, userAddress }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Deposit failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                protocol: json.data.protocol,
                asset: json.data.asset,
                amount: json.data.amount,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const withdraw = useCallback(async (
        protocol: string,
        asset: string,
        amount: string,
        userAddress?: string
    ): Promise<TransactionResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/protocol/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ protocol, asset, amount, userAddress }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Withdraw failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                protocol: json.data.protocol,
                asset: json.data.asset,
                amount: json.data.amount,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Withdraw failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        getProtocols,
        deposit,
        withdraw,
    };
}
