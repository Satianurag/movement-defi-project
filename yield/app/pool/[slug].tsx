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
import { PriceChart } from '@/components/charts/PriceChart';
import { useToast } from '@/context/ToastContext';
import { GasFeePreview } from '@/components/GasFeePreview';
import { BorrowRepayModal } from '@/components/lending/BorrowRepayModal';
import { API_URL as API_BASE_URL } from '@/lib/api-config';
import { useEchelon } from '@/lib/useEchelon';

// Category colors - using brand-consistent palette
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Yield Aggregator': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    'Dexs': { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
    'Lending': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    'Liquid Staking': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
    'Liquidity Manager': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    'DEX': { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
    default: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
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
    const [historyData, setHistoryData] = useState<{ timestamp: number; value: number }[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [showZapModal, setShowZapModal] = useState(false);
    const [borrowLimit, setBorrowLimit] = useState<string>('0');
    const { showToast } = useToast();

    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // Chart Interaction State
    // Chart Interaction State
    const [scrubbedValue, setScrubbedValue] = useState<number | null>(null);
    const displayTVL = scrubbedValue !== null ? scrubbedValue : (historyData.length > 0 ? historyData[historyData.length - 1].value : pool?.tvl);

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

    // Echelon hook for borrow limit
    const { getPosition, getMarketInfo } = useEchelon();

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

    // Fetch history data
    useEffect(() => {
        if (!slug) return;
        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/defi/history/${slug}`);
                const json = await response.json();
                if (json.success && Array.isArray(json.data)) {
                    // Format for chart: { timestamp: number, value: number }
                    const formatted = json.data.map((item: any) => ({
                        timestamp: item.date * 1000, // API uses seconds, JS uses ms
                        value: item.tvl
                    }));
                    setHistoryData(formatted);
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsHistoryLoading(false);
            }
        };
        fetchHistory();
    }, [slug]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    // Fetch real borrow limit from Echelon when user is authenticated
    useEffect(() => {
        const fetchBorrowLimit = async () => {
            if (!isAuthenticated || !smartWalletAddress || !pool) return;

            try {
                // Get market info for available liquidity
                const asset = mapPoolToAsset(pool.name);
                const marketInfo = await getMarketInfo(asset);

                if (marketInfo) {
                    // Available to borrow = total supplied - total borrowed
                    const totalSupplied = parseFloat(marketInfo.totalSupplied || '0');
                    const totalBorrowed = parseFloat(marketInfo.totalBorrowed || '0');
                    const available = Math.max(0, totalSupplied - totalBorrowed);

                    // Format with appropriate decimals
                    setBorrowLimit(available.toFixed(2));
                }
            } catch (error) {
                console.error('Failed to fetch borrow limit:', error);
                setBorrowLimit('0');
            }
        };

        fetchBorrowLimit();
    }, [isAuthenticated, smartWalletAddress, pool, getMarketInfo]);

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
                showToast('Please create a wallet first.', 'error', 'No Wallet');
                setIsWithdrawing(false);
                return;
            }

            const asset = mapPoolToAsset(pool?.name || '');
            const amount = '1000000000000000000';

            const result = await withdraw(pool?.slug || 'echelon', asset, amount, targetAddress);

            if (result.success) {
                showToast(
                    `Withdrawn from ${result.protocol}!`,
                    'success',
                    'Withdraw Successful'
                );
            } else {
                throw new Error(result.error || 'Withdraw failed');
            }
        } catch (error) {
            console.error('Withdraw error:', error);
            showToast(error instanceof Error ? error.message : 'Unknown error', 'error', 'Withdraw Failed');
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FA4616" colors={["#FA4616"]} />
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
                                pool.apy?.includes('%') ? 'text-success' : 'text-foreground'
                            )}>
                                {pool.apy || 'N/A'}
                            </Text>
                        </Card>

                        <Card className="flex-1 p-4 shadow-none border-border/50">
                            <View className="flex-row items-center gap-1.5 mb-1">
                                {isPositive ? (
                                    <TrendingUpIcon size={14} className="text-success" />
                                ) : (
                                    <TrendingDownIcon size={14} className="text-destructive" />
                                )}
                                <Text className="text-xs text-muted-foreground">7D</Text>
                            </View>
                            <Text className={cn(
                                'text-xl font-bold',
                                isPositive ? 'text-success' : 'text-destructive'
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

                            {/* User Position Card (New) */}
                            {isAuthenticated && (
                                <Card className="mb-4 border-primary/20 bg-primary/5">
                                    <CardHeader className="pb-2">
                                        <View className="flex-row items-center justify-between">
                                            <CardTitle className="text-primary">My Position</CardTitle>
                                            <Badge className="bg-primary">Active</Badge>
                                        </View>
                                    </CardHeader>
                                    <CardContent>
                                        <View className="flex-row gap-4">
                                            <View className="flex-1">
                                                <Text className="text-xs text-muted-foreground mb-1">Staked Amount</Text>
                                                <Text className="text-lg font-bold text-foreground">$1,250.00</Text>
                                                <Text className="text-xs text-muted-foreground">1,250 MOVE</Text>
                                            </View>
                                            <View className="w-px bg-primary/20" />
                                            <View className="flex-1">
                                                <Text className="text-xs text-muted-foreground mb-1">Pending Rewards</Text>
                                                <Text className="text-lg font-bold text-success">+$12.45</Text>
                                                <Text className="text-xs text-muted-foreground">12.4 MOVE</Text>
                                            </View>
                                        </View>
                                        <Button className="mt-3 h-8" variant="outline" size="sm">
                                            <Text className="text-xs">Claim Rewards</Text>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

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
                                                    <TrendingUpIcon size={14} className="text-success" />
                                                ) : (
                                                    <TrendingDownIcon size={14} className="text-destructive" />
                                                )}
                                                <Text className={cn(
                                                    'font-semibold',
                                                    isPositive ? 'text-success' : 'text-destructive'
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
                            {/* TVL History Chart */}
                            <Card className="mb-4">
                                <CardHeader>
                                    <View className="flex-row items-center justify-between">
                                        <View>
                                            <CardTitle>TVL History</CardTitle>
                                            <CardDescription>
                                                {scrubbedValue !== null ? (
                                                    <Text className="text-foreground font-bold">{formatTVL(scrubbedValue)}</Text>
                                                ) : (
                                                    'Historical Total Value Locked'
                                                )}
                                            </CardDescription>
                                        </View>
                                        {/* Time Range Selectors */}
                                        <View className="flex-row bg-muted rounded-lg p-0.5">
                                            {['1D', '1W', '1M', 'All'].map((range) => (
                                                <Pressable
                                                    key={range}
                                                    className={cn(
                                                        "px-2 py-1 rounded-md",
                                                        range === '1M' ? "bg-background shadow-sm" : ""
                                                    )}
                                                >
                                                    <Text className={cn(
                                                        "text-[10px] font-medium",
                                                        range === '1M' ? "text-foreground" : "text-muted-foreground"
                                                    )}>{range}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                </CardHeader>
                                <CardContent>
                                    <PriceChart
                                        data={historyData}
                                        loading={isHistoryLoading}
                                        height={180}
                                        onScrub={setScrubbedValue}
                                    />
                                </CardContent>
                            </Card>

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
                                            <Text className="font-semibold text-success text-lg">
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
                                            <ShieldCheckIcon size={20} className="text-success" />
                                            <View className="flex-1">
                                                <Text className="font-medium text-foreground">Protocol Risk</Text>
                                                <Text className="text-xs text-muted-foreground">
                                                    Smart contract and protocol-specific risks apply
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center gap-3 bg-muted/50 rounded-lg p-3">
                                            <ClockIcon size={20} className="text-primary" />
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
                                    <View className="flex-row items-center justify-between">
                                        <CardTitle>About Protocol</CardTitle>
                                        <Badge variant="outline" className="border-success/20 bg-success/10">
                                            <ShieldCheckIcon size={12} className="text-success mr-1" />
                                            <Text className="text-xs text-success">Audited</Text>
                                        </Badge>
                                    </View>
                                </CardHeader>
                                <CardContent>
                                    <Text className="text-muted-foreground mb-4 leading-5">
                                        {pool.name} is a leading protocol on the Movement network, providing advanced {pool.category.toLowerCase()} solutions.
                                        Users can earn yield by providing liquidity or staking tokens.
                                    </Text>

                                    <View className="gap-3">
                                        <View className="flex-row justify-between">
                                            <Text className="text-muted-foreground">Category</Text>
                                            <Text className="font-medium text-foreground">{pool.category}</Text>
                                        </View>
                                        <Separator />
                                        <View className="flex-row justify-between">
                                            <Text className="text-muted-foreground">Network</Text>
                                            <Text className="font-medium text-foreground">Movement</Text>
                                        </View>
                                        <Separator />
                                        <View className="flex-row justify-between">
                                            <Text className="text-muted-foreground">Launch Date</Text>
                                            <Text className="font-medium text-foreground">Oct 2024</Text>
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>

                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>Links</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <View className="gap-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                            onPress={handleOpenProtocol}
                                        >
                                            <Text>Website</Text>
                                            <ExternalLinkIcon size={16} className="text-foreground" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                            onPress={() => Linking.openURL(`https://twitter.com/search?q=${pool.name}`)}
                                        >
                                            <Text>Twitter / X</Text>
                                            <ExternalLinkIcon size={16} className="text-foreground" />
                                        </Button>
                                    </View>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </View>

                {/* Action Buttons */}
                <View className="px-6 mt-6 gap-3">
                    <View className="flex-row items-center justify-between bg-muted/30 p-2 rounded-lg">
                        <Text className="text-sm text-muted-foreground">Network Cost</Text>
                        <GasFeePreview />
                    </View>
                    <View className="flex-row gap-3">
                        <Button
                            className="flex-1 h-14"
                            onPress={handleDeposit}
                            disabled={isDepositing || isWithdrawing || !isReady}
                            testID="pool-deposit-button"
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
                            testID="pool-withdraw-button"
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

                    {pool.category === 'Lending' && (
                        <Button
                            variant="secondary"
                            className="w-full mt-2 border border-primary/20 bg-primary/5"
                            onPress={() => setShowBorrowModal(true)}
                            disabled={!isReady}
                            testID="pool-borrow-repay-button"
                        >
                            <WalletIcon size={18} className="text-primary" />
                            <Text className="font-semibold ml-2 text-primary">Borrow / Repay</Text>
                        </Button>
                    )}

                    <Button variant="outline" className="w-full" onPress={handleOpenProtocol}>
                        <ExternalLinkIcon size={16} className="text-foreground" />
                        <Text>Visit Protocol</Text>
                    </Button>
                </View>
            </ScrollView >

            <ZapTransactionModal
                visible={showZapModal}
                step={zapStep}
                protocolName={pool.name}
                txHash={zapTxHash}
                error={zapError}
                onClose={() => setShowZapModal(false)}
            />

            {
                pool && (
                    <BorrowRepayModal
                        visible={showBorrowModal}
                        onClose={() => setShowBorrowModal(false)}
                        asset={mapPoolToAsset(pool.name)}
                        assetSymbol={mapPoolToAsset(pool.name)}
                        availableToBorrow={borrowLimit}
                    />
                )
            }
        </>
    );
}
