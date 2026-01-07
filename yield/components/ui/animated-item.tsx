import Animated from 'react-native-reanimated';
import { FadeInStagger, FadeOutStagger } from '@/lib/animations';
import { ViewProps } from 'react-native';

interface AnimatedItemProps extends ViewProps {
    index: number;
    delay?: number;
}

export function AnimatedItem({ index, delay = 100, style, children, ...props }: AnimatedItemProps) {
    return (
        <Animated.View
            entering={FadeInStagger(index, 500)}
            exiting={FadeOutStagger(index)}
            style={style}
            {...props}
        >
            {children}
        </Animated.View>
    );
}
