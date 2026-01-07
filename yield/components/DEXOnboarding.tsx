import React, { useState, useCallback, useEffect } from 'react';
import { View, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    interpolate,
    Extrapolate,
    FadeInDown,
    FadeInUp,
    runOnJS,
} from 'react-native-reanimated';
// @ts-ignore
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { ArrowRight, Wallet, Zap, ShieldCheck, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        title: "Welcome to Kinetic",
        subtitle: "DeFi Unbound",
        description: "Your gateway to premium yield optimization on the Movement Network. Experience the future of decentralized finance.",
        icon: Wallet,
        showBranding: true,
    },
    {
        title: "Maximize Your Yield",
        description: "Our intelligent aggregation engine automatically discovers and executes the highest-yielding opportunities across the entire DeFi ecosystem.",
        icon: TrendingUp,
        showBranding: false,
    },
    {
        title: "Lightning Fast",
        description: "Built on Movement Network for instant settlements and zero friction. Experience the fastest DeFi with institutional-grade performance.",
        icon: Zap,
        showBranding: false,
    },
    {
        title: "Secure & Private",
        description: "Institutional-grade security with a completely non-custodial experience. Your keys, your crypto, always.",
        icon: ShieldCheck,
        showBranding: false,
    }
];

interface DEXOnboardingProps {
    onComplete: () => void;
}

export function DEXOnboarding({ onComplete }: DEXOnboardingProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const glowPulse = useSharedValue(0);
    const iconScale = useSharedValue(0);
    const progressWidth = useSharedValue(0);
    const translationX = useSharedValue(0);

    // Pulsing glow animation
    useEffect(() => {
        glowPulse.value = withRepeat(
            withTiming(1, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    // Icon entrance animation
    useEffect(() => {
        iconScale.value = 0;
        iconScale.value = withSequence(
            withSpring(1.2, { damping: 8, stiffness: 100 }),
            withSpring(1, { damping: 10, stiffness: 100 })
        );
    }, [currentIndex]);

    // Progress bar animation
    useEffect(() => {
        progressWidth.value = withTiming((currentIndex + 1) / SLIDES.length, {
            duration: 500,
        });
    }, [currentIndex]);

    const handleNext = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(prev => prev + 1);
            scrollX.value = withSpring((currentIndex + 1) * width, {
                damping: 20,
                stiffness: 90,
            });
        } else {
            onComplete();
        }
    }, [currentIndex, onComplete, scrollX]);

    const handlePrevious = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            scrollX.value = withSpring((currentIndex - 1) * width, {
                damping: 20,
                stiffness: 90,
            });
        }
    }, [currentIndex, scrollX]);

    const handleSkip = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onComplete();
    }, [onComplete]);

    // Swipe gesture handler
    const panGesture = Gesture.Pan()
        .onUpdate((event: any) => {
            translationX.value = event.translationX;
        })
        .onEnd((event: any) => {
            const shouldMoveNext = event.translationX < -50 && currentIndex < SLIDES.length - 1;
            const shouldMovePrev = event.translationX > 50 && currentIndex > 0;

            if (shouldMoveNext) {
                runOnJS(handleNext)();
            } else if (shouldMovePrev) {
                runOnJS(handlePrevious)();
            }

            translationX.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: -scrollX.value },
            ],
        };
    });

    const swipeAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translationX.value * 0.5 }, // Parallax effect
            ],
        };
    });

    const iconAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: iconScale.value }],
        };
    });

    const glowAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            glowPulse.value,
            [0, 1],
            [0.3, 0.6]
        );
        const scale = interpolate(
            glowPulse.value,
            [0, 1],
            [1, 1.1]
        );
        return {
            opacity,
            transform: [{ scale }],
        };
    });

    const progressAnimatedStyle = useAnimatedStyle(() => {
        return {
            width: `${progressWidth.value * 100}%`,
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <View className="flex-1 bg-black">
                {/* Animated Background Gradient */}
                <LinearGradient
                    colors={['rgba(250, 70, 22, 0.05)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)']}
                    locations={[0, 0.3, 1]}
                    className="absolute inset-0"
                />

                {/* Skip Button */}
                {currentIndex < SLIDES.length - 1 && (
                    <Animated.View
                        entering={FadeInDown.delay(300)}
                        className="absolute top-12 right-6 z-10"
                    >
                        <TouchableOpacity
                            onPress={handleSkip}
                            className="px-4 py-2 bg-muted/10 rounded-full border border-muted/20"
                        >
                            <Text className="text-muted-foreground font-semibold text-sm">Skip</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Main Content Area */}
                <Animated.View
                    style={[{ width: width * SLIDES.length, flexDirection: 'row' }, animatedStyle, swipeAnimatedStyle]}
                >
                    {SLIDES.map((slide, index) => {
                        const isActive = index === currentIndex;

                        return (
                            <View key={index} style={{ width }} className="flex-1 justify-center px-8 py-12">
                                {/* Icon Container with Glow */}
                                <View className="items-center mb-16">
                                    <View className="relative">
                                        {/* Animated Glow Effect */}
                                        <Animated.View
                                            style={[
                                                glowAnimatedStyle,
                                                {
                                                    position: 'absolute',
                                                    top: -35,
                                                    left: -35,
                                                    right: -35,
                                                    bottom: -35,
                                                    backgroundColor: '#FA4616',
                                                    borderRadius: 100,
                                                }
                                            ]}
                                        />

                                        {/* Secondary Glow Ring */}
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: -45,
                                                left: -45,
                                                right: -45,
                                                bottom: -45,
                                                backgroundColor: '#FA4616',
                                                borderRadius: 110,
                                                opacity: 0.1,
                                            }}
                                        />

                                        {/* Icon Circle with Animation */}
                                        <Animated.View
                                            style={[iconAnimatedStyle]}
                                            className="h-36 w-36 rounded-full bg-primary/10 items-center justify-center border-2 border-primary/30"
                                        >
                                            <LinearGradient
                                                colors={['rgba(250, 70, 22, 0.2)', 'rgba(250, 70, 22, 0.05)']}
                                                start={[0, 0]}
                                                end={[1, 1]}
                                                style={{
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: 100,
                                                }}
                                            />
                                            <slide.icon size={72} color="#FA4616" strokeWidth={1.5} />
                                        </Animated.View>
                                    </View>
                                </View>

                                {/* Content */}
                                <View className="items-center">
                                    {/* Branding (First Slide Only) */}
                                    {slide.showBranding && (
                                        <Animated.View
                                            entering={FadeInUp.delay(200)}
                                            className="mb-6"
                                        >
                                            <Text className="text-sm font-bold text-primary/90 tracking-widest uppercase text-center mb-2 letterSpacing-2">
                                                {slide.subtitle}
                                            </Text>
                                        </Animated.View>
                                    )}

                                    {/* Title */}
                                    <Animated.View entering={FadeInUp.delay(300)}>
                                        <Text className="text-4xl font-bold text-white text-center mb-6 tracking-tight px-4 leading-tight">
                                            {slide.title}
                                        </Text>
                                    </Animated.View>

                                    {/* Description */}
                                    <Animated.View entering={FadeInUp.delay(400)}>
                                        <Text className="text-base text-muted-foreground text-center leading-relaxed px-2 opacity-90">
                                            {slide.description}
                                        </Text>
                                    </Animated.View>
                                </View>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Footer */}
                <View className="absolute bottom-12 left-0 right-0 px-8">
                    {/* Enhanced Progress Indicator */}
                    <View className="mb-8">
                        {/* Overall Progress Bar */}
                        <View className="h-1 bg-muted/20 rounded-full overflow-hidden mb-4">
                            <Animated.View
                                style={progressAnimatedStyle}
                                className="h-full bg-primary rounded-full"
                            />
                        </View>

                        {/* Individual Step Dots */}
                        <View className="flex-row justify-center items-center gap-2 mb-3">
                            {SLIDES.map((_, index) => {
                                const isActive = index === currentIndex;
                                const isPast = index < currentIndex;

                                return (
                                    <View
                                        key={index}
                                        className={`h-2 w-2 rounded-full ${isActive ? 'bg-primary' :
                                            isPast ? 'bg-primary/60' :
                                                'bg-muted/40'
                                            }`}
                                        style={{
                                            transform: [{ scale: isActive ? 1.25 : 1 }]
                                        }}
                                    />
                                );
                            })}
                        </View>

                        {/* Step Counter */}
                        <Text className="text-center text-xs text-muted-foreground/80 font-medium">
                            Step {currentIndex + 1} of {SLIDES.length}
                        </Text>
                    </View>

                    {/* Action Button with Gradient Border Effect */}
                    <View className="relative">
                        {/* Gradient Border Glow */}
                        <LinearGradient
                            colors={['rgba(250, 70, 22, 0.3)', 'rgba(250, 70, 22, 0.1)']}
                            start={[0, 0]}
                            end={[1, 1]}
                            style={{
                                position: 'absolute',
                                inset: -2,
                                borderRadius: 18,
                                opacity: 0.5,
                            }}
                        />

                        <Button
                            onPress={handleNext}
                            size="lg"
                            className="h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 relative z-10"
                            data-testid="onboarding-next-button"
                        >
                            <Text className="text-lg font-bold text-white mr-2">
                                {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                            </Text>
                            <ArrowRight size={22} color="white" strokeWidth={2.5} />
                        </Button>
                    </View>

                    {/* Additional Info */}
                    {currentIndex === SLIDES.length - 1 && (
                        <Animated.View entering={FadeInDown.delay(200)}>
                            <Text className="text-center text-xs text-muted-foreground/70 mt-5 leading-relaxed px-4">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </Text>
                        </Animated.View>
                    )}

                    {/* Swipe Hint (First Slide Only) */}
                    {currentIndex === 0 && (
                        <Animated.View
                            entering={FadeInUp.delay(1000)}
                            className="mt-4"
                        >
                            <Text className="text-center text-xs text-muted-foreground/50 font-medium">
                                Swipe to explore →
                            </Text>
                        </Animated.View>
                    )}
                </View>
            </View>
        </GestureDetector >
    );
}
