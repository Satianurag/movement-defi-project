import React, { useState, useCallback, useEffect } from 'react';
import { View, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    interpolate,
    Extrapolate,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
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

    // Pulsing glow animation
    useEffect(() => {
        glowPulse.value = withRepeat(
            withTiming(1, { duration: 2000 }),
            -1,
            true
        );
    }, []);

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

    const handleSkip = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onComplete();
    }, [onComplete]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: -scrollX.value }],
        };
    });

    const glowAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            glowPulse.value,
            [0, 1],
            [0.3, 0.6]
        );
        return { opacity };
    });

    return (
        <View className="flex-1 bg-black">
            {/* Skip Button */}
            {currentIndex < SLIDES.length - 1 && (
                <Animated.View 
                    entering={FadeInDown.delay(300)}
                    className="absolute top-12 right-6 z-10"
                >
                    <TouchableOpacity 
                        onPress={handleSkip}
                        className="px-4 py-2"
                    >
                        <Text className="text-muted-foreground font-medium">Skip</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Main Content Area */}
            <Animated.View
                style={[{ width: width * SLIDES.length, flexDirection: 'row' }, animatedStyle]}
            >
                {SLIDES.map((slide, index) => (
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
                                            top: -30,
                                            left: -30,
                                            right: -30,
                                            bottom: -30,
                                            backgroundColor: '#FA4616',
                                            borderRadius: 100,
                                            opacity: 0.4,
                                        }
                                    ]}
                                />
                                
                                {/* Icon Circle */}
                                <View className="h-36 w-36 rounded-full bg-primary/10 items-center justify-center border-2 border-primary/30">
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
                                </View>
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
                                    <Text className="text-sm font-bold text-primary/80 tracking-widest uppercase text-center mb-2">
                                        {slide.subtitle}
                                    </Text>
                                </Animated.View>
                            )}

                            {/* Title */}
                            <Animated.View entering={FadeInUp.delay(300)}>
                                <Text className="text-4xl font-bold text-white text-center mb-6 tracking-tight px-4">
                                    {slide.title}
                                </Text>
                            </Animated.View>

                            {/* Description */}
                            <Animated.View entering={FadeInUp.delay(400)}>
                                <Text className="text-base text-muted-foreground text-center leading-relaxed px-2">
                                    {slide.description}
                                </Text>
                            </Animated.View>
                        </View>
                    </View>
                ))}
            </Animated.View>

            {/* Footer */}
            <View className="absolute bottom-12 left-0 right-0 px-8">
                {/* Progress Bar */}
                <View className="mb-8">
                    <View className="flex-row justify-center items-center gap-4 mb-3">
                        {SLIDES.map((_, index) => {
                            const isActive = index === currentIndex;
                            const isPast = index < currentIndex;
                            
                            return (
                                <View
                                    key={index}
                                    className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden"
                                >
                                    {(isActive || isPast) && (
                                        <View 
                                            className="h-full bg-primary rounded-full"
                                            style={{ 
                                                width: isActive ? '60%' : '100%',
                                            }}
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                    
                    {/* Step Counter */}
                    <Text className="text-center text-xs text-muted-foreground font-medium">
                        {currentIndex + 1} of {SLIDES.length}
                    </Text>
                </View>

                {/* Action Button */}
                <Button
                    onPress={handleNext}
                    size="lg"
                    className="h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                    data-testid="onboarding-next-button"
                >
                    <Text className="text-lg font-bold text-white mr-2">
                        {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                    </Text>
                    <ArrowRight size={22} color="white" strokeWidth={2.5} />
                </Button>

                {/* Additional Info */}
                {currentIndex === SLIDES.length - 1 && (
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Text className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}
