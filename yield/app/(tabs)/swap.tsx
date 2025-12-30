import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SettingsIcon, ArrowDownIcon, RefreshCwIcon, WalletIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TokenSelector, Token } from '@/components/swap/TokenSelector';
import { RouteSummary } from '@/components/swap/RouteSummary';
import { useWallet } from '@/lib/useWallet';

// Constants
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function SwapScreen() {
    const insets = useSafeAreaInsets();
    const { address, isReady } = useWallet();

    // State
    const [tokenIn, setTokenIn] = useState<Token>({ symbol: 'MOVE', name: 'Movement', decimals: 8, balance: '0.00' });
    const [tokenOut, setTokenOut] = useState<Token>({ symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '0.00' });
    const [amountIn, setAmountIn] = useState('');
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState<any>(null);
    const [showTokenSelector, setShowTokenSelector] = useState<'in' | 'out' | null>(null);

    // Mock Token List (In real app, fetch from API)
    const TOKENS: Token[] = [
        { symbol: 'MOVE', name: 'Movement', decimals: 8, balance: '124.50' },
        { symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '0.00' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, balance: '0.00' },
        { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, balance: '0.00' },
    ];

    // Debounced Quote Fetching
    useEffect(() => {
        const fetchQuote = async () => {
            if (!amountIn || parseFloat(amountIn) <= 0) {
                setQuote(null);
                return;
            }

            setLoading(true);
            try {
                // Determine if running locally or on device for API URL
                // For Android Emulator logic uses 10.0.2.2 usually, but here handled by env or utility
                const response = await fetch(`${API_URL}/api/swap/quote?tokenIn=${tokenIn.symbol}&tokenOut=${tokenOut.symbol}&amountIn=${amountIn}`);
                const data = await response.json();

                if (data.success) {
                    setQuote(data.data);
                } else {
                    console.error("Quote Error:", data.error);
                }
            } catch (e) {
                console.error("Failed to fetch quote", e);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchQuote, 500);
        return () => clearTimeout(timer);
    }, [amountIn, tokenIn.symbol, tokenOut.symbol]);

    const handleFlip = () => {
        setTokenIn(tokenOut);
        setTokenOut(tokenIn);
        setAmountIn(''); // Reset amount or convert based on new rate
        setQuote(null);
    };

    const handleSwap = async () => {
        if (!address) {
            Alert.alert('Connect Wallet', 'Please connect your wallet first.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/swap/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenIn: tokenIn.symbol,
                    tokenOut: tokenOut.symbol,
                    amountIn,
                    minAmountOut: quote?.minReceived,
                    userAddress: address
                })
            });
            const data = await response.json();

            if (data.success) {
                Alert.alert('Success!', `Swapped ${amountIn} ${tokenIn.symbol} for ${quote?.minReceived} ${tokenOut.symbol}`);
                setAmountIn('');
                setQuote(null);
            } else {
                Alert.alert('Transaction Failed', data.error);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to execute swap');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background relative">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background Atmosphere */}
            <View className="absolute top-0 left-0 right-0 h-[400px]">
                <LinearGradient
                    colors={['rgba(59, 130, 246, 0.15)', 'transparent']}
                    style={{ flex: 1 }}
                />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="px-6 flex-row items-center justify-between mb-8">
                    <Text className="text-3xl font-bold tracking-tight">Swap</Text>
                    <Button variant="ghost" size="icon">
                        <SettingsIcon size={24} className="text-foreground" />
                    </Button>
                </View>

                {/* Main Card */}
                <View className="px-4">
                    <Card className="p-4 gap-4 border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10">
                        {/* Token In */}
                        <View className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-muted-foreground text-xs font-medium">You Pay</Text>
                                <View className="flex-row items-center gap-1">
                                    <WalletIcon size={10} className="text-muted-foreground" />
                                    <Text className="text-muted-foreground text-xs">{tokenIn.balance}</Text>
                                    <TouchableOpacity onPress={() => setAmountIn(tokenIn.balance || '0')}>
                                        <Text className="text-primary text-xs font-bold ml-1">MAX</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between h-12">
                                <Input
                                    className="flex-1 text-3xl font-bold p-0 border-0 bg-transparent h-full text-foreground"
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={amountIn}
                                    onChangeText={setAmountIn}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowTokenSelector('in')}
                                    className="bg-background flex-row items-center gap-2 px-3 py-1.5 rounded-full border border-border ml-3 shadow-sm"
                                >
                                    <View className="w-5 h-5 rounded-full bg-primary/20 items-center justify-center">
                                        <Text className="text-[10px] font-bold text-primary">{tokenIn.symbol[0]}</Text>
                                    </View>
                                    <Text className="font-bold text-base">{tokenIn.symbol}</Text>
                                    <ArrowDownIcon size={14} className="text-muted-foreground" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xs text-muted-foreground mt-1">$ {quote?.usdValue || '0.00'}</Text>
                        </View>

                        {/* Flipper */}
                        <View className="items-center -my-7 z-10">
                            <TouchableOpacity
                                onPress={handleFlip}
                                className="bg-background p-2 rounded-xl border-4 border-card shadow-sm"
                            >
                                <ArrowDownIcon size={20} className="text-primary" />
                            </TouchableOpacity>
                        </View>

                        {/* Token Out */}
                        <View className="bg-muted/50 p-4 rounded-2xl border border-border/50 pt-6">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-muted-foreground text-xs font-medium">You Receive</Text>
                            </View>

                            <View className="flex-row items-center justify-between h-12">
                                {loading && !quote ? (
                                    <View className="flex-1 h-8 justify-center">
                                        <ActivityIndicator size="small" color="#888" />
                                    </View>
                                ) : (
                                    <Text
                                        className={`flex-1 text-3xl font-bold ${!quote ? 'text-muted-foreground' : 'text-foreground'}`}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {quote ? quote.estimatedOutput : '0'}
                                    </Text>
                                )}

                                <TouchableOpacity
                                    onPress={() => setShowTokenSelector('out')}
                                    className="bg-background flex-row items-center gap-2 px-3 py-1.5 rounded-full border border-border ml-3 shadow-sm"
                                >
                                    <View className="w-5 h-5 rounded-full bg-emerald-500/20 items-center justify-center">
                                        <Text className="text-[10px] font-bold text-emerald-500">{tokenOut.symbol[0]}</Text>
                                    </View>
                                    <Text className="font-bold text-base">{tokenOut.symbol}</Text>
                                    <ArrowDownIcon size={14} className="text-muted-foreground" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Route Summary */}
                        {quote && (
                            <RouteSummary
                                route={quote.route}
                                priceImpact={quote.priceImpact}
                                minReceived={quote.minReceived}
                                tokenOut={tokenOut.symbol}
                                isLoading={loading}
                            />
                        )}

                        {/* Action Button */}
                        <Button
                            className="h-14 mt-2"
                            size="lg"
                            onPress={handleSwap}
                            disabled={!amountIn || parseFloat(amountIn) <= 0 || loading}
                        >
                            {loading ? (
                                <View className="flex-row items-center gap-2">
                                    <RefreshCwIcon size={20} className="text-primary-foreground animate-spin" />
                                    <Text className="font-bold text-lg text-primary-foreground">Processing...</Text>
                                </View>
                            ) : (
                                <Text className="font-bold text-lg text-primary-foreground">
                                    {!amountIn ? 'Enter an amount' : 'Swap'}
                                </Text>
                            )}
                        </Button>
                    </Card>

                    {/* Footer Info */}
                    <Text className="text-center text-xs text-muted-foreground mt-6">
                        Powered by Movement Network • Mosaic Aggregator
                    </Text>
                </View>
            </ScrollView>

            <TokenSelector
                visible={!!showTokenSelector}
                onClose={() => setShowTokenSelector(null)}
                onSelect={(token) => {
                    if (showTokenSelector === 'in') setTokenIn(token);
                    else setTokenOut(token);
                }}
                tokens={TOKENS}
                selectedToken={showTokenSelector === 'in' ? tokenIn.symbol : tokenOut.symbol}
            />
        </View>
    );
}
