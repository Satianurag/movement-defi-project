/**
 * useMeridian Hook
 * Frontend hook to interact with Meridian DEX via backend API.
 */

import { useState, useCallback } from 'react';
import { getApiBaseUrl } from './api-config';

const API_BASE_URL = getApiBaseUrl();


export interface SwapResult {
    success: boolean;
    hash?: string;
    tokenIn?: string;
    tokenOut?: string;
    amountIn?: string;
    error?: string;
}

export interface LiquidityResult {
    success: boolean;
    hash?: string;
    tokenA?: string;
    tokenB?: string;
    amountA?: string;
    amountB?: string;
    lpTokenAmount?: string;
    error?: string;
}

export interface TradingPair {
    tokenA: string;
    tokenB: string;
    pool: string;
}

export function useMeridian() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Get supported trading pairs
     */
    const getSupportedPairs = useCallback((): TradingPair[] => {
        return [
            { tokenA: 'MOVE', tokenB: 'USDC.e', pool: 'MOVE-USDC' },
            { tokenA: 'MOVE', tokenB: 'USDT.e', pool: 'MOVE-USDT' },
            { tokenA: 'WETH.e', tokenB: 'USDC.e', pool: 'WETH-USDC' },
            { tokenA: 'WBTC.e', tokenB: 'USDC.e', pool: 'WBTC-USDC' },
            { tokenA: 'USDC.e', tokenB: 'USDT.e', pool: 'USDC-USDT' },
        ];
    }, []);

    /**
     * Swap tokens via Meridian
     */
    const swap = useCallback(async (
        tokenIn: string,
        tokenOut: string,
        amountIn: string,
        minAmountOut?: string,
        userAddress?: string
    ): Promise<SwapResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/meridian/swap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenIn,
                    tokenOut,
                    amountIn,
                    minAmountOut: minAmountOut || '0',
                    userAddress,
                }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Swap failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                tokenIn: json.data.tokenIn,
                tokenOut: json.data.tokenOut,
                amountIn: json.data.amountIn,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Swap failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Add liquidity to a pool
     */
    const addLiquidity = useCallback(async (
        tokenA: string,
        tokenB: string,
        amountA: string,
        amountB: string,
        userAddress?: string
    ): Promise<LiquidityResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/meridian/add-liquidity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenA,
                    tokenB,
                    amountA,
                    amountB,
                    userAddress,
                }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Add liquidity failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                tokenA: json.data.tokenA,
                tokenB: json.data.tokenB,
                amountA: json.data.amountA,
                amountB: json.data.amountB,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Add liquidity failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Remove liquidity from a pool
     */
    const removeLiquidity = useCallback(async (
        tokenA: string,
        tokenB: string,
        lpTokenAmount: string,
        userAddress?: string
    ): Promise<LiquidityResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/meridian/remove-liquidity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenA,
                    tokenB,
                    lpTokenAmount,
                    userAddress,
                }),
            });

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || 'Remove liquidity failed');
            }

            return {
                success: true,
                hash: json.data.hash,
                tokenA: json.data.tokenA,
                tokenB: json.data.tokenB,
                lpTokenAmount: json.data.lpTokenAmount,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Remove liquidity failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        getSupportedPairs,
        swap,
        addLiquidity,
        removeLiquidity,
    };
}
