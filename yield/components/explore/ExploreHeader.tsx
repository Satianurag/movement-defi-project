
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { NetworkStatus } from '@/components/NetworkStatus';
import { Button } from '@/components/ui/button';
import { BellIcon, UserIcon } from 'lucide-react-native';
import { usePrivy } from '@privy-io/expo';
import { router } from 'expo-router';

export function ExploreHeader() {
    const { user } = usePrivy();

    return (
        <View className="flex-row items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md sticky top-0 z-50">
            {/* Left: Branding */}
            <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-black text-primary tracking-tighter">
                    YIELD
                </Text>
            </View>

            {/* Right: Actions */}
            <View className="flex-row items-center gap-3">
                <NetworkStatus />

                {/* Notification - Optional */}
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <BellIcon size={20} className="text-foreground" />
                </Button>

                {/* Profile */}
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-muted border border-border"
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    {(user as any)?.wallet?.address ? (
                        <View className="h-full w-full items-center justify-center bg-primary/20 rounded-full">
                            <Text className="text-xs font-bold text-primary">
                                {(user as any).wallet.address.slice(0, 2)}
                            </Text>
                        </View>
                    ) : (
                        <UserIcon size={18} className="text-muted-foreground" />
                    )}
                </Button>
            </View>
        </View>
    );
}
