import React, { useState, useMemo } from 'react';
import { View, Alert, Pressable } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    LinkIcon,
    MailIcon,
    PhoneIcon,
    CheckCircleIcon,
    LoaderIcon,
    WalletIcon,
    UserIcon,
    ArrowRightIcon,
    FingerprintIcon,
} from 'lucide-react-native';
import {
    usePrivy,
    useLinkEmail,
    useLinkSMS,
    useLinkWithOAuth,
    useLinkWithSiwe,
    useLinkWithFarcaster,
} from '@/lib/privy-hooks';
import type { OAuthProvider } from '@/lib/privy-hooks';

interface LinkAccountsProps {
    onAccountLinked?: () => void;
}

type LinkMethod = 'email' | 'phone' | 'oauth' | 'wallet' | 'farcaster' | 'passkey';

export function LinkAccounts({ onAccountLinked }: LinkAccountsProps) {
    const { user } = usePrivy();
    const emailLink = useLinkEmail();
    const smsLink = useLinkSMS();
    const oauthLink = useLinkWithOAuth();
    const siweLink = useLinkWithSiwe();
    const farcasterLink = useLinkWithFarcaster();

    const [activeMethod, setActiveMethod] = useState<LinkMethod | null>(null);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'input' | 'verify'>('input');
    const [isLoading, setIsLoading] = useState(false);

    const linkedAccounts = useMemo(() => user?.linked_accounts || [], [user]);

    const isLinked = (type: string) => {
        return linkedAccounts.some((acc: any) => acc.type === type);
    };

    const oauthProviders: Array<{
        id: OAuthProvider;
        name: string;
        color: string;
        bgColor: string;
    }> = [
            { id: 'twitter', name: 'Twitter/X', color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
            { id: 'discord', name: 'Discord', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
            { id: 'github', name: 'GitHub', color: 'text-slate-600', bgColor: 'bg-slate-600/10' },
            { id: 'google', name: 'Google', color: 'text-red-500', bgColor: 'bg-red-500/10' },
            { id: 'apple', name: 'Apple', color: 'text-slate-900', bgColor: 'bg-slate-900/10' },
        ];

    const handleLinkEmail = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        setIsLoading(true);
        try {
            await emailLink.sendCode({ email: email.trim() });
            setStep('verify');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        setIsLoading(true);
        try {
            await emailLink.linkWithCode({ code: code.trim() });
            Alert.alert('Success', 'Email linked successfully');
            setActiveMethod(null);
            setEmail('');
            setCode('');
            setStep('input');
            onAccountLinked?.();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Invalid code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkPhone = async () => {
        if (!phone.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }
        setIsLoading(true);
        try {
            await smsLink.sendCode({ phone: phone.trim() });
            setStep('verify');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyPhone = async () => {
        setIsLoading(true);
        try {
            await smsLink.linkWithCode({ code: code.trim() });
            Alert.alert('Success', 'Phone linked successfully');
            setActiveMethod(null);
            setPhone('');
            setCode('');
            setStep('input');
            onAccountLinked?.();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Invalid code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkOAuth = async (provider: OAuthProvider) => {
        try {
            await oauthLink.link({ provider });
            Alert.alert('Success', `${provider} account linked successfully`);
            onAccountLinked?.();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to link account');
        }
    };

    const handleLinkWallet = async () => {
        try {
            // Note: SIWE linking requires an external wallet to be connected
            Alert.alert(
                'Link External Wallet',
                'To link an external wallet, you need to connect it first via WalletConnect or a browser extension.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to link wallet');
        }
    };

    const handleLinkFarcaster = async () => {
        try {
            await farcasterLink.linkWithFarcaster({});
            Alert.alert('Success', 'Farcaster account linked successfully');
            onAccountLinked?.();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to link Farcaster');
        }
    };

    if (!user) {
        return (
            <Card className="w-full">
                <CardContent className="items-center justify-center py-8">
                    <Text className="text-muted-foreground text-center">
                        Please sign in to link accounts
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Link Accounts</CardTitle>
                    <Badge variant="outline" className="border-primary/30">
                        <LinkIcon size={12} className="text-primary mr-1" />
                        <Text className="text-primary text-xs">{linkedAccounts.length} Linked</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Connect additional accounts for backup and easier sign-in
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {/* Email Linking */}
                {activeMethod === 'email' ? (
                    <View className="gap-3">
                        <Text className="text-sm font-medium text-muted-foreground">
                            {step === 'input' ? 'Enter Email Address' : 'Enter Verification Code'}
                        </Text>
                        {step === 'input' ? (
                            <>
                                <Input
                                    placeholder="you@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <View className="flex-row gap-3">
                                    <Button variant="outline" className="flex-1" onPress={() => setActiveMethod(null)}>
                                        <Text>Cancel</Text>
                                    </Button>
                                    <Button className="flex-1" onPress={handleLinkEmail} disabled={isLoading}>
                                        {isLoading ? <LoaderIcon size={18} className="animate-spin" /> : <Text className="font-semibold">Send Code</Text>}
                                    </Button>
                                </View>
                            </>
                        ) : (
                            <>
                                <Input
                                    placeholder="123456"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={code}
                                    onChangeText={setCode}
                                    className="text-center tracking-widest"
                                />
                                <View className="flex-row gap-3">
                                    <Button variant="outline" className="flex-1" onPress={() => setStep('input')}>
                                        <Text>Back</Text>
                                    </Button>
                                    <Button className="flex-1" onPress={handleVerifyEmail} disabled={isLoading}>
                                        {isLoading ? <LoaderIcon size={18} className="animate-spin" /> : <Text className="font-semibold">Verify</Text>}
                                    </Button>
                                </View>
                            </>
                        )}
                    </View>
                ) : activeMethod === 'phone' ? (
                    <View className="gap-3">
                        <Text className="text-sm font-medium text-muted-foreground">
                            {step === 'input' ? 'Enter Phone Number' : 'Enter Verification Code'}
                        </Text>
                        {step === 'input' ? (
                            <>
                                <Input
                                    placeholder="+1 (555) 555-5555"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                                <View className="flex-row gap-3">
                                    <Button variant="outline" className="flex-1" onPress={() => setActiveMethod(null)}>
                                        <Text>Cancel</Text>
                                    </Button>
                                    <Button className="flex-1" onPress={handleLinkPhone} disabled={isLoading}>
                                        {isLoading ? <LoaderIcon size={18} className="animate-spin" /> : <Text className="font-semibold">Send Code</Text>}
                                    </Button>
                                </View>
                            </>
                        ) : (
                            <>
                                <Input
                                    placeholder="123456"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={code}
                                    onChangeText={setCode}
                                    className="text-center tracking-widest"
                                />
                                <View className="flex-row gap-3">
                                    <Button variant="outline" className="flex-1" onPress={() => setStep('input')}>
                                        <Text>Back</Text>
                                    </Button>
                                    <Button className="flex-1" onPress={handleVerifyPhone} disabled={isLoading}>
                                        {isLoading ? <LoaderIcon size={18} className="animate-spin" /> : <Text className="font-semibold">Verify</Text>}
                                    </Button>
                                </View>
                            </>
                        )}
                    </View>
                ) : (
                    <>
                        {/* Quick Links */}
                        <View className="gap-2">
                            {!isLinked('email') && (
                                <Pressable
                                    onPress={() => setActiveMethod('email')}
                                    className="flex-row items-center justify-between p-4 rounded-lg border border-border active:bg-muted"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                                            <MailIcon size={20} className="text-primary" />
                                        </View>
                                        <Text className="font-medium">Link Email</Text>
                                    </View>
                                    <ArrowRightIcon size={18} className="text-muted-foreground" />
                                </Pressable>
                            )}

                            {!isLinked('phone') && (
                                <Pressable
                                    onPress={() => setActiveMethod('phone')}
                                    className="flex-row items-center justify-between p-4 rounded-lg border border-border active:bg-muted"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-success/10 items-center justify-center">
                                            <PhoneIcon size={20} className="text-success" />
                                        </View>
                                        <Text className="font-medium">Link Phone</Text>
                                    </View>
                                    <ArrowRightIcon size={18} className="text-muted-foreground" />
                                </Pressable>
                            )}

                            <Pressable
                                onPress={handleLinkWallet}
                                className="flex-row items-center justify-between p-4 rounded-lg border border-border active:bg-muted"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="h-10 w-10 rounded-full bg-amber-500/10 items-center justify-center">
                                        <WalletIcon size={20} className="text-amber-500" />
                                    </View>
                                    <View>
                                        <Text className="font-medium">Link External Wallet</Text>
                                        <Text className="text-xs text-muted-foreground">MetaMask, Rainbow, etc.</Text>
                                    </View>
                                </View>
                                <ArrowRightIcon size={18} className="text-muted-foreground" />
                            </Pressable>

                            {!isLinked('farcaster') && (
                                <Pressable
                                    onPress={handleLinkFarcaster}
                                    className="flex-row items-center justify-between p-4 rounded-lg border border-border active:bg-muted"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-full bg-purple-500/10 items-center justify-center">
                                            <UserIcon size={20} className="text-purple-500" />
                                        </View>
                                        <Text className="font-medium">Link Farcaster</Text>
                                    </View>
                                    <ArrowRightIcon size={18} className="text-muted-foreground" />
                                </Pressable>
                            )}

                            <Pressable
                                onPress={() => Alert.alert('Passkey', 'Use Settings to add a passkey for biometric sign-in')}
                                className="flex-row items-center justify-between p-4 rounded-lg border border-border active:bg-muted"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                                        <FingerprintIcon size={20} className="text-primary" />
                                    </View>
                                    <View>
                                        <Text className="font-medium">Add Passkey</Text>
                                        <Text className="text-xs text-muted-foreground">Biometric sign-in</Text>
                                    </View>
                                </View>
                                <ArrowRightIcon size={18} className="text-muted-foreground" />
                            </Pressable>
                        </View>

                        <Separator />

                        {/* Social OAuth */}
                        <Text className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                            Social Accounts
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {oauthProviders.map((provider) => (
                                <Button
                                    key={provider.id}
                                    variant={isLinked(provider.id) ? 'secondary' : 'outline'}
                                    className="flex-1 min-w-[100px]"
                                    onPress={() => !isLinked(provider.id) && handleLinkOAuth(provider.id)}
                                    disabled={isLinked(provider.id)}
                                >
                                    {isLinked(provider.id) ? (
                                        <CheckCircleIcon size={14} className="text-success mr-1" />
                                    ) : null}
                                    <Text className={isLinked(provider.id) ? 'text-muted-foreground' : ''}>
                                        {provider.name}
                                    </Text>
                                </Button>
                            ))}
                        </View>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default LinkAccounts;
