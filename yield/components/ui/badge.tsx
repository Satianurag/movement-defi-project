import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 border',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary',
                secondary: 'border-transparent bg-secondary',
                destructive: 'border-transparent bg-destructive',
                outline: 'border-border bg-transparent',
                success: 'border-transparent bg-emerald-500/10 border-emerald-500/20',
                warning: 'border-transparent bg-yellow-500/10 border-yellow-500/20',
                info: 'border-transparent bg-blue-500/10 border-blue-500/20',
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
            success: 'text-emerald-500',
            warning: 'text-yellow-500',
            info: 'text-blue-500',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
    className?: string;
    textClassName?: string;
    children: React.ReactNode;
}

function Badge({ className, textClassName, variant, children }: BadgeProps) {
    return (
        <View className={cn(badgeVariants({ variant }), className)}>
            <Text className={cn(badgeTextVariants({ variant }), textClassName)}>
                {children}
            </Text>
        </View>
    );
}

export { Badge, badgeVariants };
