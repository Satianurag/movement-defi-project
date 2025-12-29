import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { View, ScrollView, Modal, Pressable } from 'react-native';
import {
    SettingsIcon,
    BellIcon,
    ShieldIcon,
    LogOutIcon,
    ChevronRightIcon,
    ShieldCheckIcon,
    KeyIcon,
    WalletIcon,
    PlusIcon,
    CheckCircleIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useWallet } from '@/lib/useWallet';
import { usePrivy } from '@/lib/privy-hooks';
import { MFASetup } from '@/components/security/MFASetup';
import { WalletRecovery } from '@/components/wallet/WalletRecovery';

export default function SettingsScreen() {
    const { user, isAuthenticated, logout } = useWallet();
    const [showMFASetup, setShowMFASetup] = useState(false);
    const [showWalletRecovery, setShowWalletRecovery] = useState(false);

    // Check if MFA is enabled (simplified check)
    const hasMFA = (user as any)?.mfa_methods?.length > 0;

    // Check if recovery is set up
    const hasRecovery = (user as any)?.linked_accounts?.some(
        (acc: any) => acc.type === 'wallet' && acc.recovery_method
    );

    const handleLogout = async () => {
        await logout();
        router.replace('/sign-in' as any);
    };

    return (
        <>
            <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
            <ScrollView className="flex-1 bg-background">
                <View className="p-6 gap-6">
                    {/* Header */}
                    <View className="items-center gap-3">
                        <SettingsIcon size={48} className="text-primary" strokeWidth={1.5} />
                        <Text className="text-2xl font-bold text-foreground">Settings</Text>
                        <Text className="text-muted-foreground text-center">
                            Customize your app experience
                        </Text>
                    </View>

                    {/* Security Section */}
                    {isAuthenticated && (
                        <View className="gap-3">
                            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Security
                            </Text>
                            <Card>
                                {/* MFA Setting */}
                                <Pressable
                                    onPress={() => setShowMFASetup(true)}
                                    className="flex-row items-center justify-between p-4 active:bg-muted"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-emerald-500/10 items-center justify-center">
                                            <ShieldCheckIcon size={20} className="text-emerald-500" />
                                        </View>
                                        <View>
                                            <Text className="font-medium text-foreground">
                                                Multi-Factor Authentication
                                            </Text>
                                            <Text className="text-xs text-muted-foreground">
                                                {hasMFA ? 'Enabled' : 'Add extra security to your account'}
                                            </Text>
                                        </View>
                                    </View>
                                    {hasMFA ? (
                                        <Badge variant="default" className="bg-emerald-500/20">
                                            <CheckCircleIcon size={12} className="text-emerald-500 mr-1" />
                                            <Text className="text-emerald-500 text-xs">On</Text>
                                        </Badge>
                                    ) : (
                                        <ChevronRightIcon size={20} className="text-muted-foreground" />
                                    )}
                                </Pressable>

                                <Separator />

                                {/* Wallet Recovery */}
                                <Pressable
                                    onPress={() => setShowWalletRecovery(true)}
                                    className="flex-row items-center justify-between p-4 active:bg-muted"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                                            <KeyIcon size={20} className="text-primary" />
                                        </View>
                                        <View>
                                            <Text className="font-medium text-foreground">Wallet Recovery</Text>
                                            <Text className="text-xs text-muted-foreground">
                                                {hasRecovery ? 'Configured' : 'Set up backup recovery method'}
                                            </Text>
                                        </View>
                                    </View>
                                    {hasRecovery ? (
                                        <Badge variant="default" className="bg-primary/20">
                                            <CheckCircleIcon size={12} className="text-primary mr-1" />
                                            <Text className="text-primary text-xs">Set</Text>
                                        </Badge>
                                    ) : (
                                        <ChevronRightIcon size={20} className="text-muted-foreground" />
                                    )}
                                </Pressable>
                            </Card>
                        </View>
                    )}

                    {/* Wallet Section */}
                    {isAuthenticated && (
                        <View className="gap-3">
                            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Wallet
                            </Text>
                            <Card>
                                {/* HD Wallets - Create Additional */}
                                <Pressable
                                    onPress={() => {
                                        // TODO: Implement HD wallet creation
                                    }}
                                    className="flex-row items-center justify-between p-4 active:bg-muted"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-amber-500/10 items-center justify-center">
                                            <WalletIcon size={20} className="text-amber-500" />
                                        </View>
                                        <View>
                                            <Text className="font-medium text-foreground">Additional Wallets</Text>
                                            <Text className="text-xs text-muted-foreground">
                                                Create HD wallets under your account
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <PlusIcon size={16} className="text-muted-foreground" />
                                        <ChevronRightIcon size={20} className="text-muted-foreground" />
                                    </View>
                                </Pressable>
                            </Card>
                        </View>
                    )}

                    {/* Preferences Section */}
                    <View className="gap-3">
                        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                            Preferences
                        </Text>
                        <Card>
                            <Pressable className="flex-row items-center justify-between p-4 active:bg-muted">
                                <View className="flex-row items-center gap-3">
                                    <View className="h-10 w-10 rounded-full bg-blue-500/10 items-center justify-center">
                                        <BellIcon size={20} className="text-blue-500" />
                                    </View>
                                    <View>
                                        <Text className="font-medium text-foreground">Notifications</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Manage push notifications
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRightIcon size={20} className="text-muted-foreground" />
                            </Pressable>

                            <Separator />

                            <Pressable className="flex-row items-center justify-between p-4 active:bg-muted">
                                <View className="flex-row items-center gap-3">
                                    <View className="h-10 w-10 rounded-full bg-slate-500/10 items-center justify-center">
                                        <ShieldIcon size={20} className="text-slate-500" />
                                    </View>
                                    <View>
                                        <Text className="font-medium text-foreground">Privacy</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Data and privacy settings
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRightIcon size={20} className="text-muted-foreground" />
                            </Pressable>
                        </Card>
                    </View>

                    {/* Sign Out */}
                    {isAuthenticated && (
                        <Button
                            variant="destructive"
                            className="w-full"
                            onPress={handleLogout}
                        >
                            <LogOutIcon size={18} className="text-white mr-2" />
                            <Text className="text-white font-semibold">Sign Out</Text>
                        </Button>
                    )}

                    {/* App Info */}
                    <View className="items-center gap-1 mt-4">
                        <Text className="text-xs text-muted-foreground">Movement DeFi v1.0.0</Text>
                        <Text className="text-xs text-muted-foreground">Powered by Privy</Text>
                    </View>
                </View>
            </ScrollView>

            {/* MFA Setup Modal */}
            <Modal
                visible={showMFASetup}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowMFASetup(false)}
            >
                <View className="flex-1 bg-background p-6">
                    <View className="flex-row justify-end mb-4">
                        <Button variant="ghost" onPress={() => setShowMFASetup(false)}>
                            <Text>Close</Text>
                        </Button>
                    </View>
                    <MFASetup
                        onEnabled={() => setShowMFASetup(false)}
                        onCancel={() => setShowMFASetup(false)}
                    />
                </View>
            </Modal>

            {/* Wallet Recovery Modal */}
            <Modal
                visible={showWalletRecovery}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowWalletRecovery(false)}
            >
                <View className="flex-1 bg-background p-6">
                    <View className="flex-row justify-end mb-4">
                        <Button variant="ghost" onPress={() => setShowWalletRecovery(false)}>
                            <Text>Close</Text>
                        </Button>
                    </View>
                    <WalletRecovery
                        onSetup={() => setShowWalletRecovery(false)}
                        onCancel={() => setShowWalletRecovery(false)}
                    />
                </View>
            </Modal>
        </>
    );
}
