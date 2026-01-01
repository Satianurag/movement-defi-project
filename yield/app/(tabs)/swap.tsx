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
import { SlippageModal } from '@/components/swap/SlippageModal';
import { useWallet } from '@/lib/useWallet';
import { useToast } from '@/context/ToastContext';
import { useQuery } from '@tanstack/react-query';

// Constants
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Fetch tokens from backend API
async function fetchSupportedTokens(): Promise<Token[]> {
    const response = await fetch(`${API_URL}/api/swap/tokens`);
    if (!response.ok) {
        throw new Error('Failed to fetch tokens');
    }
    const json = await response.json();
    if (!json.success) {
        throw new Error(json.error || 'Failed to fetch tokens');
    }
    // Map API response to Token format with default balance
    return json.data.map((t: any) => ({
        symbol: t.symbol,
        name: t.name,
        decimals: t.decimals,
        balance: '0.00', // Balance will be fetched separately when wallet connected
        logoURI: t.logoURI
    }));
}

export default function SwapScreen() {
    const insets = useSafeAreaInsets();
    const { address, isReady } = useWallet();
    const { showToast } = useToast();

    // Fetch supported tokens from API
    const { data: tokens = [], isLoading: tokensLoading } = useQuery({
        queryKey: ['supportedTokens'],
        queryFn: fetchSupportedTokens,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 2
    });

    // State
    const [tokenIn, setTokenIn] = useState<Token>({ symbol: 'MOVE', name: 'Movement', decimals: 8, balance: '0.00' });
    const [tokenOut, setTokenOut] = useState<Token>({ symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '0.00' });
    const [amountIn, setAmountIn] = useState('');
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState<any>(null);
    const [showTokenSelector, setShowTokenSelector] = useState<'in' | 'out' | null>(null);
    const [showSlippageModal, setShowSlippageModal] = useState(false);
    const [slippage, setSlippage] = useState(0.5);

    // Update tokenIn/tokenOut when tokens are loaded
    useEffect(() => {
        if (tokens.length > 0) {
            const moveToken = tokens.find(t => t.symbol === 'MOVE') || tokens[0];
            const usdcToken = tokens.find(t => t.symbol === 'USDC') || tokens[1];
            if (moveToken) setTokenIn(moveToken);
            if (usdcToken) setTokenOut(usdcToken);
        }
    }, [tokens]);

    // Debounced Quote Fetching
    useEffect(() => {
        const fetchQuote = async () => {
            if (!amountIn || parseFloat(amountIn) <= 0) {
                setQuote(null);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/swap/quote?tokenIn=${tokenIn.symbol}&tokenOut=${tokenOut.symbol}&amountIn=${amountIn}`);
                const data = await response.json();

                if (data.success) {
                    setQuote(data.data);
                } else {
                    console.error("Quote Error:", data.error);
                    setQuote(null);
                }
            } catch (e) {
                console.error("Failed to fetch quote", e);
                setQuote(null);
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
            showToast('Please connect your wallet first.', 'warning', 'Connect Wallet');
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
                    userAddress: address,
                    slippage
                })
            });
            const data = await response.json();

            if (data.success) {
                showToast(`Swapped ${amountIn} ${tokenIn.symbol}`, 'success', 'Swap Successful!');
                setAmountIn('');
                setQuote(null);
            } else {
                showToast(data.error || 'Transaction failed', 'error', 'Swap Failed');
            }
        } catch (e) {
            showToast('Failed to execute swap', 'error', 'Error');
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
                <View className="px-6 flex-row items-center justify-between mb-8">
                    <Text className="text-3xl font-bold tracking-tight">Swap</Text>
                    <Button variant="ghost" size="icon" onPress={() => setShowSlippageModal(true)}>
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
                tokens={tokens}
                selectedToken={showTokenSelector === 'in' ? tokenIn.symbol : tokenOut.symbol}
            />

            <SlippageModal
                visible={showSlippageModal}
                onClose={() => setShowSlippageModal(false)}
                currentSlippage={slippage}
                onSelectSlippage={setSlippage}
            />
        </View>
    );
}
