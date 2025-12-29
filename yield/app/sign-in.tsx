import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useLoginWithEmail, usePrivy } from '@privy-io/expo';
import { router } from 'expo-router';
import {
    MailIcon,
    KeyIcon,
    WalletIcon,
    ArrowRightIcon,
    LoaderIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';

export default function SignInScreen() {
    const { isReady } = usePrivy();
    const { sendCode, loginWithCode, state } = useLoginWithEmail();

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
                            <View className="bg-muted/50 border border-border rounded-xl p-4 flex-row items-center gap-3">
                                <MailIcon size={20} className="text-muted-foreground" />
                                <TextInput
                                    className="flex-1 text-foreground text-base"
                                    placeholder="Enter your email"
                                    placeholderTextColor="#888"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* Send Code Button */}
                            <Button
                                onPress={handleSendCode}
                                disabled={state.status === 'sending-code'}
                                className="w-full h-14"
                            >
                                {state.status === 'sending-code' ? (
                                    <LoaderIcon size={20} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <>
                                        <Text className="font-semibold">Continue with Email</Text>
                                        <ArrowRightIcon size={18} className="text-primary-foreground" />
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Code Input */}
                            <View className="bg-muted/50 border border-border rounded-xl p-4 flex-row items-center gap-3">
                                <KeyIcon size={20} className="text-muted-foreground" />
                                <TextInput
                                    className="flex-1 text-foreground text-base tracking-widest"
                                    placeholder="Enter 6-digit code"
                                    placeholderTextColor="#888"
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            <Text className="text-sm text-muted-foreground text-center">
                                We sent a code to {email}
                            </Text>

                            {/* Verify Button */}
                            <Button
                                onPress={handleVerifyCode}
                                disabled={state.status === 'submitting-code'}
                                className="w-full h-14"
                            >
                                {state.status === 'submitting-code' ? (
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
                    <Pressable onPress={handleSkip}>
                        <Text className="text-muted-foreground underline">
                            Skip for now
                        </Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
