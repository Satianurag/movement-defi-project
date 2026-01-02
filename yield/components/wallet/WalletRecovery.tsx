import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ShieldCheckIcon,
    CloudIcon,
    KeyIcon,
    CheckCircleIcon,
    LoaderIcon,
    ChevronRightIcon,
    LockIcon,
} from 'lucide-react-native';
import { useSetEmbeddedWalletRecovery, usePrivy } from '@/lib/privy-hooks';
import type { RecoveryMethod } from '@/lib/privy-hooks';

interface WalletRecoveryProps {
    onSetup?: () => void;
    onCancel?: () => void;
}

export function WalletRecovery({ onSetup, onCancel }: WalletRecoveryProps) {
    const { user } = usePrivy();
    const recoveryHook = useSetEmbeddedWalletRecovery();

    const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod | null>(null);
    const [step, setStep] = useState<'select' | 'password' | 'confirm'>('select');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const recoveryMethods: Array<{
        id: RecoveryMethod;
        name: string;
        description: string;
        icon: typeof ShieldCheckIcon;
        color: string;
        bgColor: string;
    }> = [
            {
                id: 'user-passcode',
                name: 'Password',
                description: 'Set a recovery password',
                icon: KeyIcon,
                color: 'text-primary',
                bgColor: 'bg-primary/10',
            },
            {
                id: 'google-drive',
                name: 'Google Drive',
                description: 'Backup to Google account',
                icon: CloudIcon,
                color: 'text-primary',
                bgColor: 'bg-primary/10',
            },
            {
                id: 'icloud',
                name: 'iCloud',
                description: 'Backup to Apple iCloud',
                icon: CloudIcon,
                color: 'text-slate-500',
                bgColor: 'bg-slate-500/10',
            },
        ];

    const handleSetupRecovery = async () => {
        if (!selectedMethod) return;

        setIsLoading(true);
        try {
            if (selectedMethod === 'user-passcode') {
                if (password !== confirmPassword) {
                    Alert.alert('Error', 'Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                if (password.length < 8) {
                    Alert.alert('Error', 'Password must be at least 8 characters');
                    setIsLoading(false);
                    return;
                }
                await recoveryHook.setRecovery({ recoveryMethod: 'user-passcode', password });
            } else if (selectedMethod === 'google-drive') {
                await recoveryHook.setRecovery({ recoveryMethod: 'google-drive' });
            } else if (selectedMethod === 'icloud') {
                await recoveryHook.setRecovery({ recoveryMethod: 'icloud' });
            }

            Alert.alert('Success', 'Wallet recovery has been set up');
            onSetup?.();
        } catch (error) {
            Alert.alert(
                'Setup Error',
                error instanceof Error ? error.message : 'Failed to setup recovery'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <Card className="w-full">
                <CardContent className="items-center justify-center py-8">
                    <Text className="text-muted-foreground text-center">
                        Please sign in to setup wallet recovery
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Wallet Recovery</CardTitle>
                    <Badge variant="outline" className="border-primary/30">
                        <ShieldCheckIcon size={12} className="text-primary mr-1" />
                        <Text className="text-primary text-xs">Security</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Set up a recovery method to restore your wallet on a new device
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {step === 'select' && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Choose Recovery Method
                        </Text>
                        <View className="gap-3">
                            {recoveryMethods.map((method) => (
                                <Button
                                    key={method.id}
                                    variant={selectedMethod === method.id ? 'default' : 'outline'}
                                    className="w-full h-16 justify-start"
                                    onPress={() => setSelectedMethod(method.id)}
                                >
                                    <View className={`h-10 w-10 rounded-full ${method.bgColor} items-center justify-center mr-3`}>
                                        <method.icon size={20} className={method.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-left">{method.name}</Text>
                                        <Text className="text-xs text-muted-foreground text-left">
                                            {method.description}
                                        </Text>
                                    </View>
                                    {selectedMethod === method.id && (
                                        <CheckCircleIcon size={20} className="text-primary" />
                                    )}
                                </Button>
                            ))}
                        </View>
                        <View className="flex-row gap-3 mt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={onCancel}
                            >
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={() => {
                                    if (selectedMethod === 'user-passcode') {
                                        setStep('password');
                                    } else {
                                        handleSetupRecovery();
                                    }
                                }}
                                disabled={!selectedMethod || isLoading}
                            >
                                {isLoading ? (
                                    <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <>
                                        <Text className="font-semibold">Continue</Text>
                                        <ChevronRightIcon size={18} className="text-primary-foreground ml-2" />
                                    </>
                                )}
                            </Button>
                        </View>
                    </>
                )}

                {step === 'password' && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Set Recovery Password
                        </Text>
                        <View className="gap-3">
                            <View className="gap-1">
                                <Text className="text-xs text-muted-foreground ml-1">Password</Text>
                                <Input
                                    placeholder="Enter password (min 8 characters)..."
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                            <View className="gap-1">
                                <Text className="text-xs text-muted-foreground ml-1">Confirm Password</Text>
                                <Input
                                    placeholder="Confirm password..."
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>
                        <View className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                            <View className="flex-row items-center gap-2">
                                <LockIcon size={14} className="text-primary" />
                                <Text className="text-xs text-muted-foreground">
                                    You'll need this password to recover your wallet
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={() => {
                                    setStep('select');
                                    setPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                <Text>Back</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={handleSetupRecovery}
                                disabled={isLoading || !password || !confirmPassword}
                            >
                                {isLoading ? (
                                    <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheckIcon size={18} className="text-primary-foreground mr-2" />
                                        <Text className="font-semibold">Setup Recovery</Text>
                                    </>
                                )}
                            </Button>
                        </View>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default WalletRecovery;
