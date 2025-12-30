import { Tabs } from 'expo-router';
import { CompassIcon, UserIcon, SettingsIcon, ArrowLeftRightIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const theme = THEME[colorScheme ?? 'light'];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.mutedForeground,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopColor: theme.border,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 70,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 4,
                },
            }}>
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, size }) => (
                        <CompassIcon size={size} color={color} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="swap"
                options={{
                    title: 'Swap',
                    tabBarIcon: ({ color, size }) => (
                        <ArrowLeftRightIcon size={size} color={color} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <UserIcon size={size} color={color} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <SettingsIcon size={size} color={color} strokeWidth={2} />
                    ),
                }}
            />
        </Tabs>
    );
}
