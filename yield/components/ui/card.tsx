import { cn } from '@/lib/utils';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface CardProps {
    className?: string;
    children: React.ReactNode;
}

function Card({ className, children }: CardProps) {
    return (
        <View
            className={cn(
                'rounded-xl border border-border bg-card shadow-sm',
                className
            )}
        >
            {children}
        </View>
    );
}

interface CardHeaderProps {
    className?: string;
    children: React.ReactNode;
}

function CardHeader({ className, children }: CardHeaderProps) {
    return (
        <View className={cn('flex flex-col gap-1.5 p-6', className)}>
            {children}
        </View>
    );
}

interface CardTitleProps {
    className?: string;
    children: React.ReactNode;
}

function CardTitle({ className, children }: CardTitleProps) {
    return (
        <Text className={cn('text-xl font-semibold text-foreground', className)}>
            {children}
        </Text>
    );
}

interface CardDescriptionProps {
    className?: string;
    children: React.ReactNode;
}

function CardDescription({ className, children }: CardDescriptionProps) {
    return (
        <Text className={cn('text-sm text-muted-foreground', className)}>
            {children}
        </Text>
    );
}

interface CardContentProps {
    className?: string;
    children: React.ReactNode;
}

function CardContent({ className, children }: CardContentProps) {
    return <View className={cn('p-6 pt-0', className)}>{children}</View>;
}

interface CardFooterProps {
    className?: string;
    children: React.ReactNode;
}

function CardFooter({ className, children }: CardFooterProps) {
    return (
        <View className={cn('flex flex-row items-center p-6 pt-0', className)}>
            {children}
        </View>
    );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
