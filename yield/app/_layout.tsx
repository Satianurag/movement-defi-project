import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { PrivyProvider } from '@privy-io/expo';
import { SmartWalletsProvider } from '@privy-io/expo/smart-wallets';
import { ToastProvider } from '@/context/ToastContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Privy configuration
const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';

// Create a client
const queryClient = new QueryClient();

// Movement Testnet Configuration
const movementTestnet = {
  id: 30732,
  name: 'Movement Testnet',
  network: 'movement-testnet',
  nativeCurrency: {
    name: 'Move',
    symbol: 'MOVE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mevm.testnet.imola.movementlabs.xyz'],
    },
    public: {
      http: ['https://mevm.testnet.imola.movementlabs.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.testnet.imola.movementlabs.xyz',
    },
  },
  testnet: true,
};

// Separate navigation component to ensure proper context
function NavigationLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light'] as Theme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID}
      supportedChains={[movementTestnet]}
    >
      <QueryClientProvider client={queryClient}>
        <SmartWalletsProvider>
          <ToastProvider>
            <FavoritesProvider>
              <NavigationLayout />
            </FavoritesProvider>
          </ToastProvider>
        </SmartWalletsProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
