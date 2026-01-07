import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ExploreHeader() {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="px-4 pb-3 bg-background border-b border-border/30"
            style={{ paddingTop: insets.top + 12 }}
        >
            <Text className="text-2xl font-black text-foreground tracking-tight">
                Explore
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">
                Find the best yield opportunities
            </Text>
        </View>
    );
}
