import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { CompassIcon, SearchIcon, TrendingUpIcon } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function ExploreScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Explore', headerShown: true }} />
            <View className="flex-1 bg-background p-6">
                <View className="items-center justify-center flex-1 gap-6">
                    <View className="items-center gap-3">
                        <CompassIcon size={64} className="text-primary" strokeWidth={1.5} />
                        <Text className="text-3xl font-bold text-foreground">Explore</Text>
                        <Text className="text-muted-foreground text-center">
                            Discover new opportunities and trending content
                        </Text>
                    </View>

                    <View className="w-full gap-3 mt-8">
                        <Button className="w-full">
                            <SearchIcon size={18} className="text-primary-foreground" />
                            <Text>Search Content</Text>
                        </Button>

                        <Button variant="outline" className="w-full">
                            <TrendingUpIcon size={18} className="text-foreground" />
                            <Text>View Trending</Text>
                        </Button>

                        <Button variant="secondary" className="w-full">
                            <Text>Browse Categories</Text>
                        </Button>
                    </View>
                </View>
            </View>
        </>
    );
}
