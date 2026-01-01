import React from 'react';
import { View, FlatList, RefreshControl, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHistory, Transaction } from '@/lib/useHistory';
import { useWallet } from '@/lib/useWallet';
import { ActivityIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react-native';
// import { format } from 'date-fns';

export default function HistoryScreen() {
    const { address } = useWallet();
    const { data: history, isLoading, refetch, isRefetching } = useHistory(address);

    const openExplorer = (hash: string) => {
        Linking.openURL(`https://explorer.movementnetwork.xyz/txn/${hash}?network=testnet`);
    };

    const renderItem = ({ item }: { item: Transaction }) => {
        const date = new Date(parseInt(item.timestamp) / 1000);
        const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(date);

        // Clean up function name for display
        const functionName = item.function.split('::').pop() || 'Transaction';

        return (
            <Card className="mb-3 p-4">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                        {item.success ? (
                            <CheckCircleIcon size={18} className="text-emerald-500" />
                        ) : (
                            <XCircleIcon size={18} className="text-red-500" />
                        )}
                        <Text className="font-bold text-foreground text-base">
                            {functionName}
                        </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">{formattedDate}</Text>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                    <View>
                        <Text className="text-xs text-muted-foreground mb-1">Hash</Text>
                        <Text className="text-xs font-mono text-foreground">
                            {item.hash.slice(0, 6)}...{item.hash.slice(-4)}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Badge variant="outline" className={item.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}>
                            <Text className={item.success ? "text-emerald-500 text-xs" : "text-red-500 text-xs"}>
                                {item.success ? 'Success' : 'Failed'}
                            </Text>
                        </Badge>
                        <ActivityIcon
                            size={16}
                            className="text-primary cursor-pointer"
                            onPress={() => openExplorer(item.hash)}
                        />
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Transaction History',
                    headerShown: true,
                }}
            />
            <View className="flex-1 bg-background px-4 pt-4">
                {!address ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-muted-foreground">Please connect your wallet to view history</Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.hash} // Use hash as key
                        refreshControl={
                            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                        }
                        ListEmptyComponent={
                            !isLoading ? (
                                <View className="mt-10 items-center">
                                    <Text className="text-muted-foreground">No transactions found</Text>
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </>
    );
}
