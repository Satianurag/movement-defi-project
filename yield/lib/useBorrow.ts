import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface HealthFactor {
    userAddress: string;
    healthFactor: number | null;
    status: 'safe' | 'warning' | 'danger' | 'unknown';
    description: string;
}

export interface BorrowResult {
    success: boolean;
    hash: string;
    marketAddress: string;
    amount: string;
    userAddress: string;
    protocol: string;
}

/**
 * Hook to fetch user's health factor
 */
export function useHealthFactor(userAddress: string | undefined) {
    return useQuery<HealthFactor>({
        queryKey: ['healthFactor', userAddress],
        queryFn: async () => {
            if (!userAddress) throw new Error('No user address');
            const response = await fetch(`${API_URL}/api/echelon/health/${userAddress}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        enabled: !!userAddress,
        staleTime: 5000,
    });
}

/**
 * Hook to borrow assets
 */
export function useBorrow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ asset, amount, userAddress }: {
            asset: string;
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/echelon/borrow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asset, amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthFactor'] });
            queryClient.invalidateQueries({ queryKey: ['userPosition'] });
        },
    });
}

/**
 * Hook to repay borrowed assets
 */
export function useRepay() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ asset, amount, userAddress }: {
            asset: string;
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/echelon/repay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asset, amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthFactor'] });
            queryClient.invalidateQueries({ queryKey: ['userPosition'] });
        },
    });
}

/**
 * Hook to enable asset as collateral
 */
export function useEnableCollateral() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ asset, userAddress }: {
            asset: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/echelon/collateral/enable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asset, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthFactor'] });
        },
    });
}

/**
 * Hook to disable asset as collateral
 */
export function useDisableCollateral() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ asset, userAddress }: {
            asset: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/echelon/collateral/disable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asset, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['healthFactor'] });
        },
    });
}

/**
 * Get borrow payload for Smart Wallet signing
 */
export async function getBorrowPayload(asset: string, amount: string) {
    const response = await fetch(`${API_URL}/api/echelon/borrow/payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, amount }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Get repay payload for Smart Wallet signing
 */
export async function getRepayPayload(asset: string, amount: string) {
    const response = await fetch(`${API_URL}/api/echelon/repay/payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, amount }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}
