import { Platform } from 'react-native';

/**
 * Centralized API configuration for the Kinetic DeFi app.
 * All hooks should import from this file instead of duplicating the logic.
 */

/**
 * Get the API base URL based on environment and platform.
 * Priority:
 * 1. EXPO_PUBLIC_API_URL environment variable
 * 2. Android emulator localhost (10.0.2.2)
 * 3. Default localhost for iOS/web
 */
export const getApiBaseUrl = (): string => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
};

// Pre-computed API URL constant for backward compatibility
export const API_URL = getApiBaseUrl();
