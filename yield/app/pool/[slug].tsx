import { useLocalSearchParams, Stack, router } from 'expo-router';
import { View, ScrollView, Pressable, Linking, Platform, RefreshControl, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    ArrowLeftIcon,
    ExternalLinkIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    CoinsIcon,
    PercentIcon,
    LayersIcon,
    InfoIcon,
    WalletIcon,
    ClockIcon,
    ShieldCheckIcon,
    BarChart3Icon,
    ActivityIcon,
    LoaderIcon,
    CheckCircle2Icon,
    ArrowDownIcon,
    ArrowUpIcon,
} from 'lucide-react-native';
import { PoolData } from '@/components/PoolCard';
import { useWallet } from '@/lib/useWallet';
import { useProtocol, TransactionResult } from '@/lib/useProtocol';
import { ZapTransactionModal, ZapStep } from '@/components/ZapTransactionModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

// Category colors
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Yield Aggregator': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
    'Dexs': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    'Lending': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
    'Liquid Staking': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
    'Liquidity Manager': { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
    'DEX': { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
    default: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
};

// Format large numbers
const formatTVL = (tvl?: number): string => {
    if (!tvl) return '$0';
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(2)}K`;
    return `$${tvl.toFixed(2)}`;
};

// Parse percentage change
const parseChange = (change?: string): { value: string; isPositive: boolean } => {
    if (!change || change === 'N/A') return { value: '0%', isPositive: true };
    const numericValue = parseFloat(change.replace('%', ''));
    return {
        value: Math.abs(numericValue).toFixed(2) + '%',
        isPositive: numericValue >= 0,
    };
};

interface ProtocolDetail extends PoolData {
    mcap?: number;
    change_1d?: string;
    volume24h?: number;
    fees24h?: number;
}

export default function PoolDetailScreen() {
    const { slug, name, tvl, apy, category, change_7d, apyNote, apySource } = useLocalSearchParams<{
        slug: string;
        name: string;
        tvl: string;
        apy: string;
        category: string;
        change_7d: string;
        apyNote: string;
        apySource: string;
    }>();

    const [pool, setPool] = useState<ProtocolDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [totalTVL, setTotalTVL] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [isDepositing, setIsDepositing] = useState(false);
    const [zapStep, setZapStep] = useState<ZapStep>('initiating');
    const [zapTxHash, setZapTxHash] = useState<string | undefined>(undefined);
    const [zapError, setZapError] = useState<string | undefined>(undefined);
    const [showZapModal, setShowZapModal] = useState(false);

    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // Wallet hook
    const {
        isReady,
        isAuthenticated,
        isSmartWalletReady,
        smartWalletAddress,
        address,
        sendSmartTransaction,
        createWallet,
        sendTransaction
    } = useWallet();

    // Protocol integration (routes to correct protocol by slug)
    const { deposit, withdraw, isLoading: protocolLoading } = useProtocol();

    // Initialize from params
    useEffect(() => {

        const tvlNum = parseFloat(tvl || '0');
        setPool({
            name: name || 'Unknown Protocol',
            slug: slug || '',
            tvl: tvlNum,
            apy: apy || 'N/A',
            category: category || 'DeFi',
            change_7d: change_7d || 'N/A',
            apyNote: apyNote || '',
            apySource: apySource || '',
        });
    }, [slug, name, tvl, apy, category, change_7d, apyNote, apySource]);

    // Fetch total TVL for comparison
    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/defi/metrics`);
            const json = await response.json();
            if (json.success) {
                const protocols = json.data.protocols || [];
                const total = protocols.reduce((sum: number, p: PoolData) => sum + (p.tvl || 0), 0);
                setTotalTVL(total);
            }
        } catch (error) {
            console.error('Failed to fetch total TVL:', error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    const handleDeposit = async () => {
        if (!isReady) return;

        if (!isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        // Show Modal & Start
        setShowZapModal(true);
        setZapStep('initiating');
        setZapError(undefined);
        setIsDepositing(true);

        try {
            const targetAddress = smartWalletAddress || address;

            if (!targetAddress) {
                await createWallet();
                setZapStep('error');
                setZapError('Wallet created. Please try again.');
                return;
            }

            // Simulate "Optimizing" step if it's a DEX (visual feedback)
            if (pool?.category === 'DEX' || pool?.slug?.includes('meridian')) {
                setZapStep('optimizing');
                await new Promise(r => setTimeout(r, 1500)); // Visual delay for effect

                setZapStep('swapping');
                await new Promise(r => setTimeout(r, 1500)); // Visual delay for effect
            }

            // Proceed to execution (Backend handles the rest, but we show "Adding Liq" state)
            setZapStep('adding_liquidity');

            const asset = mapPoolToAsset(pool?.name || '');
            const amount = '1000000000000000000'; // 1 MOVE

            const result = await deposit(pool?.slug || 'echelon', asset, amount, targetAddress);

            if (result.success) {
                setZapStep('success');
                setZapTxHash(result.hash);
            } else {
                throw new Error(result.error || 'Deposit failed');
            }
        } catch (error) {
            console.error('Deposit error:', error);
            setZapStep('error');
            setZapError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setIsDepositing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!isReady) return;

        if (!isAuthenticated) {
            router.push('/sign-in');
            return;
        }

        setIsWithdrawing(true);
        try {
            const targetAddress = smartWalletAddress || address;

            if (!targetAddress) {
                Alert.alert('No Wallet', 'Please create a wallet first.');
                setIsWithdrawing(false);
                return;
            }

            const asset = mapPoolToAsset(pool?.name || '');
            const amount = '1000000000000000000';

            const result = await withdraw(pool?.slug || 'echelon', asset, amount, targetAddress);

            if (result.success) {
                Alert.alert(
                    'Withdraw Successful',
                    `Withdrawn from ${result.protocol}!\nHash: ${result.hash?.slice(0, 10)}...`
                );
            } else {
                throw new Error(result.error || 'Withdraw failed');
            }
        } catch (error) {
            console.error('Withdraw error:', error);
            Alert.alert('Withdraw Failed', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const mapPoolToAsset = (name: string): string => {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('usdc')) return 'USDC';
        if (nameLower.includes('usdt')) return 'USDT';
        if (nameLower.includes('eth') || nameLower.includes('weth')) return 'wETH';
        if (nameLower.includes('btc') || nameLower.includes('wbtc')) return 'wBTC';
        return 'MOVE';
    };

    if (!pool) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <LoaderIcon size={32} className="text-primary animate-spin" />
            </View>
        );
    }

    const categoryStyle = CATEGORY_COLORS[pool.category] || CATEGORY_COLORS.default;
    const { value: changeValue, isPositive } = parseChange(pool.change_7d);
    const tvlPercentage = totalTVL > 0 ? ((pool.tvl || 0) / totalTVL) * 100 : 0;

    const handleOpenProtocol = () => {
        const url = `https://defillama.com/protocol/${pool.slug}`;
        Linking.openURL(url);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: pool.name,
                    headerShown: true,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} className="mr-4">
                            <ArrowLeftIcon size={24} className="text-foreground" />
                        </Pressable>
                    ),
                }}
            />

            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{ paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Hero Section */}
                <View className="px-6 pt-6 pb-4">
                    <View className="flex-row items-center gap-4 mb-4">
                        <View className="h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center">
                            <LayersIcon size={32} className="text-primary" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-foreground">{pool.name}</Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn(categoryStyle.bg, categoryStyle.border)}>
                                    {pool.category}
                                </Badge>
                            </View>
                        </View>
                    </View>

                    {/* Quick Stats Row */}
                    <View className="flex-row gap-3 mt-2">
                        <Card className="flex-1 p-4 shadow-none border-border/50">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <CoinsIcon size={14} className="text-muted-foreground" />
                                <Text className="text-xs text-muted-foreground">TVL</Text>
                            </View>
                            <Text className="text-xl font-bold text-foreground">
                                {formatTVL(pool.tvl)}
                            </Text>
                        </Card>

                        <Card className="flex-1 p-4 shadow-none border-border/50">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <PercentIcon size={14} className="text-muted-foreground" />
                                <Text className="text-xs text-muted-foreground">APY</Text>
                            </View>
                            <Text className={cn(
                                'text-xl font-bold',
                                pool.apy?.includes('%') ? 'text-emerald-500' : 'text-foreground'
                            )}>
                                {pool.apy || 'N/A'}
                            </Text>
                        </Card>

                        <Card className="flex-1 p-4 shadow-none border-border/50">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                {isPositive ? (
                                    <TrendingUpIcon size={14} className="text-emerald-500" />
                                ) : (
                                    <TrendingDownIcon size={14} className="text-red-500" />
                                )}
                                <Text className="text-xs text-muted-foreground">7D</Text>
                            </View>
                            <Text className={cn(
                                'text-xl font-bold',
                                isPositive ? 'text-emerald-500' : 'text-red-500'
                            )}>
                                {isPositive ? '+' : '-'}{changeValue}
                            </Text>
                        </Card>
                    </View>
                </View>

                {/* Tabs Section */}
                <View className="px-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full flex-row bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
                            <TabsTrigger
                                value="overview"
                                className="flex-1 bg-transparent shadow-none border-b-2 border-transparent rounded-none py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none aria-selected:border-primary aria-selected:text-primary aria-selected:shadow-none"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="details"
                                className="flex-1 bg-transparent shadow-none border-b-2 border-transparent rounded-none py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none aria-selected:border-primary aria-selected:text-primary aria-selected:shadow-none"
                            >
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="info"
                                className="flex-1 bg-transparent shadow-none border-b-2 border-transparent rounded-none py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none aria-selected:border-primary aria-selected:text-primary aria-selected:shadow-none"
                            >
                                Info
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            {/* TVL Share */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>TVL Share</CardTitle>
                                    <CardDescription>
                                        Share of total Kinetic TVL
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <View className="gap-2">
                                        <View className="flex-row justify-between">
                                            <Text className="text-sm text-muted-foreground">
                                                {formatTVL(pool.tvl)} of {formatTVL(totalTVL)}
                                            </Text>
                                            <Text className="text-sm font-medium text-foreground">
                                                {tvlPercentage.toFixed(1)}%
                                            </Text>
                                        </View>
                                        <Progress value={tvlPercentage} className="h-3" />
                                    </View>
                                </CardContent>
                            </Card>

                            {/* Performance Metrics */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <View className="gap-4">
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-2">
                                                <ActivityIcon size={16} className="text-muted-foreground" />
                                                <Text className="text-muted-foreground">7-Day Change</Text>
                                            </View>
                                            <View className="flex-row items-center gap-1">
                                                {isPositive ? (
                                                    <TrendingUpIcon size={14} className="text-emerald-500" />
                                                ) : (
                                                    <TrendingDownIcon size={14} className="text-red-500" />
                                                )}
                                                <Text className={cn(
                                                    'font-semibold',
                                                    isPositive ? 'text-emerald-500' : 'text-red-500'
                                                )}>
                                                    {isPositive ? '+' : '-'}{changeValue}
                                                </Text>
                                            </View>
                                        </View>

                                        <Separator />

                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-2">
                                                <PercentIcon size={16} className="text-muted-foreground" />
                                                <Text className="text-muted-foreground">Estimated APY</Text>
                                            </View>
                                            <Text className="font-semibold text-foreground">{pool.apy}</Text>
                                        </View>

                                        <Separator />

                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-2">
                                                <BarChart3Icon size={16} className="text-muted-foreground" />
                                                <Text className="text-muted-foreground">Category</Text>
                                            </View>
                                            <Badge variant="outline" className={cn(categoryStyle.bg, categoryStyle.border)}>
                                                {pool.category}
                                            </Badge>
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Details Tab */}
                        <TabsContent value="details">
                            {/* APY Breakdown */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>APY Information</CardTitle>
                                    <CardDescription>
                                        How the yield is calculated
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <View className="gap-4">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-muted-foreground">Estimated APY</Text>
                                            <Text className="font-semibold text-emerald-500 text-lg">
                                                {pool.apy}
                                            </Text>
                                        </View>

                                        <Separator />

                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-muted-foreground">Source</Text>
                                            <Text className="font-medium text-foreground text-right flex-1 ml-4">
                                                {pool.apySource || 'Protocol data'}
                                            </Text>
                                        </View>

                                        {pool.apyNote && (
                                            <>
                                                <Separator />
                                                <View className="bg-muted/50 rounded-lg p-3">
                                                    <View className="flex-row items-start gap-2">
                                                        <InfoIcon size={14} className="text-muted-foreground mt-0.5" />
                                                        <Text className="text-sm text-muted-foreground flex-1">
                                                            {pool.apyNote}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </CardContent>
                            </Card>

                            {/* Risk & Security */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>Risk Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <View className="gap-3">
                                        <View className="flex-row items-center gap-3 bg-muted/50 rounded-lg p-3">
                                            <ShieldCheckIcon size={20} className="text-emerald-500" />
                                            <View className="flex-1">
                                                <Text className="font-medium text-foreground">Protocol Risk</Text>
                                                <Text className="text-xs text-muted-foreground">
                                                    Smart contract and protocol-specific risks apply
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center gap-3 bg-muted/50 rounded-lg p-3">
                                            <ClockIcon size={20} className="text-blue-500" />
                                            <View className="flex-1">
                                                <Text className="font-medium text-foreground">TVL History</Text>
                                                <Text className="text-xs text-muted-foreground">
                                                    Check DefiLlama for historical TVL trends
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Info Tab */}
                        <TabsContent value="info">
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>Protocol Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <View className="gap-3">
                                        <View className="flex-row justify-between">
                                            <Text className="text-muted-foreground">Name</Text>
                                            <Text className="font-medium text-foreground">{pool.name}</Text>
                                        </View>
                                        <Separator />
                                        <View className="flex-row justify-between">
                                            <Text className="text-muted-foreground">Slug</Text>
                                            <Text className="font-mono text-sm text-foreground">{pool.slug}</Text>
                                        </View>
                                        <Separator />
                                        <View className="flex-row justify-between">
                                            <Text className="text-muted-foreground">Category</Text>
                                            <Text className="font-medium text-foreground">{pool.category}</Text>
                                        </View>
                                        <Separator />
                                        <View className="flex-row justify-between">
                                            <Text className="text-muted-foreground">Network</Text>
                                            <Text className="font-medium text-foreground">Movement</Text>
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>

                            {/* External Link */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onPress={handleOpenProtocol}
                            >
                                <ExternalLinkIcon size={16} className="text-foreground" />
                                <Text>View on DefiLlama</Text>
                            </Button>
                        </TabsContent>
                    </Tabs>
                </View>

                {/* Action Buttons */}
                <View className="px-6 mt-6 gap-3">
                    <View className="flex-row gap-3">
                        <Button
                            className="flex-1 h-14"
                            onPress={handleDeposit}
                            disabled={isDepositing || isWithdrawing || !isReady}
                        >
                            {isDepositing ? (
                                <LoaderIcon size={20} className="text-primary-foreground animate-spin" />
                            ) : (
                                <>
                                    <ArrowDownIcon size={18} className="text-primary-foreground" />
                                    <Text className="font-semibold ml-2">Deposit</Text>
                                </>
                            )}
                        </Button>

                        <Button
                            variant="secondary"
                            className="flex-1 h-14"
                            onPress={handleWithdraw}
                            disabled={isDepositing || isWithdrawing || !isReady}
                        >
                            {isWithdrawing ? (
                                <LoaderIcon size={20} className="text-secondary-foreground animate-spin" />
                            ) : (
                                <>
                                    <ArrowUpIcon size={18} className="text-secondary-foreground" />
                                    <Text className="font-semibold ml-2">Withdraw</Text>
                                </>
                            )}
                        </Button>
                    </View>

                    <Button variant="outline" className="w-full" onPress={handleOpenProtocol}>
                        <ExternalLinkIcon size={16} className="text-foreground" />
                        <Text>Visit Protocol</Text>
                    </Button>
                </View>
            </ScrollView>

            <ZapTransactionModal
                visible={showZapModal}
                step={zapStep}
                protocolName={pool.name}
                txHash={zapTxHash}
                error={zapError}
                onClose={() => setShowZapModal(false)}
            />
        </>
    );
}
