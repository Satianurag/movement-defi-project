import React, { useState, useCallback } from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { ArrowRight, Wallet, Zap, ShieldCheck } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        title: "Move with Precision",
        description: "Experience the fastest DeFi on the Movement Network with instant settlements and zero friction.",
        icon: Zap,
        colors: ['hsl(200 100% 50%)', 'hsl(270 100% 60%)'],
    },
    {
        title: "Maximize Your Yield",
        description: "Our aggregation logic automatically finds the best opportunities across the ecosystem.",
        icon: Wallet,
        colors: ['hsl(270 100% 60%)', 'hsl(200 100% 50%)'],
    },
    {
        title: "Premium Security",
        description: "Institutional-grade security with a completely private and non-custodial experience.",
        icon: ShieldCheck,
        colors: ['hsl(190 100% 50%)', 'hsl(285 100% 60%)'],
    }
];

interface DEXOnboardingProps {
    onComplete: () => void;
}

export function DEXOnboarding({ onComplete }: DEXOnboardingProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const handleNext = useCallback(() => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(prev => prev + 1);
            scrollX.value = withSpring((currentIndex + 1) * width);
        } else {
            onComplete();
        }
    }, [currentIndex, onComplete, scrollX]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: -scrollX.value }],
        };
    });

    return (
        <View className="flex-1 bg-black">
            {/* Main Content Area */}
            <Animated.View
                style={[{ width: width * SLIDES.length, flexDirection: 'row' }, animatedStyle]}
            >
                {SLIDES.map((slide, index) => (
                    <View key={index} style={{ width }} className="flex-1 justify-center px-8">
                        <View className="items-center mb-12">
                            <LinearGradient
                                colors={slide.colors as any}
                                start={[0, 0]}
                                end={[1, 1]}
                                style={{
                                    width: 140,
                                    height: 140,
                                    borderRadius: 70,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: slide.colors[0],
                                    shadowOffset: { width: 0, height: 10 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 20,
                                }}
                            >
                                <slide.icon size={64} color="white" strokeWidth={1.5} />
                            </LinearGradient>
                        </View>

                        <Text className="text-4xl font-bold text-white text-center mb-4 tracking-tight">
                            {slide.title}
                        </Text>
                        <Text className="text-lg text-muted-foreground text-center leading-relaxed">
                            {slide.description}
                        </Text>
                    </View>
                ))}
            </Animated.View>

            {/* Footer */}
            <View className="absolute bottom-12 left-0 right-0 px-8">
                {/* Pagination Dots */}
                <View className="flex-row justify-center mb-8 gap-2">
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            className={`h-1.5 rounded-full ${index === currentIndex ? 'w-8 bg-primary' : 'w-1.5 bg-muted'}`}
                        />
                    ))}
                </View>

                {/* Action Button */}
                <Button
                    onPress={handleNext}
                    size="lg"
                    className="h-16 rounded-2xl flex-row items-center justify-center"
                >
                    <Text className="text-lg font-bold text-black mr-2">
                        {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <ArrowRight size={20} color="black" />
                </Button>
            </View>
        </View>
    );
}
