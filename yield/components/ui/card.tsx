import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { View, Text as RNText, Pressable, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const cardVariants = cva(
    'rounded-lg border shadow-sm',
    {
        variants: {
            variant: {
                default: 'border-border bg-card shadow-foreground/5',
                elevated: 'border-border bg-card-elevated shadow-lg shadow-black/10',
                glass: 'border-border/50 bg-card/80 backdrop-blur-xl',
                gradient: 'border-primary/20 bg-gradient-to-br from-card to-primary/5',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

type CardProps = React.ComponentPropsWithoutRef<typeof View> &
    VariantProps<typeof cardVariants> & {
        interactive?: boolean;
        onPress?: () => void;
    };

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
    ({ className, variant, interactive, onPress, ...props }, ref) => {
        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        const handlePressIn = () => {
            if (interactive || onPress) {
                scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
            }
        };

        const handlePressOut = () => {
            if (interactive || onPress) {
                scale.value = withSpring(1, { damping: 15, stiffness: 400 });
            }
        };

        const handlePress = () => {
            if (onPress) {
                if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onPress();
            }
        };

        if (interactive || onPress) {
            return (
                <AnimatedPressable
                    ref={ref as any}
                    className={cn(cardVariants({ variant }), className)}
                    style={animatedStyle}
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    {...props}
                />
            );
        }

        return (
            <View
                ref={ref}
                className={cn(cardVariants({ variant }), className)}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

import { Text } from '@/components/ui/text';

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, React.ComponentPropsWithoutRef<typeof View>>(
    ({ className, ...props }, ref) => (
        <View ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
            {typeof props.children === 'string' || typeof props.children === 'number' ? (
                <Text>{props.children}</Text>
            ) : (
                props.children
            )}
        </View>
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<React.ElementRef<typeof RNText>, React.ComponentPropsWithoutRef<typeof RNText>>(
    ({ className, ...props }, ref) => (
        <RNText
            ref={ref}
            className={cn(
                'text-2xl text-card-foreground font-semibold leading-none tracking-tight',
                className
            )}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<React.ElementRef<typeof RNText>, React.ComponentPropsWithoutRef<typeof RNText>>(
    ({ className, ...props }, ref) => (
        <RNText
            ref={ref}
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<React.ElementRef<typeof View>, React.ComponentPropsWithoutRef<typeof View>>(
    ({ className, ...props }, ref) => (
        <View ref={ref} className={cn('p-6 pt-0', className)} {...props}>
            {typeof props.children === 'string' || typeof props.children === 'number' ? (
                <Text>{props.children}</Text>
            ) : (
                props.children
            )}
        </View>
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<React.ElementRef<typeof View>, React.ComponentPropsWithoutRef<typeof View>>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            className={cn('flex flex-row items-center p-6 pt-0', className)}
            {...props}
        >
            {typeof props.children === 'string' || typeof props.children === 'number' ? (
                <Text>{props.children}</Text>
            ) : (
                props.children
            )}
        </View>
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
export type { CardProps };

