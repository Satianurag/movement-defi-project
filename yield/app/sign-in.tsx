import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    useLoginWithEmail,
    useLoginWithSMS,
    useLoginWithOAuth,
    usePrivy
} from '@/lib/privy-hooks';
import { useLoginWithPasskey } from '@privy-io/expo/passkey';
import { router } from 'expo-router';
import {
    MailIcon,
    PhoneIcon,
    WalletIcon,
    ArrowRightIcon,
    LoaderIcon,
    FingerprintIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';

type AuthMethod = 'email' | 'phone';

export default function SignInScreen() {
    const { isReady } = usePrivy();
    const { sendCode: sendEmailCode, loginWithCode: loginWithEmailCode, state: emailState } = useLoginWithEmail();
    const { sendCode: sendSmsCode, loginWithCode: loginWithSmsCode, state: smsState } = useLoginWithSMS();
    const { login: loginWithOAuth, state: oauthState } = useLoginWithOAuth();
    const { loginWithPasskey, state: passkeyState } = useLoginWithPasskey();

    const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'input' | 'code'>('input');
    const [error, setError] = useState<string | null>(null);

    const isLoading = emailState.status === 'sending-code' || smsState.status === 'sending-code';
    const isVerifying = emailState.status === 'submitting-code' || smsState.status === 'submitting-code';

    const handleSendCode = async () => {
        setError(null);
        try {
            if (authMethod === 'email') {
                if (!email.trim()) {
                    setError('Please enter your email');
                    return;
                }
                await sendEmailCode({ email: email.trim() });
            } else {
                if (!phone.trim()) {
                    setError('Please enter your phone number');
                    return;
                }
                await sendSmsCode({ phone: phone.trim() });
            }
            setStep('code');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send code');
        }
    };

    const handleVerifyCode = async () => {
        if (!code.trim()) {
            setError('Please enter the verification code');
            return;
        }
        setError(null);
        try {
            if (authMethod === 'email') {
                await loginWithEmailCode({ code: code.trim() });
            } else {
                await loginWithSmsCode({ code: code.trim() });
            }
            router.replace('/(tabs)/explore');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid code');
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'apple' | 'twitter' | 'discord') => {
        setError(null);
        try {
            await loginWithOAuth({ provider });
            router.replace('/(tabs)/explore');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    const handleSkip = () => {
        router.replace('/(tabs)/explore');
    };

    const resetForm = () => {
        setStep('input');
        setCode('');
        setError(null);
    };

    if (!isReady) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <LoaderIcon size={32} className="text-primary animate-spin" />
                <Text className="mt-4 text-muted-foreground">Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 justify-center px-6 py-12">
                    {/* Header */}
                    <View className="items-center mb-8">
                        {/* Logo Container with Gradient Ring */}
                        <View className="relative mb-4">
                            <View className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center border-2 border-primary/30">
                                <WalletIcon size={48} className="text-primary" strokeWidth={1.5} />
                            </View>
                            {/* Decorative Ring */}
                            <View className="absolute -inset-1 rounded-full border border-primary/10" />
                        </View>
                        {/* App Name */}
                        <Text className="text-4xl font-bold text-foreground mb-1 tracking-tight">
                            Kinetic
                        </Text>
                        {/* Tagline */}
                        <Text className="text-sm font-medium text-primary/80 mb-3 tracking-widest uppercase">
                            DeFi Unbound
                        </Text>
                        {/* Description */}
                        <Text className="text-muted-foreground text-center leading-relaxed">
                            Sign in to track your yields and manage your portfolio
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="gap-4">
                        {step === 'input' ? (
                            <>
                                {/* Auth Method Toggle */}
                                <View className="flex-row bg-muted rounded-lg p-1">
                                    <Pressable
                                        onPress={() => setAuthMethod('email')}
                                        className={cn(
                                            'flex-1 flex-row items-center justify-center gap-2 py-3 rounded-md',
                                            authMethod === 'email' && 'bg-background border border-border'
                                        )}
                                    >
                                        <MailIcon size={16} className={authMethod === 'email' ? 'text-primary' : 'text-muted-foreground'} />
                                        <Text className={authMethod === 'email' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                                            Email
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setAuthMethod('phone')}
                                        className={cn(
                                            'flex-1 flex-row items-center justify-center gap-2 py-3 rounded-md',
                                            authMethod === 'phone' && 'bg-background border border-border'
                                        )}
                                    >
                                        <PhoneIcon size={16} className={authMethod === 'phone' ? 'text-primary' : 'text-muted-foreground'} />
                                        <Text className={authMethod === 'phone' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                                            Phone
                                        </Text>
                                    </Pressable>
                                </View>

                                {/* Input Field */}
                                {authMethod === 'email' ? (
                                    <Input
                                        placeholder="Enter your email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        testID="signin-email-input"
                                    />
                                ) : (
                                    <Input
                                        placeholder="+1 (555) 555-5555"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        testID="signin-phone-input"
                                    />
                                )}

                                {/* Send Code Button */}
                                <Button
                                    onPress={handleSendCode}
                                    disabled={isLoading}
                                    className="w-full h-14"
                                    testID="signin-send-code-button"
                                >
                                    {isLoading ? (
                                        <LoaderIcon size={20} className="text-primary-foreground animate-spin" />
                                    ) : (
                                        <>
                                            <Text className="font-semibold">
                                                Continue with {authMethod === 'email' ? 'Email' : 'Phone'}
                                            </Text>
                                            <ArrowRightIcon size={18} className="text-primary-foreground" />
                                        </>
                                    )}
                                </Button>

                                {/* Separator */}
                                <View className="flex-row items-center gap-4 my-2">
                                    <Separator className="flex-1" />
                                    <Text className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                        Or continue with
                                    </Text>
                                    <Separator className="flex-1" />
                                </View>

                                {/* Social Logins - Row 1: Google & Apple */}
                                <View className="flex-row gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 bg-card"
                                        onPress={() => handleOAuthLogin('google')}
                                        disabled={oauthState.status === 'loading'}
                                        testID="signin-google-button"
                                    >
                                        <Text className="font-semibold">Google</Text>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 bg-card"
                                        onPress={() => handleOAuthLogin('apple')}
                                        disabled={oauthState.status === 'loading'}
                                        testID="signin-apple-button"
                                    >
                                        <Text className="font-semibold">Apple</Text>
                                    </Button>
                                </View>

                                {/* Social Logins - Row 2: Twitter & Discord */}
                                <View className="flex-row gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 bg-card border-sky-500/30"
                                        onPress={() => handleOAuthLogin('twitter')}
                                        disabled={oauthState.status === 'loading'}
                                        testID="signin-twitter-button"
                                    >
                                        <Text className="font-semibold text-sky-600">Twitter/X</Text>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 bg-card border-indigo-500/30"
                                        onPress={() => handleOAuthLogin('discord')}
                                        disabled={oauthState.status === 'loading'}
                                        testID="signin-discord-button"
                                    >
                                        <Text className="font-semibold text-indigo-600">Discord</Text>
                                    </Button>
                                </View>

                                {/* Passkey Login */}
                                <Button
                                    variant="secondary"
                                    className="w-full h-14"
                                    onPress={() => loginWithPasskey({} as any)}
                                    disabled={passkeyState.status !== 'initial' && passkeyState.status !== 'done'}
                                    testID="signin-passkey-button"
                                >
                                    <FingerprintIcon size={20} className="text-foreground" />
                                    <Text className="font-semibold">Sign in with Passkey</Text>
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Code Verification */}
                                <View className="items-center mb-2">
                                    <Badge variant="outline" className="mb-2">
                                        {authMethod === 'email' ? (
                                            <MailIcon size={12} className="text-primary mr-1" />
                                        ) : (
                                            <PhoneIcon size={12} className="text-primary mr-1" />
                                        )}
                                        <Text className="text-xs">
                                            {authMethod === 'email' ? email : phone}
                                        </Text>
                                    </Badge>
                                </View>

                                <Input
                                    placeholder="Enter 6-digit code"
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    className="text-center tracking-widest text-xl"
                                    testID="signin-code-input"
                                />

                                <Text className="text-sm text-muted-foreground text-center">
                                    We sent a verification code to your {authMethod === 'email' ? 'email' : 'phone'}
                                </Text>

                                <Button
                                    onPress={handleVerifyCode}
                                    disabled={isVerifying}
                                    className="w-full h-14"
                                    testID="signin-verify-button"
                                >
                                    {isVerifying ? (
                                        <LoaderIcon size={20} className="text-primary-foreground animate-spin" />
                                    ) : (
                                        <>
                                            <Text className="font-semibold">Sign In</Text>
                                            <ArrowRightIcon size={18} className="text-primary-foreground" />
                                        </>
                                    )}
                                </Button>

                                <Button variant="ghost" onPress={resetForm}>
                                    <Text>Use a different {authMethod === 'email' ? 'email' : 'phone'}</Text>
                                </Button>
                            </>
                        )}

                        {/* Error Message */}
                        {error && (
                            <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                <Text className="text-destructive text-sm text-center">{error}</Text>
                            </View>
                        )}
                    </View>

                    {/* Skip for now */}
                    <View className="mt-8 items-center">
                        <Button variant="ghost" onPress={handleSkip} testID="signin-skip-button">
                            <Text className="text-muted-foreground">Skip for now</Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
