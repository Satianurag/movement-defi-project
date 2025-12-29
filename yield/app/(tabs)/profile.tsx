import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { View, Pressable, ScrollView, Modal } from 'react-native';
import {
    UserIcon,
    WalletIcon,
    LogOutIcon,
    CopyIcon,
    CheckIcon,
    LogInIcon,
    ShieldCheckIcon,
    LinkIcon,
    DollarSignIcon,
    KeyIcon,
    ChevronRightIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useWallet } from '@/lib/useWallet';
import { usePrivy } from '@/lib/privy-hooks';
import { FundWallet } from '@/components/wallet/FundWallet';
import { ExportWallet } from '@/components/wallet/ExportWallet';
import { LinkAccounts } from '@/components/account/LinkAccounts';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
    const { user, isReady, logout, address: walletAddress, smartWalletAddress, isAuthenticated, isSmartWalletReady } = useWallet();
    const [copied, setCopied] = useState<string | null>(null);
    const [showFundWallet, setShowFundWallet] = useState(false);
    const [showExportWallet, setShowExportWallet] = useState(false);
    const [showLinkAccounts, setShowLinkAccounts] = useState(false);

    const linkedAccounts = useMemo(() => (user as any)?.linked_accounts || [], [user]);
    const linkedCount = linkedAccounts.length;

    const formatAddress = (address?: string) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleCopyAddress = async (addr: string, type: 'embedded' | 'smart') => {
        if (addr) {
            await Clipboard.setStringAsync(addr);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const handleSignIn = () => {
        router.push('/sign-in' as any);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/sign-in' as any);
    };

    if (!isReady) {
        return (
            <>
                <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
                <View className="flex-1 bg-background items-center justify-center">
                    <Text className="text-muted-foreground">Loading...</Text>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
            <ScrollView className="flex-1 bg-background">
                <View className="p-6 gap-6">
                    {/* Avatar & Status */}
                    <View className="items-center gap-3">
                        <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center border-2 border-primary/20">
                            {isAuthenticated ? (
                                <WalletIcon size={48} className="text-primary" strokeWidth={1.5} />
                            ) : (
                                <UserIcon size={48} className="text-muted-foreground" strokeWidth={1.5} />
                            )}
                        </View>

                        {isAuthenticated ? (
                            <>
                                <Text className="text-2xl font-bold text-foreground">Connected</Text>
                                {(user as any)?.email?.address && (
                                    <Text className="text-muted-foreground">{(user as any).email.address}</Text>
                                )}
                            </>
                        ) : (
                            <>
                                <Text className="text-2xl font-bold text-foreground">Not Connected</Text>
                                <Text className="text-muted-foreground text-center">
                                    Sign in to view your positions and earn rewards
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Wallet Card */}
                    {isAuthenticated && walletAddress && (
                        <>
                            {/* Quick Actions */}
                            <View className="flex-row gap-3">
                                <Button
                                    variant="default"
                                    className="flex-1 h-14"
                                    onPress={() => setShowFundWallet(true)}
                                >
                                    <DollarSignIcon size={18} className="text-primary-foreground mr-2" />
                                    <Text className="font-semibold">Fund Wallet</Text>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14"
                                    onPress={() => setShowLinkAccounts(true)}
                                >
                                    <LinkIcon size={18} className="text-foreground mr-2" />
                                    <Text className="font-semibold">Link Accounts</Text>
                                </Button>
                            </View>

                            {/* Embedded Wallet */}
                            <Card className="w-full">
                                <CardHeader className="flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Embedded Wallet
                                    </CardTitle>
                                    <Badge variant="default" className="bg-emerald-500/20 border-emerald-500/30">
                                        <Text className="text-emerald-500 text-xs">Active</Text>
                                    </Badge>
                                </CardHeader>
                                <CardContent className="gap-3">
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                                            <WalletIcon size={20} className="text-primary" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-lg font-mono font-semibold text-foreground">
                                                {formatAddress(walletAddress)}
                                            </Text>
                                            <Text className="text-xs text-muted-foreground">Signer Account</Text>
                                        </View>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onPress={() => handleCopyAddress(walletAddress, 'embedded')}
                                        >
                                            {copied === 'embedded' ? (
                                                <CheckIcon size={18} className="text-emerald-500" />
                                            ) : (
                                                <CopyIcon size={18} className="text-muted-foreground" />
                                            )}
                                        </Button>
                                    </View>
                                    <Separator />
                                    <Pressable
                                        onPress={() => setShowExportWallet(true)}
                                        className="flex-row items-center justify-between py-2 active:opacity-70"
                                    >
                                        <View className="flex-row items-center gap-2">
                                            <KeyIcon size={16} className="text-muted-foreground" />
                                            <Text className="text-sm text-muted-foreground">Export Private Key</Text>
                                        </View>
                                        <ChevronRightIcon size={16} className="text-muted-foreground" />
                                    </Pressable>
                                </CardContent>
                            </Card>

                            {/* Smart Wallet */}
                            {smartWalletAddress && (
                                <Card className="w-full bg-primary/5 border-primary/20">
                                    <CardHeader className="flex-row items-center justify-between pb-2">
                                        <View className="flex-row items-center gap-2">
                                            <ShieldCheckIcon size={14} className="text-primary" />
                                            <CardTitle className="text-sm text-primary font-bold uppercase tracking-widest">
                                                Smart Wallet (AA)
                                            </CardTitle>
                                        </View>
                                        {isSmartWalletReady && (
                                            <Badge variant="default" className="bg-primary/10">
                                                <Text className="text-primary text-[10px]">GASLESS READY</Text>
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <View className="flex-row items-center gap-3">
                                            <View className="h-10 w-10 rounded-full bg-primary/20 items-center justify-center">
                                                <ShieldCheckIcon size={20} className="text-primary" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-lg font-mono font-semibold text-foreground">
                                                    {formatAddress(smartWalletAddress)}
                                                </Text>
                                                <Text className="text-xs text-muted-foreground">Movement Smart Account</Text>
                                            </View>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onPress={() => handleCopyAddress(smartWalletAddress, 'smart')}
                                            >
                                                {copied === 'smart' ? (
                                                    <CheckIcon size={18} className="text-emerald-500" />
                                                ) : (
                                                    <CopyIcon size={18} className="text-muted-foreground" />
                                                )}
                                            </Button>
                                        </View>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Linked Accounts Summary */}
                            <Pressable onPress={() => setShowLinkAccounts(true)}>
                                <Card className="w-full">
                                    <CardContent className="flex-row items-center justify-between py-4">
                                        <View className="flex-row items-center gap-3">
                                            <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                                                <LinkIcon size={20} className="text-primary" />
                                            </View>
                                            <View>
                                                <Text className="font-semibold text-foreground">Linked Accounts</Text>
                                                <Text className="text-xs text-muted-foreground">
                                                    {linkedCount} account{linkedCount !== 1 ? 's' : ''} connected
                                                </Text>
                                            </View>
                                        </View>
                                        <ChevronRightIcon size={20} className="text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Pressable>
                        </>
                    )}

                    {/* Actions */}
                    <View className="gap-3">
                        {isAuthenticated ? (
                            <Button
                                variant="destructive"
                                className="w-full"
                                onPress={handleLogout}
                            >
                                <LogOutIcon size={18} className="text-white mr-2" />
                                <Text className="text-white font-semibold">Sign Out</Text>
                            </Button>
                        ) : (
                            <Button className="w-full h-14" onPress={handleSignIn}>
                                <LogInIcon size={18} className="text-primary-foreground mr-2" />
                                <Text className="font-semibold">Sign In</Text>
                            </Button>
                        )}
                    </View>
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

            {/* Export Wallet Modal */}
            <Modal
                visible={showExportWallet}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowExportWallet(false)}
            >
                <View className="flex-1 bg-background p-6">
                    <View className="flex-row justify-end mb-4">
                        <Button variant="ghost" onPress={() => setShowExportWallet(false)}>
                            <Text>Close</Text>
                        </Button>
                    </View>
                    <ExportWallet
                        onExported={() => { }}
                        onCancel={() => setShowExportWallet(false)}
                    />
                </View>
            </Modal>

            {/* Link Accounts Modal */}
            <Modal
                visible={showLinkAccounts}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowLinkAccounts(false)}
            >
                <View className="flex-1 bg-background p-6">
                    <View className="flex-row justify-end mb-4">
                        <Button variant="ghost" onPress={() => setShowLinkAccounts(false)}>
                            <Text>Close</Text>
                        </Button>
                    </View>
                    <ScrollView>
                        <LinkAccounts onAccountLinked={() => { }} />
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
}
