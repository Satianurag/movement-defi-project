import React from 'react';
import { View, FlatList, RefreshControl, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHistory, Transaction } from '@/lib/useHistory';
import { useWallet } from '@/lib/useWallet';
import { ActivityIcon, CheckCircleIcon, XCircleIcon, WalletIcon, ClockIcon } from 'lucide-react-native';

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
            <Card className="mb-3 p-4" testID={`history-item-${item.hash.slice(0, 8)}`}>
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
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="h-20 w-20 rounded-full bg-primary/10 items-center justify-center mb-6">
                            <WalletIcon size={40} className="text-primary" />
                        </View>
                        <Text className="text-xl font-bold text-foreground mb-2">
                            Connect Your Wallet
                        </Text>
                        <Text className="text-muted-foreground text-center mb-6">
                            Sign in to view your transaction history and track all your DeFi activities
                        </Text>
                        <Button
                            onPress={() => router.push('/sign-in')}
                            testID="history-connect-wallet-button"
                        >
                            <WalletIcon size={18} className="text-primary-foreground mr-2" />
                            <Text className="font-semibold">Sign In</Text>
                        </Button>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.hash}
                        refreshControl={
                            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                        }
                        ListEmptyComponent={
                            !isLoading ? (
                                <View className="items-center justify-center py-12 px-6">
                                    <View className="h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
                                        <ClockIcon size={32} className="text-muted-foreground" />
                                    </View>
                                    <Text className="text-lg font-semibold text-foreground mb-2">
                                        No Transactions Yet
                                    </Text>
                                    <Text className="text-sm text-muted-foreground text-center">
                                        Your transaction history will appear here once you start making deposits, withdrawals, or swaps.
                                    </Text>
                                </View>
                            ) : null
                        }
                        testID="history-list"
                    />
                )}
            </View>
        </>
    );
}
