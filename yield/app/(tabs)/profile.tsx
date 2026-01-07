import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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

                    {/* Wallet Summary Card - Clean Single Card */}
                    {isAuthenticated && walletAddress ? (
                        <Card className="bg-card border-border">
                            <CardContent className="p-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                                        <WalletIcon size={24} className="text-primary" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-muted-foreground">Your Wallet</Text>
                                        <Text className="text-lg font-semibold text-foreground font-mono">
                                            {formatAddress(smartWalletAddress || walletAddress)}
                                        </Text>
                                    </View>
                                    <Pressable onPress={handleCopyAddress} className="p-2">
                                        {copied ? (
                                            <CheckIcon size={20} className="text-success" />
                                        ) : (
                                            <CopyIcon size={20} className="text-muted-foreground" />
                                        )}
                                    </Pressable>
                                </View>

                                {/* Quick Actions */}
                                <View className="flex-row gap-2 mt-4">
                                    <Button
                                        variant="default"
                                        className="flex-1"
                                        onPress={() => setShowFundWallet(true)}
                                    >
                                        <Text className="font-medium">Fund Wallet</Text>
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
                        <Card className="p-6 items-center">
                            <WalletIcon size={48} className="text-muted-foreground mb-3" />
                            <Text className="text-lg font-semibold text-foreground mb-1">Not Connected</Text>
                            <Text className="text-muted-foreground text-center mb-4">
                                Sign in to view your positions
                            </Text>
                            <Button className="w-full" onPress={handleSignIn}>
                                <LogInIcon size={18} className="text-primary-foreground mr-2" />
                                <Text className="font-semibold">Sign In</Text>
                            </Button>
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
