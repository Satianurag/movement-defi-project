import { useEffect } from 'react';
import { View, Animated } from 'react-native';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
    'bg-muted overflow-hidden',
    {
        variants: {
            variant: {
                default: 'rounded-md',
                text: 'rounded h-4 w-full',
                textShort: 'rounded h-4 w-3/4',
                textLong: 'rounded h-4 w-full',
                avatar: 'rounded-full',
                avatarSm: 'rounded-full h-8 w-8',
                avatarMd: 'rounded-full h-10 w-10',
                avatarLg: 'rounded-full h-12 w-12',
                avatarXl: 'rounded-full h-16 w-16',
                card: 'rounded-lg h-32 w-full',
                button: 'rounded-md h-10 w-24',
                buttonLg: 'rounded-md h-14 w-full',
                image: 'rounded-lg aspect-video w-full',
                badge: 'rounded-full h-5 w-16',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

type SkeletonProps = React.ComponentPropsWithoutRef<typeof View> &
    VariantProps<typeof skeletonVariants>;

function Skeleton({
    className,
    variant,
    ...props
}: SkeletonProps) {
    const opacity = new Animated.Value(0.5);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            className={cn(skeletonVariants({ variant }), className)}
            style={[{ opacity }, props.style]}
            {...props}
        />
    );
}

// Composite skeleton components for common patterns
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <View className={cn('gap-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant={i === lines - 1 ? 'textShort' : 'text'}
                />
            ))}
        </View>
    );
}

function SkeletonCard({ className }: { className?: string }) {
    return (
        <View className={cn('rounded-lg border border-border p-4 gap-4', className)}>
            <View className="flex-row items-center gap-3">
                <Skeleton variant="avatarMd" />
                <View className="flex-1 gap-2">
                    <Skeleton variant="text" className="w-1/2" />
                    <Skeleton variant="text" className="w-1/3" />
                </View>
            </View>
            <Skeleton variant="card" className="h-20" />
            <View className="flex-row gap-2">
                <Skeleton variant="button" className="flex-1" />
                <Skeleton variant="button" className="flex-1" />
            </View>
        </View>
    );
}

function SkeletonPoolCard({ className }: { className?: string }) {
    return (
        <View className={cn('rounded-lg border border-border p-4 gap-3', className)}>
            <View className="flex-row items-center gap-3">
                <Skeleton variant="avatarLg" />
                <View className="flex-1 gap-2">
                    <Skeleton variant="text" className="w-2/3" />
                    <Skeleton variant="badge" />
                </View>
            </View>
            <View className="flex-row gap-2">
                <View className="flex-1 bg-muted/30 rounded-lg p-3 gap-2">
                    <Skeleton variant="text" className="w-1/2 h-3" />
                    <Skeleton variant="text" className="w-3/4" />
                </View>
                <View className="flex-1 bg-muted/30 rounded-lg p-3 gap-2">
                    <Skeleton variant="text" className="w-1/2 h-3" />
                    <Skeleton variant="text" className="w-3/4" />
                </View>
            </View>
        </View>
    );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonPoolCard, skeletonVariants };
export type { SkeletonProps };

