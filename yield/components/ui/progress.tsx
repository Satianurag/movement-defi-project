import { cn } from '@/lib/utils';
import { View } from 'react-native';

interface ProgressProps {
    value?: number;
    max?: number;
    className?: string;
    indicatorClassName?: string;
}

function Progress({
    value = 0,
    max = 100,
    className,
    indicatorClassName,
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <View
            className={cn(
                'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
                className
            )}
        >
            <View
                className={cn(
                    'h-full bg-primary transition-all',
                    indicatorClassName
                )}
                style={{ width: `${percentage}%` }}
            />
        </View>
    );
}

export { Progress };
