import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { LayersIcon, WalletIcon, TrendingUpIcon } from 'lucide-react-native';

// Interface for Portfolio Positions
interface Position {
    id: string;
    name: string;
    protocol: string;
    strategy: string; // e.g., 'Zap Strategy', 'Staking', 'Lending'
    amount: string;
    apy: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
}

// Simulated Data (would come from API)
const MOCK_POSITIONS: Position[] = [
    {
        id: '1',
        name: 'MOVE-USDC LP',
        protocol: 'Meridian',
        strategy: 'Zap Strategy',
        amount: '$850.00',
        apy: '+0.8%',
        icon: LayersIcon,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-500/10'
    },
    {
        id: '2',
        name: 'Staked MOVE',
        protocol: 'Echelon Market',
        strategy: 'Lending',
        amount: '$390.50',
        apy: '+4.2%',
        icon: WalletIcon,
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-500/10'
    }
];

export function PortfolioSection() {
    // efficient calculation of net worth
    const totalNetWorth = "$1,240.50";
    const netWorthChange = "+12.5%";

    return (
        <View className="gap-4 pt-4 border-t border-border">
            <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-foreground">My Positions</Text>
                <View className="flex-row items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <TrendingUpIcon size={12} className="text-emerald-500" />
                    <Text className="text-xs font-medium text-emerald-500">Live</Text>
                </View>
            </View>

            {/* Net Worth Summary */}
            <View className="flex-row gap-3">
                <Card className="flex-1 bg-primary/5 border-primary/10">
                    <CardContent className="p-4">
                        <Text className="text-xs text-muted-foreground mb-1">Total Net Worth</Text>
                        <Text className="text-2xl font-bold text-foreground">{totalNetWorth}</Text>
                        <Text className="text-xs text-emerald-500 font-medium">{netWorthChange} (7d)</Text>
                    </CardContent>
                </Card>
            </View>

            {/* Positions List */}
            <View className="gap-3">
                {MOCK_POSITIONS.map((pos) => (
                    <Card key={pos.id} className="flex-row items-center p-4 gap-4">
                        <View className={`h-10 w-10 rounded-full items-center justify-center ${pos.iconBg}`}>
                            <pos.icon size={20} className={pos.iconColor} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-foreground">{pos.name}</Text>
                            <Text className="text-xs text-muted-foreground">{pos.protocol} • {pos.strategy}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="font-bold text-foreground">{pos.amount}</Text>
                            <Text className="text-xs text-emerald-500">{pos.apy} APY</Text>
                        </View>
                    </Card>
                ))}
            </View>
        </View>
    );
}
