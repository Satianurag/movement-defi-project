import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { useCallback } from 'react';

/**
 * Custom hook wrapping Privy wallet functionality for the Movement DeFi app.
 * Provides easy access to wallet address, signing, and transaction methods.
 */
export function useWallet() {
    const { user, isReady, logout } = usePrivy();
    const { wallets, create } = useEmbeddedEthereumWallet();

    const wallet = wallets?.[0];
    const isAuthenticated = !!user;
    const isWalletReady = isReady && !!wallet;

    /**
     * Get the wallet address
     */
    const getAddress = useCallback(async (): Promise<string | null> => {
        if (!wallet) return null;
        return wallet.address;
    }, [wallet]);

    /**
     * Get the EIP-1193 provider for direct RPC calls
     */
    const getProvider = useCallback(async () => {
        if (!wallet) throw new Error('Wallet not available');
        return wallet.getProvider();
    }, [wallet]);

    /**
     * Sign a message with the wallet
     */
    const signMessage = useCallback(async (message: string): Promise<string> => {
        if (!wallet) throw new Error('Wallet not available');

        const provider = await wallet.getProvider();
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        const signature = await provider.request({
            method: 'personal_sign',
            params: [message, accounts[0]],
        });

        return signature as string;
    }, [wallet]);

    /**
     * Send a transaction
     */
    const sendTransaction = useCallback(async (params: {
        to: string;
        value?: string;
        data?: string;
    }): Promise<string> => {
        if (!wallet) throw new Error('Wallet not available');

        const provider = await wallet.getProvider();
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
                from: accounts[0],
                to: params.to,
                value: params.value || '0x0',
                data: params.data,
            }],
        });

        return txHash as string;
    }, [wallet]);

    /**
     * Create an embedded wallet if one doesn't exist
     */
    const createWallet = useCallback(async () => {
        if (wallets.length === 0) {
            await create();
        }
    }, [wallets, create]);

    return {
        // State
        user,
        wallet,
        address: wallet?.address,
        isReady,
        isAuthenticated,
        isWalletReady,

        // Methods
        getAddress,
        getProvider,
        signMessage,
        sendTransaction,
        createWallet,
        logout,
    };
}
