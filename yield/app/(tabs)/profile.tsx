import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { View, Pressable, ScrollView, Modal } from 'react-native';
import {
    WalletIcon,
    LogOutIcon,
    CopyIcon,
    CheckIcon,
    LogInIcon,
    ChevronRightIcon,
    SettingsIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useWallet } from '@/lib/useWallet';
import { FundWallet } from '@/components/wallet/FundWallet';
import * as Clipboard from 'expo-clipboard';
import { PortfolioSection } from '@/components/profile/PortfolioSection';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Profile skeleton loading component
function ProfileSkeleton() {
    return (
        <View className="p-4 gap-4">
            {/* Wallet Card Skeleton */}
            <Card className="bg-card border-border">
                <CardContent className="p-4">
                    <View className="flex-row items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <View className="flex-1 gap-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-32" />
                        </View>
                        <Skeleton className="h-8 w-8 rounded" />
                    </View>
                    <View className="flex-row gap-2 mt-4">
                        <Skeleton className="flex-1 h-10 rounded-md" />
                        <Skeleton className="flex-1 h-10 rounded-md" />
                    </View>
                </CardContent>
            </Card>

            {/* Portfolio Skeleton */}
            <View className="gap-3">
                <Skeleton className="h-6 w-24" />
                <Card className="p-4">
                    <View className="gap-3">
                        <View className="flex-row justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </View>
                        <View className="flex-row justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                        </View>
                        <View className="flex-row justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </View>
                    </View>
                </Card>
            </View>
        </View>
    );
}

export default function ProfileScreen() {
    const { user, isReady, logout, address: walletAddress, smartWalletAddress, isAuthenticated } = useWallet();
    const [copied, setCopied] = useState(false);
    const [showFundWallet, setShowFundWallet] = useState(false);
    const insets = useSafeAreaInsets();

    const formatAddress = (address?: string) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleCopyAddress = async () => {
        const addr = smartWalletAddress || walletAddress;
        if (addr) {
            await Clipboard.setStringAsync(addr);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSignIn = () => router.push('/sign-in' as any);
    const handleLogout = async () => {
        await logout();
        router.replace('/sign-in' as any);
    };

    if (!isReady) {
        return (
            <>
                <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
                <ScrollView className="flex-1 bg-background">
                    <ProfileSkeleton />
                </ScrollView>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
            <ScrollView className="flex-1 bg-background">
                <View className="p-4 gap-4" style={{ paddingBottom: insets.bottom + 80 }}>

                    {/* Enhanced Wallet Summary Card */}
                    {isAuthenticated && walletAddress ? (
                        <Card className="bg-card border-border overflow-hidden">
                            {/* Gradient header accent */}
                            <View className="h-1 bg-primary" />
                            <CardContent className="p-4">
                                <View className="flex-row items-center gap-3">
                                    {/* Avatar with status ring */}
                                    <View className="relative">
                                        <View className="h-14 w-14 rounded-full bg-primary/10 items-center justify-center border-2 border-primary">
                                            <WalletIcon size={26} className="text-primary" />
                                        </View>
                                        {/* Online status indicator */}
                                        <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-success border-2 border-card" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-muted-foreground">Your Wallet</Text>
                                        <Text className="text-lg font-semibold text-foreground font-mono">
                                            {formatAddress(smartWalletAddress || walletAddress)}
                                        </Text>
                                    </View>
                                    {/* Copy & QR buttons */}
                                    <View className="flex-row gap-1">
                                        <Pressable
                                            onPress={handleCopyAddress}
                                            className="h-10 w-10 rounded-lg bg-muted items-center justify-center"
                                            accessibilityLabel={copied ? "Address copied" : "Copy address"}
                                        >
                                            {copied ? (
                                                <CheckIcon size={18} className="text-success" />
                                            ) : (
                                                <CopyIcon size={18} className="text-muted-foreground" />
                                            )}
                                        </Pressable>
                                    </View>
                                </View>

                                {/* Balance Display */}
                                <View className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/50">
                                    <View className="flex-row justify-between items-start">
                                        <View>
                                            <Text className="text-xs text-muted-foreground mb-1">Total Balance</Text>
                                            <Text className="text-2xl font-bold text-foreground">$0.00</Text>
                                        </View>
                                        <Badge variant="secondary" className="bg-primary/10">
                                            <Text className="text-xs font-bold text-primary">Level 1</Text>
                                        </Badge>
                                    </View>

                                    {/* Quick Stats Row */}
                                    <View className="flex-row gap-4 mt-3 pt-3 border-t border-border/10">
                                        <View>
                                            <Text className="text-[10px] text-muted-foreground mb-0.5">Transactions</Text>
                                            <View className="flex-row items-center gap-1">
                                                <Text className="font-bold text-sm">24</Text>
                                                <View className="bg-success/20 px-1 py-0.5 rounded text-[8px]">
                                                    <Text className="text-[8px] text-success font-bold">+2</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View>
                                            <Text className="text-[10px] text-muted-foreground mb-0.5">Points</Text>
                                            <Text className="font-bold text-sm">1,250</Text>
                                        </View>
                                        <View className="ml-auto items-end">
                                            <Text className="text-[10px] text-muted-foreground mb-0.5">Last Activity</Text>
                                            <Text className="text-xs font-medium text-muted-foreground">2m ago</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Quick Actions */}
                                <View className="flex-row gap-2 mt-4">
                                    <Button
                                        variant="default"
                                        className="flex-1"
                                        onPress={() => setShowFundWallet(true)}
                                    >
                                        <Text className="font-semibold">Fund Wallet</Text>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onPress={() => router.push('/(tabs)/settings' as any)}
                                    >
                                        <SettingsIcon size={16} className="text-foreground mr-1" />
                                        <Text className="font-medium">Settings</Text>
                                    </Button>
                                </View>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Enhanced Not Connected State */
                        <Card className="overflow-hidden">
                            {/* Gradient header */}
                            <View className="h-24 bg-gradient-to-br from-primary/20 to-transparent items-center justify-center">
                                <View className="h-16 w-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 items-center justify-center">
                                    <WalletIcon size={32} className="text-muted-foreground" />
                                </View>
                            </View>
                            <View className="p-6 items-center">
                                <Text className="text-xl font-bold text-foreground mb-2">Welcome to Kinetic</Text>
                                <Text className="text-muted-foreground text-center mb-6">
                                    Connect your wallet to start earning yield on Movement Network
                                </Text>

                                {/* Benefits list */}
                                <View className="w-full gap-3 mb-6">
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center">
                                            <CheckIcon size={16} className="text-success" />
                                        </View>
                                        <Text className="text-sm text-foreground flex-1">Earn up to 45% APY on your crypto</Text>
                                    </View>
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center">
                                            <CheckIcon size={16} className="text-success" />
                                        </View>
                                        <Text className="text-sm text-foreground flex-1">Secure smart wallet with MFA</Text>
                                    </View>
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-8 w-8 rounded-full bg-success/10 items-center justify-center">
                                            <CheckIcon size={16} className="text-success" />
                                        </View>
                                        <Text className="text-sm text-foreground flex-1">Swap tokens with best rates</Text>
                                    </View>
                                </View>

                                <Button className="w-full h-12" onPress={handleSignIn}>
                                    <LogInIcon size={18} className="text-primary-foreground mr-2" />
                                    <Text className="font-bold text-lg">Get Started</Text>
                                </Button>
                            </View>
                        </Card>
                    )}

                    {/* Portfolio Section */}
                    {isAuthenticated && <PortfolioSection />}

                    {/* Sign Out */}
                    {isAuthenticated && (
                        <Button variant="ghost" className="mt-4" onPress={handleLogout}>
                            <LogOutIcon size={16} className="text-destructive mr-2" />
                            <Text className="text-destructive font-medium">Sign Out</Text>
                        </Button>
                    )}
                </View>
            </ScrollView>

            {/* Fund Wallet Modal */}
            <Modal
                visible={showFundWallet}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFundWallet(false)}
            >
                <View className="flex-1 bg-background p-6">
                    <View className="flex-row justify-end mb-4">
                        <Button variant="ghost" onPress={() => setShowFundWallet(false)}>
                            <Text>Close</Text>
                        </Button>
                    </View>
                    <FundWallet
                        onSuccess={() => setShowFundWallet(false)}
                        onCancel={() => setShowFundWallet(false)}
                    />
                </View>
            </Modal>
        </>
    );
}
