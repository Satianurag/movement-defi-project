
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { CoinsIcon, BarChart3Icon, TrendingUpIcon } from 'lucide-react-native';
import { formatTotalTVL } from '@/lib/usePoolsData';

interface MarketPulseProps {
    totalTVL: number;
    topAPY: string;
    activePools: number;
    isLoading: boolean;
}

export function MarketPulse({ totalTVL, topAPY, activePools, isLoading }: MarketPulseProps) {
    return (
        <View className="px-4 mb-8">
            <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Market Pulse
            </Text>

            <View className="flex-row gap-3">
                {/* Total TVL */}
                <Card className="flex-1 bg-muted/30 border-border/50 p-3">
                    <View className="flex-row items-center gap-1.5 mb-1 opacity-70">
                        <CoinsIcon size={14} className="text-primary" />
                        <Text className="text-[10px] font-bold text-muted-foreground uppercase">
                            TVL
                        </Text>
                    </View>
                    <Text className="text-base font-black text-foreground" numberOfLines={1}>
                        {isLoading ? '...' : formatTotalTVL(totalTVL)}
                    </Text>
                </Card>

                {/* Top APY */}
                <Card className="flex-1 bg-muted/30 border-border/50 p-3">
                    <View className="flex-row items-center gap-1.5 mb-1 opacity-70">
                        <TrendingUpIcon size={14} className="text-success" />
                        <Text className="text-[10px] font-bold text-muted-foreground uppercase">
                            Top APY
                        </Text>
                    </View>
                    <Text className="text-base font-black text-foreground" numberOfLines={1}>
                        {isLoading ? '...' : topAPY}
                    </Text>
                </Card>

                {/* Active Pools */}
                <Card className="flex-1 bg-muted/30 border-border/50 p-3">
                    <View className="flex-row items-center gap-1.5 mb-1 opacity-70">
                        <BarChart3Icon size={14} className="text-blue-400" />
                        <Text className="text-[10px] font-bold text-muted-foreground uppercase">
                            Pools
                        </Text>
                    </View>
                    <Text className="text-base font-black text-foreground" numberOfLines={1}>
                        {isLoading ? '...' : activePools}
                    </Text>
                </Card>
            </View>
        </View>
    );
}
