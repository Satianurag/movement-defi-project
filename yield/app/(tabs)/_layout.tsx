import { Tabs } from 'expo-router';
import { CompassIcon, UserIcon, SettingsIcon, ArrowLeftRightIcon, WalletIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME } from '@/lib/theme';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const theme = THEME[colorScheme ?? 'light'];

    const handleTabPress = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FA4616', // Primary orange
                tabBarInactiveTintColor: 'hsl(0, 0%, 60%)', // Muted gray
                tabBarStyle: {
                    backgroundColor: 'hsl(0, 0%, 0%)', // Pure black
                    borderTopColor: 'hsl(0, 0%, 15%)', // Match --border token
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 12, // Safe area
                    height: Platform.OS === 'ios' ? 88 : 68,
                    elevation: 0, // Remove Android shadow
                    shadowOpacity: 0, // Remove iOS shadow
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                    letterSpacing: 0.5,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}>
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, focused }) => (
                        <CompassIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                    ),
                }}
                listeners={{
                    tabPress: handleTabPress,
                }}
            />
            <Tabs.Screen
                name="swap"
                options={{
                    title: 'Swap',
                    tabBarIcon: ({ color, focused }) => (
                        <ArrowLeftRightIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                    ),
                }}
                listeners={{
                    tabPress: handleTabPress,
                }}
            />
            <Tabs.Screen
                name="earn"
                options={{
                    title: 'Earn',
                    tabBarIcon: ({ color, focused }) => (
                        <WalletIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                    ),
                }}
                listeners={{
                    tabPress: handleTabPress,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <UserIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                    ),
                }}
                listeners={{
                    tabPress: handleTabPress,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <SettingsIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                    ),
                }}
                listeners={{
                    tabPress: handleTabPress,
                }}
            />
        </Tabs>
    );
}
