import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StepIndicator } from '@/components/ui/step-indicator';
import { OnboardingSlide } from '@/components/onboarding-slide';
import { useOnboarding } from '@/lib/use-onboarding';
import { router, Stack } from 'expo-router';
import {
    WalletIcon,
    TrendingUpIcon,
    PieChartIcon,
    RocketIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { View, Dimensions, FlatList, type ViewToken } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideData {
    id: string;
    icon: typeof WalletIcon;
    title: string;
    description: string;
    iconColor: string;
}

const SLIDES: SlideData[] = [
    {
        id: 'welcome',
        icon: WalletIcon,
        title: 'Welcome to Kinetic',
        description:
            'DeFi Unbound — Your high-speed gateway to tracking the best yield opportunities on the Movement network.',
        iconColor: 'text-primary',
    },
    {
        id: 'yield',
        icon: TrendingUpIcon,
        title: 'Discover High-Velocity Yields',
        description:
            'Explore curated DeFi pools with real-time APY tracking and instant data velocity across all Movement protocols.',
        iconColor: 'text-emerald-500',
    },
    {
        id: 'portfolio',
        icon: PieChartIcon,
        title: 'Visualize Your Position',
        description:
            'Connect your wallet to monitor your liquid assets, track earnings, and gain kinetic insights on your DeFi investments.',
        iconColor: 'text-blue-500',
    },
    {
        id: 'start',
        icon: RocketIcon,
        title: "Launch Kinetic",
        description:
            'Sign in to unlock personalized recommendations and start accelerating your yield potential.',
        iconColor: 'text-amber-500',
    },
];

export default function OnboardingScreen() {
    const { completeOnboarding } = useOnboarding();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const isLastSlide = currentIndex === SLIDES.length - 1;
    const isFirstSlide = currentIndex === 0;

    const handleNext = () => {
        if (isLastSlide) {
            handleComplete();
        } else {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        }
    };

    const handleBack = () => {
        if (!isFirstSlide) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(tabs)/explore');
    };

    const handleComplete = async () => {
        await completeOnboarding();
        router.replace('/sign-in');
    };

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const renderSlide = ({ item }: { item: SlideData }) => (
        <View style={{ width: SCREEN_WIDTH }}>
            <OnboardingSlide
                icon={item.icon}
                title={item.title}
                description={item.description}
                iconColor={item.iconColor}
            />
        </View>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-1 bg-background">
                {/* Header with Skip */}
                <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onPress={handleBack}
                        disabled={isFirstSlide}
                        style={isFirstSlide ? { opacity: 0 } : undefined}
                    >
                        <ChevronLeftIcon size={24} className="text-foreground" />
                    </Button>

                    {/* Step Indicator */}
                    <StepIndicator totalSteps={SLIDES.length} currentStep={currentIndex} />

                    {/* Skip Button */}
                    <Button variant="ghost" onPress={handleSkip}>
                        <Text className="text-muted-foreground">Skip</Text>
                    </Button>
                </View>

                {/* Slides */}
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderSlide}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                />

                {/* Bottom Actions */}
                <View className="px-6 pb-12 pt-4">
                    <Button className="h-14 w-full" onPress={handleNext}>
                        <Text className="mr-2 text-base font-semibold">
                            {isLastSlide ? 'Get Started' : 'Continue'}
                        </Text>
                        <ArrowRightIcon size={20} className="text-primary-foreground" />
                    </Button>

                    {/* Explore without account */}
                    {isLastSlide && (
                        <Button variant="ghost" className="mt-4 w-full" onPress={handleSkip}>
                            <Text className="text-muted-foreground">Explore without an account</Text>
                        </Button>
                    )}
                </View>
            </View>
        </>
    );
}
