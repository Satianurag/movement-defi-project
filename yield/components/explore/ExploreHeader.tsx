import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '@/lib/useWallet';
import { router } from 'expo-router';
import { UserIcon, CompassIcon, WifiIcon, WifiOffIcon } from 'lucide-react-native';
import { HIT_SLOP } from '@/lib/accessibility';

export function ExploreHeader() {
    const insets = useSafeAreaInsets();
    const { isAuthenticated, address } = useWallet();

    const formatAddress = (addr?: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    return (
        <View
            className="px-4 pb-3 bg-background border-b border-border/30"
            style={{ paddingTop: insets.top + 12 }}
        >
            <View className="flex-row items-center justify-between">
                {/* Brand & Title */}
                <View className="flex-row items-center gap-2">
                    <View className="h-8 w-8 rounded-lg bg-primary items-center justify-center">
                        <CompassIcon size={18} color="white" strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text className="text-xl font-black text-foreground tracking-tight">
                            Kinetic
                        </Text>
                    </View>
                </View>

                {/* Right Side - Connection + Profile */}
                <View className="flex-row items-center gap-3">
                    {/* Connection Status */}
                    {isAuthenticated ? (
                        <Badge variant="success" className="bg-success/10 border-success/20">
                            <WifiIcon size={12} className="text-success mr-1" />
                            <Text className="text-success text-xs font-medium">
                                {formatAddress(address)}
                            </Text>
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-muted/50">
                            <WifiOffIcon size={12} className="text-muted-foreground mr-1" />
                            <Text className="text-muted-foreground text-xs">Not connected</Text>
                        </Badge>
                    )}

                    {/* Profile Button - 44dp touch target */}
                    <Pressable
                        onPress={() => router.push('/(tabs)/profile')}
                        className="h-11 w-11 rounded-full bg-muted items-center justify-center"
                        hitSlop={HIT_SLOP.comfortable}
                        accessibilityLabel="Go to profile"
                        accessibilityRole="button"
                    >
                        <UserIcon size={20} className="text-foreground" />
                    </Pressable>
                </View>
            </View>

            {/* Subtitle */}
            <Text className="text-sm text-muted-foreground mt-2">
                Find the best yield opportunities
            </Text>
        </View>
    );
}

