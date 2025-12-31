import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

const ONBOARDING_KEY = 'kinetic_onboarding_complete';

export function useOnboarding() {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
            setHasCompletedOnboarding(value === 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setHasCompletedOnboarding(false);
        } finally {
            setIsLoading(false);
        }
    };

    const completeOnboarding = useCallback(async () => {
        try {
            await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
            setHasCompletedOnboarding(true);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    }, []);

    const resetOnboarding = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync(ONBOARDING_KEY);
            setHasCompletedOnboarding(false);
        } catch (error) {
            console.error('Error resetting onboarding status:', error);
        }
    }, []);

    return {
        hasCompletedOnboarding,
        isLoading,
        completeOnboarding,
        resetOnboarding,
    };
}
