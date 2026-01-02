
import { View, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const FEATURED_ITEMS = [
    {
        id: 1,
        title: "Maximize Stablecoin Yields",
        subtitle: "Earn up to 15% APY on USD pairs",
        tag: "Strategy",
        color: "from-blue-600/20 to-purple-900/40",
        accent: "text-blue-400"
    },
    {
        id: 2,
        title: "New Movement Pools",
        subtitle: "Provide liquidity to the newest DEXs",
        tag: "New Launch",
        color: "from-orange-600/20 to-red-900/40",
        accent: "text-orange-400"
    },
    {
        id: 3,
        title: "Movement Testnet Live",
        subtitle: "Participate in early ecosystem rewards",
        tag: "Event",
        color: "from-green-600/20 to-teal-900/40",
        accent: "text-green-400"
    }
];

export function DiscoveryCarousel() {
    return (
        <View className="mb-6">
            <View className="px-4 mb-3 flex-row items-center gap-2">
                <SparklesIcon size={16} className="text-primary" fill="currentColor" />
                <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Featured
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + 12}
            >
                {FEATURED_ITEMS.map((item) => (
                    <Card
                        key={item.id}
                        className="overflow-hidden border-0"
                        style={{ width: CARD_WIDTH, height: 160 }}
                    >
                        <LinearGradient
                            colors={['#1a1a1a', '#0a0a0a']}
                            className="absolute inset-0"
                        />
                        <LinearGradient
                            colors={[item.color.split(' ')[0].replace('from-', ''), 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="absolute inset-0 opacity-50"
                        />

                        <View className="flex-1 p-5 justify-between">
                            <View>
                                <View className="flex-row mb-3">
                                    <View className="bg-background/40 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                                        <Text className={`text-xs font-bold ${item.accent}`}>
                                            {item.tag}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-xl font-black text-white mb-1 leading-6">
                                    {item.title}
                                </Text>
                                <Text className="text-sm text-gray-400 font-medium">
                                    {item.subtitle}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-end">
                                <Button size="sm" variant="secondary" className="h-8 rounded-full px-4 bg-white/10 hover:bg-white/20 border-0">
                                    <Text className="text-white text-xs mr-2">Explore</Text>
                                    <ArrowRightIcon size={12} className="text-white" />
                                </Button>
                            </View>
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
}
