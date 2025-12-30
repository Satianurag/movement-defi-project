import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface Farm {
    farmId: number;
    lpToken: string;
    rewardToken: string;
    totalStaked: string;
    multiplier: number;
    apr: number;
}

export interface FarmPosition {
    farmId: number;
    stakedAmount: string;
    pendingRewards: string;
    stakedAt?: string;
}

export interface PendingRewards {
    farmId: number;
    userAddress: string;
    pendingRewards: string;
    rewardToken: string;
}

/**
 * Hook to fetch all available farms
 */
export function useFarms() {
    return useQuery<Farm[]>({
        queryKey: ['farms'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/meridian/farms`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        staleTime: 30000, // 30 seconds
    });
}

/**
 * Hook to fetch user's farm positions
 */
export function useUserFarmPositions(userAddress: string | undefined) {
    return useQuery<FarmPosition[]>({
        queryKey: ['farmPositions', userAddress],
        queryFn: async () => {
            if (!userAddress) return [];
            const response = await fetch(`${API_URL}/api/meridian/farm/positions/${userAddress}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        enabled: !!userAddress,
        staleTime: 10000, // 10 seconds
    });
}

/**
 * Hook to fetch pending rewards for a specific farm
 */
export function usePendingRewards(farmId: number, userAddress: string | undefined) {
    return useQuery<PendingRewards>({
        queryKey: ['pendingRewards', farmId, userAddress],
        queryFn: async () => {
            if (!userAddress) throw new Error('No user address');
            const response = await fetch(`${API_URL}/api/meridian/farm/rewards/${farmId}/${userAddress}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        enabled: !!userAddress,
        staleTime: 5000, // 5 seconds
    });
}

/**
 * Hook to stake LP tokens
 */
export function useStakeLP() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ farmId, lpTokenType, amount, userAddress }: {
            farmId: number;
            lpTokenType: string;
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/farm/stake`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmId, lpTokenType, amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmPositions'] });
            queryClient.invalidateQueries({ queryKey: ['farms'] });
        },
    });
}

/**
 * Hook to unstake LP tokens
 */
export function useUnstakeLP() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ farmId, lpTokenType, amount, userAddress }: {
            farmId: number;
            lpTokenType: string;
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/farm/unstake`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmId, lpTokenType, amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['farmPositions'] });
            queryClient.invalidateQueries({ queryKey: ['pendingRewards'] });
        },
    });
}

/**
 * Hook to claim farm rewards
 */
export function useClaimFarmRewards() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ farmId, userAddress }: {
            farmId: number;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/farm/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmId, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingRewards'] });
            queryClient.invalidateQueries({ queryKey: ['farmPositions'] });
        },
    });
}

/**
 * Get stake payload for Smart Wallet signing
 */
export async function getStakePayload(farmId: number, lpTokenType: string, amount: string) {
    const response = await fetch(`${API_URL}/api/meridian/farm/stake/payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId, lpTokenType, amount }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

/**
 * Get claim payload for Smart Wallet signing
 */
export async function getClaimPayload(farmId: number) {
    const response = await fetch(`${API_URL}/api/meridian/farm/claim/payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}
