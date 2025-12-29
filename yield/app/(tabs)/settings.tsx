import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { SettingsIcon, BellIcon, ShieldIcon, LogOutIcon } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function SettingsScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
            <View className="flex-1 bg-background p-6">
                <View className="items-center justify-center flex-1 gap-6">
                    <View className="items-center gap-3">
                        <SettingsIcon size={64} className="text-primary" strokeWidth={1.5} />
                        <Text className="text-3xl font-bold text-foreground">Settings</Text>
                        <Text className="text-muted-foreground text-center">
                            Customize your app experience
                        </Text>
                    </View>

                    <View className="w-full gap-3 mt-8">
                        <Button className="w-full">
                            <BellIcon size={18} className="text-primary-foreground" />
                            <Text>Notifications</Text>
                        </Button>

                        <Button variant="outline" className="w-full">
                            <ShieldIcon size={18} className="text-foreground" />
                            <Text>Privacy & Security</Text>
                        </Button>

                        <Button variant="secondary" className="w-full">
                            <Text>Account Settings</Text>
                        </Button>

                        <Button variant="destructive" className="w-full">
                            <LogOutIcon size={18} className="text-destructive-foreground" />
                            <Text className="text-white">Sign Out</Text>
                        </Button>
                    </View>
                </View>
            </View>
        </>
    );
}
