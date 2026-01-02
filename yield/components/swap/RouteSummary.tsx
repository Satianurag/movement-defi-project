import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { ArrowRightIcon, ZapIcon, InfoIcon } from 'lucide-react-native';

interface RouteSummaryProps {
    route: any[];
    priceImpact: string;
    minReceived: string;
    tokenOut: string;
    isLoading?: boolean;
}

export function RouteSummary({ route, priceImpact, minReceived, tokenOut, isLoading }: RouteSummaryProps) {
    if (isLoading) {
        return (
            <Card className="p-4 bg-muted/50 border-dashed border-border">
                <View className="flex-row items-center justify-center gap-2">
                    <ZapIcon size={16} className="text-muted-foreground animate-pulse" />
                    <Text className="text-sm text-muted-foreground">Finding best route...</Text>
                </View>
            </Card>
        );
    }

    if (!route || route.length === 0) return null;

    const impactColor = parseFloat(priceImpact) > 1 ? 'text-destructive' : parseFloat(priceImpact) > 0.5 ? 'text-amber-500' : 'text-success';

    return (
        <View className="gap-3">
            {/* Best Route Badge */}
            <View className="flex-row items-center justify-between">
                <View className="bg-primary/10 px-2 py-1 rounded-full flex-row items-center gap-1.5 self-start">
                    <ZapIcon size={12} className="text-primary" fill="currentColor" />
                    <Text className="text-[10px] font-bold text-primary uppercase tracking-wider">Best Route</Text>
                </View>
                {parseFloat(priceImpact) > 0 && (
                    <Text className={`text-xs font-medium ${impactColor}`}>
                        -{priceImpact}% Impact
                    </Text>
                )}
            </View>

            {/* Route Visualization */}
            <Card className="p-4 bg-card border-border">
                <View className="flex-row items-center justify-between">
                    {/* Step 1 */}
                    <View className="flex-1 items-center">
                        <View className="w-8 h-8 rounded-full bg-muted items-center justify-center mb-1">
                            <Text className="font-bold text-xs">{route[0].tokenIn}</Text>
                        </View>
                    </View>

                    {/* Protocol Line */}
                    <View className="flex-[2] items-center px-2">
                        <View className="h-[2px] w-full bg-border relative top-3" />
                        <View className="bg-background border border-border px-2 py-0.5 rounded-full z-10">
                            <Text className="text-[10px] font-medium text-muted-foreground">
                                {route[0].protocol}
                            </Text>
                        </View>
                    </View>

                    {/* Step 2 */}
                    <View className="flex-1 items-center">
                        <View className="w-8 h-8 rounded-full bg-muted items-center justify-center mb-1">
                            <Text className="font-bold text-xs">{route[0].tokenOut}</Text>
                        </View>
                    </View>
                </View>

                <View className="mt-4 pt-3 border-t border-border flex-row justify-between items-center">
                    <View className="flex-row items-center gap-1.5">
                        <InfoIcon size={12} className="text-muted-foreground" />
                        <Text className="text-xs text-muted-foreground">Min. Received</Text>
                    </View>
                    <Text className="text-xs font-mono font-medium text-foreground">
                        {minReceived} {tokenOut}
                    </Text>
                </View>
            </Card>
        </View>
    );
}
