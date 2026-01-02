import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity } from 'react-native';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    title?: string;
    onClose: (id: string) => void;
}

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

export const Toast = ({ id, type, message, title, onClose }: ToastProps) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(3000),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => onClose(id));
    }, []);

    return (
        <Animated.View
            style={{ opacity, transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}
            className={`mx-4 mb-3 p-4 rounded-lg flex-row items-start border shadow-sm backdrop-blur-md ${TOAST_COLORS[type]} bg-background/95`}
        >
            <View className="mr-3 mt-0.5">{TOAST_ICONS[type]}</View>
            <View className="flex-1">
                {title && <Text className="font-bold text-foreground mb-1">{title}</Text>}
                <Text className="text-muted-foreground text-sm">{message}</Text>
            </View>
        </Animated.View>
    );
};
