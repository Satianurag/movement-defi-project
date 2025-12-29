import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/lib/use-onboarding';
import { usePrivy } from '@privy-io/expo';
import { Redirect, Stack } from 'expo-router';
import { LoaderIcon } from 'lucide-react-native';
import { View } from 'react-native';

const SCREEN_OPTIONS = {
  headerShown: false,
};

export default function Screen() {
  const { hasCompletedOnboarding, isLoading: isOnboardingLoading } = useOnboarding();
  const { isReady, user } = usePrivy();

  // Show loading while checking status
  if (isOnboardingLoading || !isReady) {
    return (
      <>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <View className="flex-1 items-center justify-center bg-background">
          <LoaderIcon size={32} className="text-primary animate-spin" />
          <Text className="mt-4 text-muted-foreground">Loading...</Text>
        </View>
      </>
    );
  }

  // New user → show onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Completed onboarding but not logged in → sign in
  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  // Logged in → main app
  return <Redirect href="/(tabs)/explore" />;
}

