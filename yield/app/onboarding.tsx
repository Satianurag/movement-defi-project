import { DEXOnboarding } from '@/components/DEXOnboarding';
import { useOnboarding } from '@/lib/use-onboarding';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function OnboardingScreen() {
    const router = useRouter();
    const { completeOnboarding } = useOnboarding();

    const handleComplete = async () => {
        await completeOnboarding();
        router.replace('/sign-in');
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <DEXOnboarding onComplete={handleComplete} />
        </View>
    );
}
