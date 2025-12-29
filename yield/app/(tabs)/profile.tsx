import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { View, Pressable } from 'react-native';
import {
    UserIcon,
    WalletIcon,
    LogOutIcon,
    CopyIcon,
    CheckIcon,
    LogInIcon,
    ShieldCheckIcon,
    LinkIcon,
    MailIcon,
    ArrowRightIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useWallet } from '@/lib/useWallet';
import { useLinkWithOAuth } from '@privy-io/expo';
import { cn } from '@/lib/utils';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
    const {
        user,
        isReady,
        logout,
        address: walletAddress,
        smartWalletAddress,
        isAuthenticated,
        isSmartWalletReady
    } = useWallet();
    const { link } = useLinkWithOAuth();
    const [copied, setCopied] = useState<string | null>(null);

    const linkedAccounts = useMemo(() => user?.linked_accounts || [], [user]);
    const socialAccounts = linkedAccounts.filter(acc => ['google', 'apple', 'twitter', 'discord', 'github'].includes(acc.type));

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
            <View className="flex-1 bg-background p-6">
                <View className="items-center justify-center flex-1 gap-6">
                    {/* Avatar */}
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
                                <Text className="text-2xl font-bold text-foreground">
                                    Connected
                                </Text>
                                {(user as any)?.email?.address && (
                                    <Text className="text-muted-foreground">
                                        {(user as any).email.address}
                                    </Text>
                                )}
                            </>
                        ) : (
                            <>
                                <Text className="text-2xl font-bold text-foreground">
                                    Not Connected
                                </Text>
                                <Text className="text-muted-foreground text-center">
                                    Sign in to view your positions and earn rewards
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Wallet Card */}
                    {isAuthenticated && walletAddress && (
                        <View className="w-full gap-4">
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
                                            <Text className="text-xs text-muted-foreground">
                                                Signer Account
                                            </Text>
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
                                </CardContent>
                            </Card>

                            {/* Smart Wallet (AA) */}
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
                                                <Text className="text-xs text-muted-foreground">
                                                    Movement Smart Account
                                                </Text>
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

                            {/* Linked Accounts */}
                            <View className="w-full mt-2">
                                <Text className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-3 ml-1">
                                    Linked Accounts
                                </Text>
                                <Card className="overflow-hidden">
                                    {socialAccounts.map((acc, i) => (
                                        <React.Fragment key={acc.type}>
                                            {i > 0 && <Separator />}
                                            <View className="flex-row items-center justify-between p-4">
                                                <View className="flex-row items-center gap-3">
                                                    <View className="h-8 w-8 rounded-full bg-muted items-center justify-center">
                                                        <UserIcon size={16} className="text-muted-foreground" />
                                                    </View>
                                                    <View>
                                                        <Text className="text-sm font-medium text-foreground capitalize">
                                                            {acc.type}
                                                        </Text>
                                                        <Text className="text-xs text-muted-foreground">
                                                            Linked
                                                        </Text>
                                                    </View>
                                                </View>
                                                <CheckIcon size={16} className="text-emerald-500" />
                                            </View>
                                        </React.Fragment>
                                    ))}

                                    {!socialAccounts.some((a: any) => a.type === 'google') && (
                                        <>
                                            {socialAccounts.length > 0 && <Separator />}
                                            <Pressable
                                                onPress={() => link({ provider: 'google' })}
                                                className="flex-row items-center justify-between p-4 active:bg-muted"
                                            >
                                                <View className="flex-row items-center gap-3">
                                                    <View className="h-8 w-8 rounded-full bg-muted items-center justify-center">
                                                        <LinkIcon size={16} className="text-muted-foreground" />
                                                    </View>
                                                    <Text className="text-sm font-medium text-foreground">Link Google</Text>
                                                </View>
                                                <ArrowRightIcon size={16} className="text-muted-foreground" />
                                            </Pressable>
                                        </>
                                    )}
                                </Card>
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <View className="w-full gap-3 mt-4">
                        {isAuthenticated ? (
                            <Button
                                variant="destructive"
                                className="w-full"
                                onPress={handleLogout}
                            >
                                <LogOutIcon size={18} className="text-white" />
                                <Text className="text-white font-semibold">Sign Out</Text>
                            </Button>
                        ) : (
                            <Button className="w-full h-14" onPress={handleSignIn}>
                                <LogInIcon size={18} className="text-primary-foreground" />
                                <Text className="font-semibold">Sign In</Text>
                            </Button>
                        )}
                    </View>
                </View>
            </View>
        </>
    );
}
