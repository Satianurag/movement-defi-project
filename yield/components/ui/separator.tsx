import { cn } from '@/lib/utils';
import { View } from 'react-native';

interface SeparatorProps {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
}

function Separator({ className, orientation = 'horizontal' }: SeparatorProps) {
    return (
        <View
            className={cn(
                'shrink-0 bg-border',
                orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
                className
            )}
        />
    );
}

export { Separator };
