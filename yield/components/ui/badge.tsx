import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { View, Animated as RNAnimated } from 'react-native';
import { Text, TextClassContext } from '@/components/ui/text';
import { useEffect, useRef } from 'react';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border border-border px-2.5 py-0.5 web:transition-colors web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary active:opacity-80',
                secondary: 'border-transparent bg-secondary active:opacity-80',
                destructive: 'border-transparent bg-destructive active:opacity-80',
                outline: 'text-foreground',
                success: 'border-transparent bg-success active:opacity-80',
                warning: 'border-transparent bg-warning active:opacity-80',
                hot: 'border-orange-500/30 bg-orange-500/10 active:opacity-80',
                new: 'border-primary/30 bg-primary/10 active:opacity-80',
                premium: 'border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 active:opacity-80',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const badgeTextVariants = cva('text-xs font-semibold', {
    variants: {
        variant: {
            default: 'text-primary-foreground',
            secondary: 'text-secondary-foreground',
            destructive: 'text-destructive-foreground',
            outline: 'text-foreground',
            success: 'text-white',
            warning: 'text-white',
            hot: 'text-orange-500',
            new: 'text-primary',
            premium: 'text-amber-500',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

type BadgeProps = React.ComponentPropsWithoutRef<typeof View> &
    VariantProps<typeof badgeVariants> & {
        animated?: boolean;
    };

function Badge({ className, variant, animated, ...props }: BadgeProps) {
    const pulseAnim = useRef(new RNAnimated.Value(1)).current;

    useEffect(() => {
        if (animated) {
            RNAnimated.loop(
                RNAnimated.sequence([
                    RNAnimated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    RNAnimated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [animated]);

    const animatedStyle = animated ? { transform: [{ scale: pulseAnim }] } : {};

    return (
        <TextClassContext.Provider value={badgeTextVariants({ variant })}>
            <RNAnimated.View
                className={cn(badgeVariants({ variant }), className)}
                style={animatedStyle}
                {...props}
            >
                {typeof props.children === 'string' || typeof props.children === 'number' ? (
                    <Text>{props.children}</Text>
                ) : (
                    props.children
                )}
            </RNAnimated.View>
        </TextClassContext.Provider>
    );
}

export { Badge, badgeVariants, badgeTextVariants };
export type { BadgeProps };

