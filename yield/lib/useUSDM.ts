import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface USDMPosition {
    userAddress: string;
    collateralType: string;
    collateral: string;
    debt: string;
    collateralRatio: number;
    status: 'safe' | 'warning' | 'danger' | 'none';
}

/**
 * Hook to fetch user's USDM position
 */
export function useUSDMPosition(userAddress: string | undefined, collateralType: string = 'MOVE') {
    return useQuery<USDMPosition>({
        queryKey: ['usdmPosition', userAddress, collateralType],
        queryFn: async () => {
            if (!userAddress) throw new Error('No user address');
            const response = await fetch(
                `${API_URL}/api/meridian/usdm/position/${userAddress}?collateralType=${collateralType}`
            );
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        enabled: !!userAddress,
        staleTime: 10000,
    });
}

/**
 * Hook to mint USDM
 */
export function useMintUSDM() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ collateralType, collateralAmount, usdmAmount, userAddress }: {
            collateralType: string;
            collateralAmount: string;
            usdmAmount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/usdm/mint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collateralType, collateralAmount, usdmAmount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usdmPosition'] });
        },
    });
}

/**
 * Hook to burn USDM
 */
export function useBurnUSDM() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ collateralType, usdmAmount, userAddress }: {
            collateralType: string;
            usdmAmount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/usdm/burn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collateralType, usdmAmount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usdmPosition'] });
        },
    });
}

/**
 * Hook to deposit to stability pool
 */
export function useDepositStabilityPool() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ amount, userAddress }: {
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/stability-pool/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usdmPosition'] });
        },
    });
}

/**
 * Hook to withdraw from stability pool
 */
export function useWithdrawStabilityPool() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ amount, userAddress }: {
            amount: string;
            userAddress: string;
        }) => {
            const response = await fetch(`${API_URL}/api/meridian/stability-pool/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, userAddress }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usdmPosition'] });
        },
    });
}
