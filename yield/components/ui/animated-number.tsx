import { Text, TextProps as RNTextProps } from 'react-native';
import { useEffect, useState } from 'react';
import { Text as CustomText } from '@/components/ui/text';

interface AnimatedNumberProps extends React.ComponentProps<typeof CustomText> {
    value: number;
    formatter?: (val: number) => string;
}

export function AnimatedNumber({ value, formatter, ...props }: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(value);

    // Simple ticker effect for now as Reanimated Text requires special handling for string interpolation
    // A full reanimated solution would use runOnJS or TextInput adapter
    useEffect(() => {
        let start = displayValue;
        const end = value;
        if (start === end) return;

        const duration = 1000;
        const startTime = Date.now();

        const tick = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            const current = start + (end - start) * ease;
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }, [value]);

    return (
        <CustomText {...props}>
            {formatter ? formatter(displayValue) : displayValue.toFixed(0)}
        </CustomText>
    );
}
