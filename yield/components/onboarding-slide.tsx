import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

interface OnboardingSlideProps {
    icon: LucideIcon;
    title: string;
    description: string;
    iconColor?: string;
    children?: React.ReactNode;
}

function OnboardingSlide({
    icon: Icon,
    title,
    description,
    iconColor = 'text-primary',
    children,
}: OnboardingSlideProps) {
    return (
        <View className="flex-1 items-center justify-center px-8">
            {/* Icon Container with Glassmorphism and Entry Animation */}
            <Animated.View
                entering={FadeInUp.delay(100).duration(500).springify()}
                className={cn(
                    'mb-8 h-32 w-32 items-center justify-center rounded-3xl',
                    'bg-primary/10 border border-primary/20',
                    'shadow-lg shadow-primary/10'
                )}
            >
                <Icon size={64} className={iconColor} strokeWidth={1.5} />
            </Animated.View>

            {/* Title with Entry Animation */}
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
                <Text className="mb-4 text-center text-3xl font-bold text-foreground">{title}</Text>
            </Animated.View>

            {/* Description with Entry Animation */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                <Text className="mb-8 text-center text-lg leading-relaxed text-muted-foreground">
                    {description}
                </Text>
            </Animated.View>

            {/* Optional Extra Content */}
            {children}
        </View>
    );
}

export { OnboardingSlide };
export type { OnboardingSlideProps };
