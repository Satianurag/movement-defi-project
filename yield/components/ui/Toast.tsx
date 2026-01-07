import React, { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    SlideInUp,
    SlideOutUp,
    FadeOut
} from 'react-native-reanimated';
// @ts-ignore
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    title?: string;
    action?: { label: string; onPress: () => void };
    onClose: (id: string) => void;
}

import { Button } from './button';

const TOAST_ICONS = {
    success: <CheckCircleIcon size={24} color="#16A34A" />,
    error: <XCircleIcon size={24} color="#EF4444" />,
    warning: <AlertCircleIcon size={24} color="#F59E0B" />,
    info: <InfoIcon size={24} color="#FA4616" />,
};

const TOAST_COLORS = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-red-500/10 border-red-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    info: 'bg-primary/10 border-primary/20',
};

export const Toast = ({ id, type, message, title, action, onClose }: ToastProps) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    // Auto dismiss
    useEffect(() => {
        if (!action) { // Only auto dismiss if no action? Or always? Usually action toasts stay longer or user dismisses. I'll keep auto dismiss for now but maybe longer. 
            // Actually, for now keep same behavior.
            const timer = setTimeout(() => {
                onClose(id);
            }, 6000); // Increased to 6s
            return () => clearTimeout(timer);
        }
    }, [id, onClose, action]);

    const pan = Gesture.Pan()
        .onUpdate((event: any) => {
            translateX.value = event.translationX;
        })
        .onEnd((event: any) => {
            if (Math.abs(event.translationX) > 100) {
                // Swipe out
                translateX.value = withTiming(event.translationX > 0 ? 500 : -500, {}, () => {
                    runOnJS(onClose)(id);
                });
            } else {
                // Reset
                translateX.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value
    }));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                entering={SlideInUp.springify().damping(15)}
                exiting={SlideOutUp}
                style={[animatedStyle]}
                className={`mx-4 mb-3 p-4 rounded-lg flex-row items-start border shadow-sm backdrop-blur-md ${TOAST_COLORS[type]} bg-background/95`}
            >
                <View className="mr-3 mt-0.5">{TOAST_ICONS[type]}</View>
                <View className="flex-1">
                    {title && <Text className="font-bold text-foreground mb-1">{title}</Text>}
                    <Text className="text-muted-foreground text-sm leading-5">{message}</Text>
                    {action && (
                        <View className="mt-3 flex-row">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 bg-transparent border-primary/20 hover:bg-primary/10"
                                onPress={() => {
                                    action.onPress();
                                    onClose(id);
                                }}
                            >
                                <Text className="text-xs font-semibold text-primary">{action.label}</Text>
                            </Button>
                        </View>
                    )}
                </View>
            </Animated.View>
        </GestureDetector>
    );
};
