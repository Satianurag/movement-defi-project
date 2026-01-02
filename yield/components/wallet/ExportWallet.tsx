import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Clipboard from 'expo-clipboard';
import {
    KeyIcon,
    AlertTriangleIcon,
    EyeIcon,
    EyeOffIcon,
    CopyIcon,
    CheckIcon,
    ShieldAlertIcon,
    LoaderIcon,
} from 'lucide-react-native';
import { usePrivy, useEmbeddedEthereumWallet } from '@/lib/privy-hooks';

interface ExportWalletProps {
    onExported?: () => void;
    onCancel?: () => void;
}

export function ExportWallet({ onExported, onCancel }: ExportWalletProps) {
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets?.[0];

    const [step, setStep] = useState<'warning' | 'confirm' | 'display'>('warning');
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        if (!wallet) return;

        setIsLoading(true);
        try {
            // Privy Expo SDK currently does not expose exportWallet method
            // This is a known limitation - the feature requires Privy dashboard configuration
            // and may only be available on web or with specific SDK versions

            // Check if exportWallet method exists on the wallet
            const walletAny = wallet as any;

            if (typeof walletAny.export === 'function' || typeof walletAny.exportWallet === 'function') {
                // If export method exists, attempt to use it
                const exportMethod = walletAny.export || walletAny.exportWallet;
                const result = await exportMethod();

                if (result && result.privateKey) {
                    setPrivateKey(result.privateKey);
                    setStep('display');
                    onExported?.();
                } else {
                    throw new Error('Export returned no private key');
                }
            } else {
                // Export not available - show clear message
                Alert.alert(
                    'Feature Not Available',
                    'Private key export is not currently supported in this version of the app. This feature requires specific Privy configuration and may only be available on web platforms.',
                    [{ text: 'OK', onPress: onCancel }]
                );
            }
        } catch (error) {
            Alert.alert(
                'Export Error',
                error instanceof Error ? error.message : 'Failed to export wallet. This feature may not be available in your configuration.'
            );
        } finally {
            setIsLoading(false);
        }
    };


    const handleCopy = async () => {
        if (privateKey) {
            await Clipboard.setStringAsync(privateKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!user || !wallet) {
        return (
            <Card className="w-full">
                <CardContent className="items-center justify-center py-8">
                    <Text className="text-muted-foreground text-center">
                        Please sign in to export your wallet
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Export Wallet</CardTitle>
                    <Badge variant="destructive" className="bg-destructive/20">
                        <ShieldAlertIcon size={12} className="text-destructive mr-1" />
                        <Text className="text-destructive text-xs">Sensitive</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Export your private key for backup
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {step === 'warning' && (
                    <>
                        {/* Security Warning */}
                        <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <View className="flex-row items-center gap-2 mb-2">
                                <AlertTriangleIcon size={20} className="text-destructive" />
                                <Text className="font-bold text-destructive">Security Warning</Text>
                            </View>
                            <Text className="text-sm text-muted-foreground">
                                Your private key gives full access to your wallet funds.{'\n\n'}
                                • Never share it with anyone{'\n'}
                                • Never enter it on websites{'\n'}
                                • Store it securely offline
                            </Text>
                        </View>

                        {/* Wallet Info */}
                        <View className="bg-muted rounded-lg p-3">
                            <Text className="text-xs text-muted-foreground mb-1">Wallet Address</Text>
                            <Text className="font-mono text-sm" numberOfLines={1}>
                                {wallet.address}
                            </Text>
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={onCancel}
                            >
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onPress={() => setStep('confirm')}
                            >
                                <Text className="text-white font-semibold">I Understand</Text>
                            </Button>
                        </View>
                    </>
                )}

                {step === 'confirm' && (
                    <>
                        <View className="items-center py-4">
                            <View className="h-16 w-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
                                <KeyIcon size={32} className="text-destructive" />
                            </View>
                            <Text className="text-lg font-bold text-center mb-2">
                                Confirm Export
                            </Text>
                            <Text className="text-muted-foreground text-center text-sm">
                                Are you sure you want to reveal your private key?
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={() => setStep('warning')}
                            >
                                <Text>Back</Text>
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onPress={handleExport}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoaderIcon size={18} className="text-white animate-spin" />
                                ) : (
                                    <>
                                        <KeyIcon size={16} className="text-white mr-2" />
                                        <Text className="text-white font-semibold">Export Key</Text>
                                    </>
                                )}
                            </Button>
                        </View>
                    </>
                )}

                {step === 'display' && privateKey && (
                    <>
                        <View className="bg-muted rounded-lg p-4">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Private Key
                                </Text>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onPress={() => setShowKey(!showKey)}
                                >
                                    {showKey ? (
                                        <EyeOffIcon size={16} className="text-muted-foreground" />
                                    ) : (
                                        <EyeIcon size={16} className="text-muted-foreground" />
                                    )}
                                </Button>
                            </View>
                            <Text
                                className="font-mono text-sm break-all"
                                selectable
                            >
                                {showKey ? privateKey : '•'.repeat(64)}
                            </Text>
                        </View>

                        <Button
                            variant="outline"
                            className="w-full"
                            onPress={handleCopy}
                        >
                            {copied ? (
                                <>
                                    <CheckIcon size={16} className="text-emerald-500 mr-2" />
                                    <Text className="text-emerald-500">Copied!</Text>
                                </>
                            ) : (
                                <>
                                    <CopyIcon size={16} className="text-foreground mr-2" />
                                    <Text>Copy to Clipboard</Text>
                                </>
                            )}
                        </Button>

                        <Button
                            variant="default"
                            className="w-full"
                            onPress={onCancel}
                        >
                            <Text className="font-semibold">Done</Text>
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default ExportWallet;
