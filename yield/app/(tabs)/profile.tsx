import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View, Image } from 'react-native';
import { UserIcon, EditIcon, ShareIcon } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
            <View className="flex-1 bg-background p-6">
                <View className="items-center justify-center flex-1 gap-6">
                    <View className="items-center gap-3">
                        <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center">
                            <UserIcon size={48} className="text-muted-foreground" strokeWidth={1.5} />
                        </View>
                        <Text className="text-3xl font-bold text-foreground">Profile</Text>
                        <Text className="text-muted-foreground text-center">
                            Manage your account and preferences
                        </Text>
                    </View>

                    <View className="w-full gap-3 mt-8">
                        <Button className="w-full">
                            <EditIcon size={18} className="text-primary-foreground" />
                            <Text>Edit Profile</Text>
                        </Button>

                        <Button variant="outline" className="w-full">
                            <ShareIcon size={18} className="text-foreground" />
                            <Text>Share Profile</Text>
                        </Button>

                        <Button variant="ghost" className="w-full">
                            <Text>View Activity</Text>
                        </Button>
                    </View>
                </View>
            </View>
        </>
    );
}
