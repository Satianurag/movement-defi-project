/**
 * useEchelon Hook
 * Frontend hook to interact with Echelon lending protocol via backend API.
 */

import { useState, useCallback } from 'react';
import { getApiBaseUrl } from './api-config';

const API_BASE_URL = getApiBaseUrl();


export interface EchelonMarket {
    asset: string;
    address: string;
}

export interface SupplyResult {
    success: boolean;
    hash?: string;
    marketAddress?: string;
    amount?: string;
    error?: string;
}

export interface UserPosition {
    supplied: string;
    borrowed: string;
    marketAddress: string;
    userAddress: string;
}

export function useEchelon() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Get list of supported markets
     */
    const getMarkets = useCallback(async (): Promise<EchelonMarket[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/echelon/markets`);
            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Failed to fetch markets');
            }

            return json.data;
        } catch (err) {
            console.error('getMarkets error:', err);
            return [];
        }
    }, []);

    /**
     * Supply (deposit) assets to Echelon market
     */
    const supply = useCallback(async (
        asset: string,
        amount: string,
        userAddress?: string
    ): Promise<SupplyResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/echelon/supply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asset,
                    amount,
                    userAddress,
                }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Supply failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                marketAddress: json.data.marketAddress,
                amount: json.data.amount,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Supply failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Withdraw assets from Echelon market
     */
    const withdraw = useCallback(async (
        asset: string,
        amount: string,
        userAddress?: string
    ): Promise<SupplyResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/echelon/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asset,
                    amount,
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
                marketAddress: json.data.marketAddress,
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

    /**
     * Get user's position in a market
     */
    const getPosition = useCallback(async (
        userAddress: string,
        asset: string = 'MOVE'
    ): Promise<UserPosition | null> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/echelon/position/${userAddress}?asset=${asset}`
            );
            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Failed to fetch position');
            }

            return json.data;
        } catch (err) {
            console.error('getPosition error:', err);
            return null;
        }
    }, []);

    /**
     * Get market info (TVL, rates)
     */
    const getMarketInfo = useCallback(async (asset: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/echelon/market/${asset}`);
            const json = await response.json();

            if (!json.success) {
                return null;
            }

            return json.data;
        } catch (err) {
            console.error('getMarketInfo error:', err);
            return null;
        }
    }, []);

    return {
        // State
        isLoading,
        error,

        // Actions
        getMarkets,
        supply,
        withdraw,
        getPosition,
        getMarketInfo,
    };
}
