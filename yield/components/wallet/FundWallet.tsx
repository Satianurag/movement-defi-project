import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DollarSignIcon,
    CreditCardIcon,
    LoaderIcon,
    CheckCircleIcon,
    WalletIcon,
    AlertCircleIcon,
} from 'lucide-react-native';
import { usePrivy, useEmbeddedEthereumWallet, useFundWallet } from '@/lib/privy-hooks';

interface FundWalletProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

type FundingProvider = 'coinbase' | 'moonpay';

export function FundWallet({ onSuccess, onCancel }: FundWalletProps) {
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets?.[0];
    const { fundWallet } = useFundWallet();

    const [selectedProvider, setSelectedProvider] = useState<FundingProvider | null>(null);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const providers: Array<{
        id: FundingProvider;
        name: string;
        description: string;
        icon: typeof CreditCardIcon;
        color: string;
        bgColor: string;
    }> = [
            {
                id: 'coinbase',
                name: 'Coinbase Pay',
                description: 'Buy crypto with your Coinbase account',
                icon: WalletIcon,
                color: 'text-blue-600',
                bgColor: 'bg-blue-500/10',
            },
            {
                id: 'moonpay',
                name: 'Moonpay',
                description: 'Buy with credit card or bank transfer',
                icon: CreditCardIcon,
                color: 'text-purple-600',
                bgColor: 'bg-purple-500/10',
            },
        ];

    const handleFund = async () => {
        if (!selectedProvider) {
            Alert.alert('Error', 'Please select a payment provider');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        if (!wallet) {
            Alert.alert('Error', 'Wallet not available');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Use the real Privy fundWallet hook
            await fundWallet({
                address: wallet.address,
                amount: amount,
                defaultPaymentMethod: 'card',
                card: {
                    preferredProvider: selectedProvider,
                },
            });

            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initiate funding';
            setError(errorMessage);

            // Show alert for user-friendly feedback
            Alert.alert('Funding Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || !wallet) {
        return (
            <Card className="w-full">
                <CardContent className="items-center justify-center py-8">
                    <Text className="text-muted-foreground text-center">
                        Please sign in to fund your wallet
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Fund Wallet</CardTitle>
                    <Badge variant="outline" className="border-primary/30">
                        <DollarSignIcon size={12} className="text-primary mr-1" />
                        <Text className="text-primary text-xs">Fiat On-Ramp</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Buy crypto directly to your wallet
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {/* Wallet Address Display */}
                <View className="bg-muted rounded-lg p-3">
                    <Text className="text-xs text-muted-foreground mb-1">Funding to:</Text>
                    <Text className="font-mono text-sm" numberOfLines={1}>
                        {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                    </Text>
                </View>

                {/* Amount Input */}
                <View className="gap-2">
                    <Text className="text-sm font-medium text-muted-foreground">Amount (USD)</Text>
                    <Input
                        placeholder="100.00"
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                        className="text-xl"
                    />
                </View>

                {/* Provider Selection */}
                <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Payment Provider
                </Text>
                <View className="gap-3">
                    {providers.map((provider) => (
                        <Button
                            key={provider.id}
                            variant={selectedProvider === provider.id ? 'default' : 'outline'}
                            className="w-full h-16 justify-start"
                            onPress={() => setSelectedProvider(provider.id)}
                        >
                            <View className={`h-10 w-10 rounded-full ${provider.bgColor} items-center justify-center mr-3`}>
                                <provider.icon size={20} className={provider.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-semibold text-left">{provider.name}</Text>
                                <Text className="text-xs text-muted-foreground text-left">
                                    {provider.description}
                                </Text>
                            </View>
                            {selectedProvider === provider.id && (
                                <CheckCircleIcon size={20} className="text-primary" />
                            )}
                        </Button>
                    ))}
                </View>

                {/* Error Display */}
                {error && (
                    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex-row items-center gap-2">
                        <AlertCircleIcon size={16} className="text-destructive" />
                        <Text className="text-destructive text-sm flex-1">{error}</Text>
                    </View>
                )}

                {/* Action Buttons */}
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
                        onPress={handleFund}
                        disabled={!selectedProvider || !amount || isLoading}
                    >
                        {isLoading ? (
                            <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                        ) : (
                            <>
                                <DollarSignIcon size={18} className="text-primary-foreground mr-2" />
                                <Text className="font-semibold">Fund Wallet</Text>
                            </>
                        )}
                    </Button>
                </View>

                {/* Info Note */}
                <View className="bg-muted/50 rounded-lg p-3 mt-2">
                    <Text className="text-xs text-muted-foreground text-center">
                        Powered by Privy. Funding requires provider API keys configured in the Privy Dashboard.
                    </Text>
                </View>
            </CardContent>
        </Card>
    );
}

export default FundWallet;
