/**
 * Centralized Privy Hooks Module
 * Re-exports all Privy hooks with proper typing for clean imports across the app.
 * 
 * Based on @privy-io/expo v0.63.0+
 */

// Core Authentication
export {
    usePrivy,
    useLoginWithEmail,
    useLoginWithSMS,
    useLoginWithOAuth,
    useEmbeddedEthereumWallet,
} from '@privy-io/expo';

// Account Linking
export {
    useLinkEmail,
    useLinkSMS,
    useLinkWithOAuth,
    useLinkWithSiwe,
    useLinkWithFarcaster,
} from '@privy-io/expo';

// Wallet Features
export {
    useSetEmbeddedWalletRecovery,
    useRecoverEmbeddedWallet,
} from '@privy-io/expo';

// MFA
export {
    useMfaEnrollment,
    useMfa,
} from '@privy-io/expo';

// Session Signers & Delegated Actions
export {
    useSessionSigners,
    useSigners,
    useHeadlessDelegatedActions,
} from '@privy-io/expo';

// Identity Token
export { useIdentityToken } from '@privy-io/expo';

// Passkey support
export {
    useLoginWithPasskey,
} from '@privy-io/expo/passkey';

// Smart Wallets
export { useSmartWallets } from '@privy-io/expo/smart-wallets';

// UI Components - Fiat On-Ramp & Delegated Actions
export { useFundWallet, useDelegatedActions } from '@privy-io/expo/ui';

/**
 * OAuth Provider types for linking and login
 */
export type OAuthProvider =
    | 'google'
    | 'apple'
    | 'twitter'
    | 'discord'
    | 'github'
    | 'linkedin'
    | 'spotify'
    | 'tiktok';

/**
 * Recovery method options
 */
export type RecoveryMethod =
    | 'user-passcode'
    | 'google-drive'
    | 'icloud';

/**
 * MFA method types
 */
export type MfaMethod = 'sms' | 'totp' | 'passkey';

/**
 * Chain type for delegated actions
 */
export type ChainType = 'ethereum' | 'solana';
