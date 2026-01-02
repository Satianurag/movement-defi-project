import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    ShieldIcon,
    SmartphoneIcon,
    KeyIcon,
    FingerprintIcon,
    CheckCircleIcon,
    LoaderIcon,
    ChevronRightIcon,
    ShieldCheckIcon,
} from 'lucide-react-native';
import { useMfaEnrollment, usePrivy } from '@/lib/privy-hooks';
import type { MfaMethod } from '@/lib/privy-hooks';

interface MFASetupProps {
    onEnabled?: () => void;
    onCancel?: () => void;
}

export function MFASetup({ onEnabled, onCancel }: MFASetupProps) {
    const { user } = usePrivy();
    const mfa = useMfaEnrollment();

    const [selectedMethod, setSelectedMethod] = useState<MfaMethod | null>(null);
    const [step, setStep] = useState<'select' | 'phone' | 'verify' | 'totp'>('select');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [totpSecret, setTotpSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const mfaMethods: Array<{
        id: MfaMethod;
        name: string;
        description: string;
        icon: typeof ShieldIcon;
        color: string;
        bgColor: string;
    }> = [
            {
                id: 'sms',
                name: 'SMS Verification',
                description: 'Receive codes via text message',
                icon: SmartphoneIcon,
                color: 'text-primary',
                bgColor: 'bg-primary/10',
            },
            {
                id: 'totp',
                name: 'Authenticator App',
                description: 'Google Authenticator, Authy, etc.',
                icon: KeyIcon,
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
            },
            {
                id: 'passkey',
                name: 'Passkey',
                description: 'Biometric or hardware key',
                icon: FingerprintIcon,
                color: 'text-success',
                bgColor: 'bg-success/10',
            },
        ];

    const handleEnrollSms = async () => {
        if (!phoneNumber) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }
        setIsLoading(true);
        try {
            await mfa.initMfaEnrollment({ method: 'sms', phoneNumber });
            setStep('verify');
        } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to send verification code'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySms = async () => {
        if (!verificationCode) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }
        setIsLoading(true);
        try {
            // submitMfaEnrollment for SMS requires phoneNumber along with code
            await mfa.submitMfaEnrollment({ method: 'sms', code: verificationCode, phoneNumber });
            Alert.alert('Success', 'MFA has been enabled');
            onEnabled?.();
        } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Invalid verification code'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnrollTotp = async () => {
        setIsLoading(true);
        try {
            const result = await mfa.initMfaEnrollment({ method: 'totp' });
            if (result?.secret) {
                setTotpSecret(result.secret);
                setStep('totp');
            }
        } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to setup authenticator'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyTotp = async () => {
        if (!verificationCode) {
            Alert.alert('Error', 'Please enter the code from your authenticator app');
            return;
        }
        setIsLoading(true);
        try {
            await mfa.submitMfaEnrollment({ method: 'totp', code: verificationCode });
            Alert.alert('Success', 'MFA has been enabled');
            onEnabled?.();
        } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Invalid code'
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
                        Please sign in to setup MFA
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Multi-Factor Authentication</CardTitle>
                    <Badge variant="outline" className="border-success/30">
                        <ShieldCheckIcon size={12} className="text-success mr-1" />
                        <Text className="text-success text-xs">Security</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Add an extra layer of security to your account
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {step === 'select' && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Choose MFA Method
                        </Text>
                        <View className="gap-3">
                            {mfaMethods.map((method) => (
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
                                    if (selectedMethod === 'sms') {
                                        setStep('phone');
                                    } else if (selectedMethod === 'totp') {
                                        handleEnrollTotp();
                                    } else if (selectedMethod === 'passkey') {
                                        Alert.alert('Passkey MFA', 'Passkey MFA is configured automatically when you add a passkey to your account.');
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

                {step === 'phone' && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Enter Phone Number
                        </Text>
                        <Input
                            placeholder="+1 (555) 555-5555"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                        <View className="flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={() => setStep('select')}
                            >
                                <Text>Back</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={handleEnrollSms}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <Text className="font-semibold">Send Code</Text>
                                )}
                            </Button>
                        </View>
                    </>
                )}

                {step === 'verify' && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Enter Verification Code
                        </Text>
                        <Input
                            placeholder="123456"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            className="text-center tracking-widest text-xl"
                        />
                        <Text className="text-xs text-muted-foreground text-center">
                            We sent a 6-digit code to {phoneNumber}
                        </Text>
                        <View className="flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={() => {
                                    setStep('phone');
                                    setVerificationCode('');
                                }}
                            >
                                <Text>Back</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={handleVerifySms}
                                disabled={isLoading || verificationCode.length !== 6}
                            >
                                {isLoading ? (
                                    <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <Text className="font-semibold">Verify</Text>
                                )}
                            </Button>
                        </View>
                    </>
                )}

                {step === 'totp' && totpSecret && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Setup Authenticator
                        </Text>
                        <View className="bg-muted rounded-lg p-4">
                            <Text className="text-xs text-muted-foreground mb-2">
                                Enter this secret key in your authenticator app:
                            </Text>
                            <Text className="font-mono text-sm text-foreground text-center" selectable>
                                {totpSecret}
                            </Text>
                        </View>
                        <Separator />
                        <Input
                            placeholder="Enter 6-digit code"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            className="text-center tracking-widest text-xl"
                        />
                        <View className="flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={() => {
                                    setStep('select');
                                    setVerificationCode('');
                                    setTotpSecret(null);
                                }}
                            >
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={handleVerifyTotp}
                                disabled={isLoading || verificationCode.length !== 6}
                            >
                                {isLoading ? (
                                    <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <Text className="font-semibold">Enable MFA</Text>
                                )}
                            </Button>
                        </View>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default MFASetup;
