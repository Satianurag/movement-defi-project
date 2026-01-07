import { Tabs } from 'expo-router';
import { CompassIcon, UserIcon, SettingsIcon, ArrowLeftRightIcon, WalletIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Platform, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME } from '@/lib/theme';

// Tab badge component for notifications
function TabBadge({ count }: { count?: number }) {
    if (!count || count <= 0) return null;

    return (
        <View
            className="absolute -top-1 -right-2 min-w-[18px] h-[18px] rounded-full bg-destructive items-center justify-center px-1"
            accessibilityLabel={`${count} notifications`}
        >
            <Text className="text-[10px] font-bold text-white">
                {count > 99 ? '99+' : count}
            </Text>
        </View>
    );
}

// Icon wrapper with optional badge
function TabIcon({
    Icon,
    color,
    focused,
    badgeCount
}: {
    Icon: any;
    color: string;
    focused: boolean;
    badgeCount?: number;
}) {
    return (
        <View className="relative">
            <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            <TabBadge count={badgeCount} />
        </View>
    );
}

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const theme = THEME[colorScheme ?? 'light'];

    // This would come from a notification context in production
    const notificationCount = 0; // Set to > 0 to show badge

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
                        <TabIcon Icon={CompassIcon} color={color} focused={focused} />
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
                        <TabIcon Icon={ArrowLeftRightIcon} color={color} focused={focused} />
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
                        <TabIcon Icon={WalletIcon} color={color} focused={focused} />
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
                        <TabIcon
                            Icon={UserIcon}
                            color={color}
                            focused={focused}
                            badgeCount={notificationCount}
                        />
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
                        <TabIcon
                            Icon={SettingsIcon}
                            color={color}
                            focused={focused}
                            badgeCount={1} // Example badge for security alert
                        />
                    ),
                }}
                listeners={{
                    tabPress: handleTabPress,
                }}
            />
        </Tabs>
    );
}

