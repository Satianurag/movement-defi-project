import { useQuery } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import { API_URL } from './api-config';

export interface PortfolioPosition {
    id: string;
    name: string;
    protocol: string;
    strategy: string; // 'Zap Strategy', 'Staking', 'Lending', etc.
    amount: string;   // Formatted amount (e.g. "$1,200.00")
    rawAmount: number; // Numeric amount for calculations
    apy: string;      // Formatted APY (e.g. "+12.5%")
    icon?: string;    // URL or identifier for icon
    tokenSymbol: string;
}

export interface PortfolioSummary {
    totalNetWorth: string;
    netWorthChange: string; // e.g., "+12.5% (7d)"
    positions: PortfolioPosition[];
}

interface ApiResponse {
    success: boolean;
    data: PortfolioSummary;
    error?: string;
}

async function fetchPortfolio(address: string): Promise<PortfolioSummary> {
    const response = await fetch(`${API_URL}/api/defi/portfolio/${address}`);

    if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
    }

    const json: ApiResponse = await response.json();

    if (!json.success || !json.data) {
        throw new Error(json.error || 'Invalid API response');
    }

    return json.data;
}

export function usePortfolio() {
    const { address, isAuthenticated } = useWallet();

    return useQuery({
        queryKey: ['portfolio', address],
        queryFn: () => fetchPortfolio(address!),
        enabled: isAuthenticated && !!address,
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: true,
        retry: 2
    });
}
