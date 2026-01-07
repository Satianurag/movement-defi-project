import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { LucideIcon, SearchXIcon } from 'lucide-react-native';
import { AnimatedItem } from '@/components/ui/animated-item';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon = SearchXIcon,
    title,
    description,
    actionLabel,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <AnimatedItem index={0} className={`items-center justify-center p-8 bg-muted/5 rounded-2xl border border-dashed border-border mb-4 ${className}`}>
            <View className="h-16 w-16 rounded-full bg-muted/10 items-center justify-center mb-4">
                <Icon size={32} className="text-muted-foreground" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-1 text-center">
                {title}
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-6 max-w-[250px] leading-5">
                {description}
            </Text>
            {actionLabel && onAction && (
                <Button variant="outline" onPress={onAction}>
                    <Text>{actionLabel}</Text>
                </Button>
            )}
        </AnimatedItem>
    );
}
