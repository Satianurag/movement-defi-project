import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import {
    UserIcon,
    WalletIcon,
    LogOutIcon,
    CopyIcon,
    CheckIcon,
    LogInIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';

export default function ProfileScreen() {
    const { user, isReady, logout } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const [copied, setCopied] = useState(false);

    const isAuthenticated = !!user;
    const wallet = wallets?.[0];
    const walletAddress = wallet?.address;

    const formatAddress = (address?: string) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleCopyAddress = async () => {
        if (walletAddress) {
            await Clipboard.setStringAsync(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
                        <View className="w-full bg-card border border-border rounded-xl p-5 gap-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-muted-foreground font-medium">
                                    Embedded Wallet
                                </Text>
                                <View className="bg-emerald-500/10 px-2 py-1 rounded-full">
                                    <Text className="text-xs text-emerald-500 font-medium">
                                        Active
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-3">
                                <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                                    <WalletIcon size={20} className="text-primary" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-mono font-semibold text-foreground">
                                        {formatAddress(walletAddress)}
                                    </Text>
                                    <Text className="text-xs text-muted-foreground">
                                        Movement Network
                                    </Text>
                                </View>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onPress={handleCopyAddress}
                                >
                                    {copied ? (
                                        <CheckIcon size={18} className="text-emerald-500" />
                                    ) : (
                                        <CopyIcon size={18} className="text-muted-foreground" />
                                    )}
                                </Button>
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
