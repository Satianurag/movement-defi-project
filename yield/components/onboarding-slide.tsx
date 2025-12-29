import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

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
            {/* Icon Container with Glassmorphism */}
            <View
                className={cn(
                    'mb-8 h-32 w-32 items-center justify-center rounded-3xl',
                    'bg-primary/10 border border-primary/20',
                    'shadow-lg shadow-primary/10'
                )}
            >
                <Icon size={64} className={iconColor} strokeWidth={1.5} />
            </View>

            {/* Title */}
            <Text className="mb-4 text-center text-3xl font-bold text-foreground">{title}</Text>

            {/* Description */}
            <Text className="mb-8 text-center text-lg leading-relaxed text-muted-foreground">
                {description}
            </Text>

            {/* Optional Extra Content */}
            {children}
        </View>
    );
}

export { OnboardingSlide };
export type { OnboardingSlideProps };
