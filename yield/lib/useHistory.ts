import { useQuery } from '@tanstack/react-query';
import { API_URL } from './api-config';

export interface Transaction {
    hash: string;
    version: string;
    timestamp: string;
    function: string;
    success: boolean;
    gasUsed: string;
    gasPrice: string;
    sender: string;
}

async function fetchHistory(address: string): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/api/history/${address}`);
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }
    const json = await response.json();
    return json.success ? json.data : [];
}

export function useHistory(address?: string) {
    return useQuery({
        queryKey: ['history', address],
        queryFn: () => fetchHistory(address!),
        enabled: !!address,
    });
}
