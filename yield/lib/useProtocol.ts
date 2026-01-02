/**
 * useProtocol Hook
 * Frontend hook for unified multi-protocol deposit/withdraw.
 */

import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { getApiBaseUrl } from './api-config';

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
    const { sendSmartTransaction, smartWalletAddress } = useWallet();

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
            // STRATEGY CHECK: Is User using Smart Wallet?
            const isSmartWallet = userAddress && smartWalletAddress && userAddress.toLowerCase() === smartWalletAddress.toLowerCase();

            if (isSmartWallet) {
                // 1. Fetch Payload
                const response = await fetch(`${API_BASE_URL}/api/protocol/deposit/payload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ protocol, asset, amount, userAddress }),
                });

                const json = await response.json();
                if (!json.success) throw new Error(json.error || 'Failed to generate payload');

                const payload = json.data;

                // 2. Sign & Submit via Smart Wallet
                // NOTE: Move payloads need to be encoded properly.
                // Assuming `sendSmartTransaction` handles the Move structure or hex.
                const hash = await sendSmartTransaction({
                    to: payload.function, // For Move, 'to' is often the function target
                    value: '0',
                    data: JSON.stringify({
                        function: payload.function,
                        type_arguments: payload.typeArguments,
                        arguments: payload.functionArguments
                    }) // Passing JSON as data for custom adapter handling
                });

                return {
                    success: true,
                    hash,
                    protocol: protocol,
                    asset,
                    amount,
                };
            } else {
                // Fallback to Old Custodial Method (for now)
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
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [smartWalletAddress, sendSmartTransaction]);

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
