import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
    const offset = useSharedValue(checked ? 1 : 0);

    useEffect(() => {
        offset.value = withSpring(checked ? 1 : 0, {
            mass: 0.8,
            damping: 15,
            stiffness: 150,
        });
    }, [checked]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            offset.value,
            [0, 1],
            ['#E2E8F0', '#FA4616'] // mute to primary
        );
        return {
            backgroundColor: disabled ? '#E2E8F0' : backgroundColor,
            opacity: disabled ? 0.5 : 1,
        };
    });

    const animatedThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: offset.value * 20 }], // 20px translation for a w-11 container (44px) - thumb width (24px) ~ 20px space?
        };
    });

    const handlePress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onCheckedChange(!checked);
    };

    return (
        <Pressable onPress={handlePress} disabled={disabled} className={cn("active:opacity-90", className)}>
            <Animated.View
                style={[animatedContainerStyle]}
                className="w-11 h-6 rounded-full justify-center px-[2px]"
            >
                <Animated.View
                    style={animatedThumbStyle}
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                />
            </Animated.View>
        </Pressable>
    );
}
