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
} from 'lucide-react-native';
import { usePrivy, useEmbeddedEthereumWallet } from '@/lib/privy-hooks';

interface FundWalletProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

type FundingProvider = 'coinbase' | 'moonpay';

export function FundWallet({ onSuccess, onCancel }: FundWalletProps) {
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets?.[0];

    const [selectedProvider, setSelectedProvider] = useState<FundingProvider | null>(null);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        try {
            // Note: Actual funding requires configuration in Privy Dashboard
            // The fundWallet flow will open a WebView to the provider
            Alert.alert(
                'Fund Wallet',
                `This will open ${selectedProvider === 'coinbase' ? 'Coinbase Pay' : 'Moonpay'} to fund $${amount} to your wallet.\n\nNote: Fiat on-ramp requires API keys configured in Privy Dashboard.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Continue',
                        onPress: () => {
                            // In production, this would trigger the actual funding flow
                            onSuccess?.();
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to initiate funding'
            );
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
            </CardContent>
        </Card>
    );
}

export default FundWallet;
