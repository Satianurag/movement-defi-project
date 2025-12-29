import { cn } from '@/lib/utils';
import { createContext, useContext, useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Text } from '@/components/ui/text';

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
}

interface TabsProps {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children: React.ReactNode;
}

function Tabs({
    defaultValue,
    value: controlledValue,
    onValueChange,
    className,
    children,
}: TabsProps) {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const value = controlledValue ?? uncontrolledValue;

    const handleValueChange = (newValue: string) => {
        setUncontrolledValue(newValue);
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <View className={cn('w-full', className)}>{children}</View>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    className?: string;
    children: React.ReactNode;
}

function TabsList({ className, children }: TabsListProps) {
    return (
        <View
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 flex-row',
                className
            )}
        >
            {children}
        </View>
    );
}

interface TabsTriggerProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

function TabsTrigger({ value, className, children }: TabsTriggerProps) {
    const { value: selectedValue, onValueChange } = useTabs();
    const isSelected = selectedValue === value;

    return (
        <Pressable
            onPress={() => onValueChange(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 flex-1',
                'transition-all focus-visible:outline-none',
                isSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground',
                Platform.select({
                    web: 'hover:text-foreground',
                }),
                className
            )}
        >
            <Text
                className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}
            >
                {children}
            </Text>
        </Pressable>
    );
}

interface TabsContentProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

function TabsContent({ value, className, children }: TabsContentProps) {
    const { value: selectedValue } = useTabs();

    if (selectedValue !== value) {
        return null;
    }

    return <View className={cn('mt-2', className)}>{children}</View>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
