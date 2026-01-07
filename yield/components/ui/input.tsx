import * as React from 'react';
import { TextInput, type TextInputProps, View, Platform } from 'react-native';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
    'flex rounded-md text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border border-input bg-background',
                ghost: 'border-transparent bg-transparent',
                filled: 'border-transparent bg-muted',
            },
            size: {
                default: 'h-10 native:h-12 px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25]',
                sm: 'h-8 native:h-10 px-2 web:py-1 text-sm native:text-base',
                lg: 'h-12 native:h-14 px-4 web:py-3 text-lg native:text-xl',
                xl: 'h-14 native:h-16 px-5 web:py-4 text-xl native:text-2xl font-semibold',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

type InputProps = TextInputProps &
    VariantProps<typeof inputVariants> & {
        error?: boolean;
        errorMessage?: string;
        leftIcon?: React.ReactNode;
        rightIcon?: React.ReactNode;
    };

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
    ({ className, placeholderTextColor, variant, size, error, errorMessage, leftIcon, rightIcon, ...props }, ref) => {
        const hasIcons = leftIcon || rightIcon;

        const inputElement = (
            <TextInput
                ref={ref}
                className={cn(
                    inputVariants({ variant, size }),
                    props.editable === false && 'opacity-50 web:cursor-not-allowed',
                    error && 'border-destructive focus:ring-destructive',
                    hasIcons && 'flex-1',
                    leftIcon && 'pl-0',
                    rightIcon && 'pr-0',
                    !hasIcons && 'web:w-full',
                    className
                )}
                placeholderTextColor={placeholderTextColor || '#71717A'}
                accessibilityState={{ disabled: props.editable === false }}
                {...props}
            />
        );

        if (hasIcons) {
            return (
                <View className="flex-col">
                    <View
                        className={cn(
                            'flex-row items-center rounded-md',
                            variant === 'default' && 'border border-input bg-background',
                            variant === 'ghost' && 'bg-transparent',
                            variant === 'filled' && 'bg-muted',
                            error && 'border-destructive',
                            size === 'default' && 'h-10 native:h-12 px-3',
                            size === 'sm' && 'h-8 native:h-10 px-2',
                            size === 'lg' && 'h-12 native:h-14 px-4',
                            size === 'xl' && 'h-14 native:h-16 px-5'
                        )}
                    >
                        {leftIcon && (
                            <View className="mr-2">
                                {leftIcon}
                            </View>
                        )}
                        {inputElement}
                        {rightIcon && (
                            <View className="ml-2">
                                {rightIcon}
                            </View>
                        )}
                    </View>
                    {error && errorMessage && (
                        <View className="mt-1">
                            <TextInput
                                editable={false}
                                value={errorMessage}
                                className="text-destructive text-xs"
                            />
                        </View>
                    )}
                </View>
            );
        }

        if (error && errorMessage) {
            return (
                <View className="flex-col w-full">
                    {inputElement}
                    <View className="mt-1">
                        <TextInput
                            editable={false}
                            value={errorMessage}
                            className="text-destructive text-xs"
                        />
                    </View>
                </View>
            );
        }

        return inputElement;
    }
);

Input.displayName = 'Input';

export { Input, inputVariants };
export type { InputProps };

