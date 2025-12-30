import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface StakingInfo {
    userAddress: string;
    stakedAmount: string;
    pendingRewards: string;
    stakingSince: string | null;
}

export interface StakingStats {
    totalStaked: string;
    apr: number;
    totalStakers: number;
}

/**
 * Hook to fetch user's MST staking info
 */
export function useMSTStakingInfo(userAddress: string | undefined) {
    return useQuery<StakingInfo>({
        queryKey: ['mstStakingInfo', userAddress],
        queryFn: async () => {
            if (!userAddress) throw new Error('No user address');
            const response = await fetch(`${API_URL}/api/meridian/mst/info/${userAddress}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        enabled: !!userAddress,
        staleTime: 10000,
    });
}

/**
 * Hook to fetch overall MST staking stats
 */
export function useMSTStakingStats() {
    return useQuery<StakingStats>({
        queryKey: ['mstStakingStats'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/meridian/mst/stats`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        staleTime: 30000,
    });
}

/**
 * Hook to stake MST tokens
 */
export function useStakeMST() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ amount, userAddress }: {
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/mst/stake`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mstStakingInfo'] });
            queryClient.invalidateQueries({ queryKey: ['mstStakingStats'] });
        },
    });
}

/**
 * Hook to unstake MST tokens
 */
export function useUnstakeMST() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ amount, userAddress }: {
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/mst/unstake`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mstStakingInfo'] });
            queryClient.invalidateQueries({ queryKey: ['mstStakingStats'] });
        },
    });
}

/**
 * Hook to claim MST staking rewards
 */
export function useClaimMSTRewards() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userAddress }: { userAddress: string }) => {
            const response = await fetch(`${API_URL}/api/meridian/mst/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mstStakingInfo'] });
        },
    });
}

/**
 * Get stake payload for Smart Wallet signing
 */
export async function getMSTStakePayload(amount: string) {
    const response = await fetch(`${API_URL}/api/meridian/mst/stake/payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}
