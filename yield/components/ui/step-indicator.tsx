import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

interface StepIndicatorProps {
    totalSteps: number;
    currentStep: number;
    className?: string;
}

function StepIndicator({ totalSteps, currentStep, className }: StepIndicatorProps) {
    return (
        <View
            className={cn('flex-row items-center justify-center gap-2', className)}
            accessibilityRole="progressbar"
            accessibilityValue={{
                min: 0,
                max: totalSteps,
                now: currentStep + 1,
            }}
        >
            {Array.from({ length: totalSteps }).map((_, index) => (
                <StepDot key={index} isActive={index === currentStep} isPast={index < currentStep} />
            ))}
        </View>
    );
}

interface StepDotProps {
    isActive: boolean;
    isPast: boolean;
}

function StepDot({ isActive, isPast }: StepDotProps) {
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 200 }),
            opacity: withSpring(isActive || isPast ? 1 : 0.4, { damping: 15, stiffness: 200 }),
        };
    }, [isActive, isPast]);

    return (
        <Animated.View
            style={animatedStyle}
            className={cn(
                'h-2 rounded-full',
                isActive ? 'bg-primary' : isPast ? 'bg-primary/60' : 'bg-muted-foreground/40'
            )}
        />
    );
}

export { StepIndicator };
