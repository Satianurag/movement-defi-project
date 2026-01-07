import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { LucideIcon, AlertTriangleIcon } from 'lucide-react-native';
import { AnimatedItem } from '@/components/ui/animated-item';

interface ErrorStateProps {
    icon?: LucideIcon;
    title?: string;
    description: string;
    retryLabel?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    icon: Icon = AlertTriangleIcon,
    title = 'Something went wrong',
    description,
    retryLabel = 'Try again',
    onRetry,
    className
}: ErrorStateProps) {
    return (
        <AnimatedItem index={0} className={`items-center justify-center p-8 bg-destructive/5 rounded-2xl border border-destructive/20 mb-4 ${className}`}>
            <View className="h-16 w-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
                <Icon size={32} className="text-destructive" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-1 text-center">
                {title}
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-6 max-w-[250px] leading-5">
                {description}
            </Text>
            {onRetry && (
                <Button variant="outline" onPress={onRetry} className="border-destructive/30 text-destructive">
                    <Text className="text-destructive">{retryLabel}</Text>
                </Button>
            )}
        </AnimatedItem>
    );
}
