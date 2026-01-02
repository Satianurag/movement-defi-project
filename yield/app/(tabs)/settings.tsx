import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { View, ScrollView, Modal, Pressable, Alert } from 'react-native';
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
    ArchiveIcon,
    MoonIcon,
    SunIcon,
    LoaderIcon,
    BellRingIcon,
    BellOffIcon,
    EyeIcon,
    EyeOffIcon,
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import { useWallet } from '@/lib/useWallet';
import { usePrivy } from '@/lib/privy-hooks';
import { useColorScheme } from 'nativewind';
import { Switch } from 'react-native';
import { WalletRecovery } from '@/components/wallet/WalletRecovery';
import { MFASetup } from '@/components/wallet/MFASetup';
import { useToast } from '@/context/ToastContext';

export default function SettingsScreen() {
    const { user, isAuthenticated, logout } = useWallet();
    const { walletCount, createAdditionalWallet } = useWallet();
    const { showToast } = useToast();
    const [showMFASetup, setShowMFASetup] = useState(false);
    const [showWalletRecovery, setShowWalletRecovery] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);
    const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();

    // Notification preferences (would persist to storage in production)
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
    const [apyAlerts, setApyAlerts] = useState(true);
    const [transactionAlerts, setTransactionAlerts] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);

    // Privacy preferences
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
    const [crashReportsEnabled, setCrashReportsEnabled] = useState(true);

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

    const handleCreateAdditionalWallet = async () => {
        Alert.alert(
            'Create Additional Wallet',
            'This will create a new HD wallet under your account. The new wallet will share the same recovery method as your primary wallet.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create',
                    onPress: async () => {
                        setIsCreatingWallet(true);
                        try {
                            const newAddress = await createAdditionalWallet();
                            if (newAddress) {
                                showToast(
                                    `New wallet created: ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
                                    'success',
                                    'Wallet Created'
                                );
                            }
                        } catch (error) {
                            showToast(
                                error instanceof Error ? error.message : 'Failed to create wallet',
                                'error',
                                'Error'
                            );
                        } finally {
                            setIsCreatingWallet(false);
                        }
                    }
                }
            ]
        );
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

                    {/* Appearance Section */}
                    <View className="gap-3">
                        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                            Appearance
                        </Text>
                        <Card>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="h-10 w-10 rounded-full bg-slate-500/10 items-center justify-center">
                                        {colorScheme === 'dark' ? (
                                            <MoonIcon size={20} className="text-slate-500" />
                                        ) : (
                                            <SunIcon size={20} className="text-slate-500" />
                                        )}
                                    </View>
                                    <View>
                                        <Text className="font-medium text-foreground">Dark Mode</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            {colorScheme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={colorScheme === 'dark'}
                                    onValueChange={toggleColorScheme}
                                    trackColor={{ false: '#767577', true: '#3b82f6' }}
                                    thumbColor={colorScheme === 'dark' ? '#ffffff' : '#f4f3f4'}
                                    testID="settings-dark-mode-toggle"
                                />
                            </View>
                        </Card>
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
                                    testID="settings-mfa-button"
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
                                    testID="settings-recovery-button"
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
                                    onPress={handleCreateAdditionalWallet}
                                    disabled={isCreatingWallet}
                                    className="flex-row items-center justify-between p-4 active:bg-muted"
                                    testID="settings-create-wallet-button"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-amber-500/10 items-center justify-center">
                                            <WalletIcon size={20} className="text-amber-500" />
                                        </View>
                                        <View>
                                            <Text className="font-medium text-foreground">Additional Wallets</Text>
                                            <Text className="text-xs text-muted-foreground">
                                                {walletCount > 1
                                                    ? `${walletCount} HD wallets created`
                                                    : 'Create HD wallets under your account'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        {isCreatingWallet ? (
                                            <LoaderIcon size={16} className="text-muted-foreground animate-spin" />
                                        ) : (
                                            <PlusIcon size={16} className="text-muted-foreground" />
                                        )}
                                        <ChevronRightIcon size={20} className="text-muted-foreground" />
                                    </View>
                                </Pressable>

                                <Separator />

                                {/* Transaction History */}
                                <Pressable
                                    onPress={() => router.push('/history' as any)}
                                    className="flex-row items-center justify-between p-4 active:bg-muted"
                                    testID="settings-history-button"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-blue-500/10 items-center justify-center">
                                            <ArchiveIcon size={20} className="text-blue-500" />
                                        </View>
                                        <View>
                                            <Text className="font-medium text-foreground">Transaction History</Text>
                                            <Text className="text-xs text-muted-foreground">
                                                View your past transactions
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRightIcon size={20} className="text-muted-foreground" />
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
                            <Pressable
                                onPress={() => setShowNotificationsModal(true)}
                                className="flex-row items-center justify-between p-4 active:bg-muted"
                                testID="settings-notifications-button"
                            >
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

                            <Pressable
                                onPress={() => setShowPrivacyModal(true)}
                                className="flex-row items-center justify-between p-4 active:bg-muted"
                                testID="settings-privacy-button"
                            >
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
                            testID="settings-logout-button"
                        >
                            <LogOutIcon size={18} className="text-white mr-2" />
                            <Text className="text-white font-semibold">Sign Out</Text>
                        </Button>
                    )}

                    {/* App Info */}
                    <View className="items-center gap-1 mt-4">
                        <Text className="text-xs text-muted-foreground">Kinetic v1.0.0</Text>
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

            {/* Notifications Settings Modal */}
            <Modal
                visible={showNotificationsModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowNotificationsModal(false)}
            >
                <View className="flex-1 bg-background p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center gap-2">
                            <BellIcon size={24} className="text-primary" />
                            <Text className="text-xl font-bold text-foreground">Notifications</Text>
                        </View>
                        <Button variant="ghost" onPress={() => setShowNotificationsModal(false)}>
                            <Text>Done</Text>
                        </Button>
                    </View>

                    <View className="gap-4">
                        <Card>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="h-10 w-10 rounded-full bg-blue-500/10 items-center justify-center">
                                        {pushNotificationsEnabled ? (
                                            <BellRingIcon size={20} className="text-blue-500" />
                                        ) : (
                                            <BellOffIcon size={20} className="text-muted-foreground" />
                                        )}
                                    </View>
                                    <View>
                                        <Text className="font-medium text-foreground">Push Notifications</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Receive notifications on your device
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={pushNotificationsEnabled}
                                    onValueChange={setPushNotificationsEnabled}
                                    trackColor={{ false: '#767577', true: '#3b82f6' }}
                                    thumbColor={pushNotificationsEnabled ? '#ffffff' : '#f4f3f4'}
                                    testID="notifications-push-toggle"
                                />
                            </View>
                        </Card>

                        {pushNotificationsEnabled && (
                            <Card>
                                <View className="flex-row items-center justify-between p-4">
                                    <View>
                                        <Text className="font-medium text-foreground">APY Change Alerts</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Alert when pool APY changes significantly
                                        </Text>
                                    </View>
                                    <Switch
                                        value={apyAlerts}
                                        onValueChange={setApyAlerts}
                                        trackColor={{ false: '#767577', true: '#10B981' }}
                                        thumbColor={apyAlerts ? '#ffffff' : '#f4f3f4'}
                                    />
                                </View>

                                <Separator />

                                <View className="flex-row items-center justify-between p-4">
                                    <View>
                                        <Text className="font-medium text-foreground">Transaction Alerts</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Notify when transactions complete
                                        </Text>
                                    </View>
                                    <Switch
                                        value={transactionAlerts}
                                        onValueChange={setTransactionAlerts}
                                        trackColor={{ false: '#767577', true: '#10B981' }}
                                        thumbColor={transactionAlerts ? '#ffffff' : '#f4f3f4'}
                                    />
                                </View>

                                <Separator />

                                <View className="flex-row items-center justify-between p-4">
                                    <View>
                                        <Text className="font-medium text-foreground">Weekly Digest</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Weekly summary of your portfolio
                                        </Text>
                                    </View>
                                    <Switch
                                        value={weeklyDigest}
                                        onValueChange={setWeeklyDigest}
                                        trackColor={{ false: '#767577', true: '#10B981' }}
                                        thumbColor={weeklyDigest ? '#ffffff' : '#f4f3f4'}
                                    />
                                </View>
                            </Card>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Privacy Settings Modal */}
            <Modal
                visible={showPrivacyModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowPrivacyModal(false)}
            >
                <View className="flex-1 bg-background p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center gap-2">
                            <ShieldIcon size={24} className="text-primary" />
                            <Text className="text-xl font-bold text-foreground">Privacy</Text>
                        </View>
                        <Button variant="ghost" onPress={() => setShowPrivacyModal(false)}>
                            <Text>Done</Text>
                        </Button>
                    </View>

                    <View className="gap-4">
                        <Card>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="h-10 w-10 rounded-full bg-purple-500/10 items-center justify-center">
                                        {analyticsEnabled ? (
                                            <EyeIcon size={20} className="text-purple-500" />
                                        ) : (
                                            <EyeOffIcon size={20} className="text-muted-foreground" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-medium text-foreground">Analytics</Text>
                                        <Text className="text-xs text-muted-foreground">
                                            Help improve the app with anonymous usage data
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={analyticsEnabled}
                                    onValueChange={setAnalyticsEnabled}
                                    trackColor={{ false: '#767577', true: '#8B5CF6' }}
                                    thumbColor={analyticsEnabled ? '#ffffff' : '#f4f3f4'}
                                    testID="privacy-analytics-toggle"
                                />
                            </View>

                            <Separator />

                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-1">
                                    <Text className="font-medium text-foreground">Crash Reports</Text>
                                    <Text className="text-xs text-muted-foreground">
                                        Automatically send crash reports to help fix bugs
                                    </Text>
                                </View>
                                <Switch
                                    value={crashReportsEnabled}
                                    onValueChange={setCrashReportsEnabled}
                                    trackColor={{ false: '#767577', true: '#8B5CF6' }}
                                    thumbColor={crashReportsEnabled ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </Card>

                        <View className="bg-muted/50 rounded-lg p-4 mt-2">
                            <Text className="text-sm text-muted-foreground">
                                Your data is stored securely and never shared with third parties.
                                Wallet addresses and transaction data remain on your device.
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
