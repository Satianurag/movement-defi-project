import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    useLoginWithEmail,
    useLoginWithOAuth,
    usePrivy
} from '@privy-io/expo';
import { useLoginWithPasskey } from '@privy-io/expo/passkey';
import { router } from 'expo-router';
import {
    MailIcon,
    KeyIcon,
    WalletIcon,
    ArrowRightIcon,
    LoaderIcon,
    FingerprintIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Image } from 'react-native';

export default function SignInScreen() {
    const { isReady } = usePrivy();
    const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail();
    const { login: loginWithOAuth, state: oauthState } = useLoginWithOAuth();
    const { loginWithPasskey, state: passkeyState } = useLoginWithPasskey();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async () => {
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        setError(null);
        try {
            await sendCode({ email: email.trim() });
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
            await loginWithCode({ code: code.trim() });
            // Navigate to main app after successful login
            router.replace('/(tabs)/explore');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid code');
        }
    };

    const handleSkip = () => {
        // Allow users to explore without signing in
        router.replace('/(tabs)/explore');
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
            <View className="flex-1 justify-center px-6">
                {/* Header */}
                <View className="items-center mb-10">
                    <View className="h-20 w-20 rounded-full bg-primary/10 items-center justify-center mb-4">
                        <WalletIcon size={40} className="text-primary" />
                    </View>
                    <Text className="text-3xl font-bold text-foreground mb-2">
                        Movement DeFi
                    </Text>
                    <Text className="text-muted-foreground text-center">
                        Sign in to track your yields and manage your portfolio
                    </Text>
                </View>

                {/* Form */}
                <View className="gap-4">
                    {step === 'email' ? (
                        <>
                            {/* Email Input */}
                            <Input
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            {/* Send Code Button */}
                            <Button
                                onPress={handleSendCode}
                                disabled={emailState.status === 'sending-code'}
                                className="w-full h-14"
                            >
                                {emailState.status === 'sending-code' ? (
                                    <LoaderIcon size={20} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <>
                                        <Text className="font-semibold">Continue with Email</Text>
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

                            {/* Social Logins */}
                            <View className="flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 bg-card"
                                    onPress={() => loginWithOAuth({ provider: 'google' })}
                                    disabled={oauthState.status === 'loading'}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <Text className="font-semibold">Google</Text>
                                    </View>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 bg-card"
                                    onPress={() => loginWithOAuth({ provider: 'apple' })}
                                    disabled={oauthState.status === 'loading'}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <Text className="font-semibold">Apple</Text>
                                    </View>
                                </Button>
                            </View>

                            {/* Passkey Login */}
                            <Button
                                variant="secondary"
                                className="w-full h-14"
                                onPress={() => loginWithPasskey({} as any)}
                                disabled={passkeyState.status !== 'initial' && passkeyState.status !== 'done'}
                            >
                                <FingerprintIcon size={20} className="text-foreground" />
                                <Text className="font-semibold">Sign in with Passkey</Text>
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Code Input */}
                            <Input
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                maxLength={6}
                                className="text-center tracking-widest"
                            />

                            <Text className="text-sm text-muted-foreground text-center">
                                We sent a code to {email}
                            </Text>

                            {/* Verify Button */}
                            <Button
                                onPress={handleVerifyCode}
                                disabled={emailState.status === 'submitting-code'}
                                className="w-full h-14"
                            >
                                {emailState.status === 'submitting-code' ? (
                                    <LoaderIcon size={20} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <>
                                        <Text className="font-semibold">Sign In</Text>
                                        <ArrowRightIcon size={18} className="text-primary-foreground" />
                                    </>
                                )}
                            </Button>

                            {/* Back to email */}
                            <Button
                                variant="ghost"
                                onPress={() => {
                                    setStep('email');
                                    setCode('');
                                    setError(null);
                                }}
                            >
                                <Text>Use a different email</Text>
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
                    <Button variant="ghost" onPress={handleSkip}>
                        <Text className="text-muted-foreground">Skip for now</Text>
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView >
    );
}
