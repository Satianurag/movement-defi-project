import { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { cn } from '@/lib/utils';

function Skeleton({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof View>) {
    const opacity = new Animated.Value(0.5);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            className={cn("rounded-md bg-muted", className)}
            style={[{ opacity }, props.style]}
            {...props}
        />
    );
}

export { Skeleton };
