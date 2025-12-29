import * as LabelPrimitive from '@rn-primitives/label';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Text>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Text>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root className='web:cursor-default'>
        <LabelPrimitive.Text
            ref={ref}
            className={cn(
                'text-sm text-foreground native:text-base font-medium leading-none web:peer-disabled:cursor-not-allowed web:peer-disabled:opacity-70',
                className
            )}
            {...props}
        />
    </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Text.displayName;

export { Label };
