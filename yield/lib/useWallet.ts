import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { useSmartWallets } from '@privy-io/expo/smart-wallets';
import { useCallback, useMemo } from 'react';

/**
 * Custom hook wrapping Privy wallet functionality for the Movement DeFi app.
 * Provides easy access to wallet address, signing, transaction methods, and HD wallet management.
 */
export function useWallet() {
    const { user, isReady, logout } = usePrivy();
    const { wallets, create } = useEmbeddedEthereumWallet();
    const { client: smartWalletClient } = useSmartWallets();

    const wallet = wallets?.[0];
    const isAuthenticated = !!user;

    // Find the smart wallet address from linked accounts
    const smartWalletAddress = useMemo(() => {
        return user?.linked_accounts.find((account) => account.type === 'smart_wallet')?.address;
    }, [user]);

    // Get all HD wallet addresses
    const allWallets = useMemo(() => {
        return wallets.map((w, index) => ({
            address: w.address,
            hdIndex: index,
            isActive: index === 0,
        }));
    }, [wallets]);

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
     * Send a transaction via Smart Wallet (Account Abstraction)
     */
    const sendSmartTransaction = useCallback(async (params: {
        to: string;
        value?: string;
        data?: string;
    }): Promise<string> => {
        if (!smartWalletClient) throw new Error('Smart wallet not available');

        const txHash = await smartWalletClient.sendTransaction({
            to: params.to as any,
            value: params.value ? BigInt(params.value) : 0n,
            data: params.data as any,
        });

        return txHash;
    }, [smartWalletClient]);

    /**
     * Create an embedded wallet if one doesn't exist
     */
    const createWallet = useCallback(async () => {
        if (wallets.length === 0) {
            await create();
        }
    }, [wallets, create]);

    /**
     * Create an additional HD wallet (with a new index)
     * This creates a new wallet under the same account with a different derivation path
     */
    const createAdditionalWallet = useCallback(async (): Promise<string | null> => {
        try {
            // Create a new wallet - Privy will automatically assign the next HD index
            const result = await create();
            // Result may be void or return wallet info depending on SDK version
            return wallets[wallets.length - 1]?.address || null;
        } catch (error) {
            console.error('Failed to create additional wallet:', error);
            throw error;
        }
    }, [create, wallets]);

    /**
     * Get wallet count (number of HD wallets)
     */
    const walletCount = wallets.length;

    return {
        // State
        user,
        wallet,
        wallets: allWallets,
        walletCount,
        address: wallet?.address,
        smartWalletAddress,
        isReady,
        isAuthenticated,
        isWalletReady,
        isSmartWalletReady: !!smartWalletClient && !!smartWalletAddress,

        // Methods
        getAddress,
        getProvider,
        signMessage,
        sendTransaction,
        sendSmartTransaction,
        createWallet,
        createAdditionalWallet,
        logout,
    };
}
