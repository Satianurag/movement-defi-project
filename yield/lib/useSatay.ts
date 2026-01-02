/**
 * useSatay Hook
 * Frontend hook to interact with Satay Finance vaults via backend API.
 */

import { useState, useCallback, useEffect } from 'react';
import { getApiBaseUrl } from './api-config';

const API_BASE_URL = getApiBaseUrl();


export interface SatayStrategy {
    strategyAddress: string;
    concreteAddress: string;
    name: string;
    totalAsset: number;
    totalProfit: number;
    totalLoss: number;
}

export interface SatayVault {
    name: string;
    asset: string;
    decimals: number;
    vaultAddress: string;
    sharesAddress: string;
    tvl: number;
    totalShares: number;
    apy: string | null;
    apySource: string;
    apyNote: string;
    strategies: SatayStrategy[];
    category: string;
    protocol: string;
}

export interface SatayStats {
    totalTVL: number;
    vaultCount: number;
    activeVaultCount: number;
    averageAPY: string;
}

export interface DepositResult {
    success: boolean;
    hash?: string;
    vaultAddress?: string;
    amount?: string;
    error?: string;
}

export function useSatay() {
    const [vaults, setVaults] = useState<SatayVault[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all Satay vaults with real APY
     */
    const getVaults = useCallback(async (): Promise<SatayVault[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/satay/vaults`);
            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Failed to fetch vaults');
            }

            setVaults(json.data);
            return json.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch vaults';
            setError(message);
            console.error('getVaults error:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Get a specific vault by asset name
     */
    const getVaultByAsset = useCallback(async (asset: string): Promise<SatayVault | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/satay/vault/${encodeURIComponent(asset)}`);
            const json = await response.json();

            if (!json.success) {
                return null;
            }

            return json.data;
        } catch (err) {
            console.error('getVaultByAsset error:', err);
            return null;
        }
    }, []);

    /**
     * Deposit to a Satay vault
     */
    const deposit = useCallback(async (
        vaultAddress: string,
        amount: string,
        userAddress?: string
    ): Promise<DepositResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/protocol/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    protocol: 'satay',
                    asset: vaultAddress,
                    amount,
                    userAddress,
                }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Deposit failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                vaultAddress: json.data.vaultAddress,
                amount: json.data.amount,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Deposit failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Withdraw from a Satay vault
     */
    const withdraw = useCallback(async (
        vaultAddress: string,
        shares: string,
        userAddress?: string
    ): Promise<DepositResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/protocol/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    protocol: 'satay',
                    asset: vaultAddress,
                    amount: shares,
                    userAddress,
                }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Withdraw failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                vaultAddress: json.data.vaultAddress,
                amount: json.data.amount,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Withdraw failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch vaults on mount
    useEffect(() => {
        getVaults();
    }, [getVaults]);

    return {
        vaults,
        isLoading,
        error,
        getVaults,
        getVaultByAsset,
        deposit,
        withdraw,
    };
}
