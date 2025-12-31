import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    PenToolIcon,
    FileTextIcon,
    SendIcon,
    LoaderIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    CopyIcon,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import {
    usePrivy,
    useEmbeddedEthereumWallet,
} from '@/lib/privy-hooks';

interface TransactionSignerProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

type SigningMode = 'message' | 'typed-data' | 'transaction';

export function TransactionSigner({ onComplete, onCancel }: TransactionSignerProps) {
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets?.[0];

    const [mode, setMode] = useState<SigningMode>('message');
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // For transaction mode
    const [toAddress, setToAddress] = useState('');
    const [value, setValue] = useState('');

    const modes: Array<{
        id: SigningMode;
        name: string;
        description: string;
        icon: typeof PenToolIcon;
        color: string;
        bgColor: string;
    }> = [
            {
                id: 'message',
                name: 'Sign Message',
                description: 'Sign a plain text message',
                icon: PenToolIcon,
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
            },
            {
                id: 'typed-data',
                name: 'Sign Typed Data',
                description: 'EIP-712 structured data signing',
                icon: FileTextIcon,
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
            },
            {
                id: 'transaction',
                name: 'Send Transaction',
                description: 'Send ETH/tokens to an address',
                icon: SendIcon,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500/10',
            },
        ];

    const handleSign = async () => {
        if (!wallet) {
            Alert.alert('Error', 'Wallet not available');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSignature(null);
        setTxHash(null);

        try {
            // Get the embedded wallet provider
            const provider = await wallet.getProvider();

            if (mode === 'message') {
                if (!message.trim()) {
                    throw new Error('Please enter a message to sign');
                }
                // Use personal_sign via provider
                const sig = await provider.request({
                    method: 'personal_sign',
                    params: [message.trim(), wallet.address],
                });
                setSignature(sig as string);
            } else if (mode === 'typed-data') {
                // Example EIP-712 typed data
                const typedData = {
                    types: {
                        EIP712Domain: [
                            { name: 'name', type: 'string' },
                            { name: 'version', type: 'string' },
                            { name: 'chainId', type: 'uint256' },
                        ],
                        Message: [
                            { name: 'content', type: 'string' },
                            { name: 'timestamp', type: 'uint256' },
                        ],
                    },
                    domain: {
                        name: 'Kinetic',
                        version: '1',
                        chainId: 30732, // Movement Testnet
                    },
                    primaryType: 'Message',
                    message: {
                        content: message || 'Hello from Kinetic!',
                        timestamp: Date.now(),
                    },
                };
                // Use eth_signTypedData_v4 via provider
                const sig = await provider.request({
                    method: 'eth_signTypedData_v4',
                    params: [wallet.address, JSON.stringify(typedData)],
                });
                setSignature(sig as string);
            } else if (mode === 'transaction') {
                if (!toAddress.trim()) {
                    throw new Error('Please enter a recipient address');
                }
                if (!value || parseFloat(value) <= 0) {
                    throw new Error('Please enter a valid amount');
                }
                // Convert amount to wei (hex)
                const weiValue = BigInt(Math.floor(parseFloat(value) * 1e18));
                const hexValue = '0x' + weiValue.toString(16);

                // Use eth_sendTransaction via provider
                const hash = await provider.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: wallet.address,
                        to: toAddress.trim(),
                        value: hexValue,
                    }],
                });
                setTxHash(hash as string);
            }

            onComplete?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Signing failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (text: string) => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user || !wallet) {
        return (
            <Card className="w-full">
                <CardContent className="items-center justify-center py-8">
                    <Text className="text-muted-foreground text-center">
                        Please sign in to use transaction signing
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Transaction Signer</CardTitle>
                    <Badge variant="outline" className="border-primary/30">
                        <PenToolIcon size={12} className="text-primary mr-1" />
                        <Text className="text-primary text-xs">Signing</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Sign messages, typed data, or send transactions
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {/* Mode Selection */}
                <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Select Action
                </Text>
                <View className="gap-3">
                    {modes.map((m) => (
                        <Button
                            key={m.id}
                            variant={mode === m.id ? 'default' : 'outline'}
                            className="w-full h-14 justify-start"
                            onPress={() => {
                                setMode(m.id);
                                setSignature(null);
                                setTxHash(null);
                                setError(null);
                            }}
                        >
                            <View className={`h-8 w-8 rounded-full ${m.bgColor} items-center justify-center mr-3`}>
                                <m.icon size={16} className={m.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-semibold text-left">{m.name}</Text>
                                <Text className="text-xs text-muted-foreground text-left">
                                    {m.description}
                                </Text>
                            </View>
                            {mode === m.id && (
                                <CheckCircleIcon size={18} className="text-primary" />
                            )}
                        </Button>
                    ))}
                </View>

                {/* Input Fields */}
                {mode === 'message' && (
                    <View className="gap-2">
                        <Text className="text-sm font-medium text-muted-foreground">Message</Text>
                        <Input
                            placeholder="Enter message to sign..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                )}

                {mode === 'typed-data' && (
                    <View className="gap-2">
                        <Text className="text-sm font-medium text-muted-foreground">Message Content</Text>
                        <Input
                            placeholder="Enter message content..."
                            value={message}
                            onChangeText={setMessage}
                        />
                        <Text className="text-xs text-muted-foreground">
                            Will be signed as EIP-712 typed data with timestamp
                        </Text>
                    </View>
                )}

                {mode === 'transaction' && (
                    <View className="gap-3">
                        <View className="gap-2">
                            <Text className="text-sm font-medium text-muted-foreground">Recipient Address</Text>
                            <Input
                                placeholder="0x..."
                                value={toAddress}
                                onChangeText={setToAddress}
                                autoCapitalize="none"
                            />
                        </View>
                        <View className="gap-2">
                            <Text className="text-sm font-medium text-muted-foreground">Amount (MOVE)</Text>
                            <Input
                                placeholder="0.01"
                                value={value}
                                onChangeText={setValue}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>
                )}

                {/* Result Display */}
                {signature && (
                    <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-sm font-medium text-emerald-600">Signature</Text>
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={() => handleCopy(signature)}
                            >
                                {copied ? (
                                    <CheckCircleIcon size={14} className="text-emerald-500" />
                                ) : (
                                    <CopyIcon size={14} className="text-muted-foreground" />
                                )}
                            </Button>
                        </View>
                        <Text className="font-mono text-xs break-all" selectable>
                            {signature.slice(0, 40)}...{signature.slice(-20)}
                        </Text>
                    </View>
                )}

                {txHash && (
                    <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-sm font-medium text-emerald-600">Transaction Hash</Text>
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={() => handleCopy(txHash)}
                            >
                                {copied ? (
                                    <CheckCircleIcon size={14} className="text-emerald-500" />
                                ) : (
                                    <CopyIcon size={14} className="text-muted-foreground" />
                                )}
                            </Button>
                        </View>
                        <Text className="font-mono text-xs break-all" selectable>
                            {txHash}
                        </Text>
                    </View>
                )}

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
                        onPress={handleSign}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                        ) : (
                            <>
                                {mode === 'transaction' ? (
                                    <SendIcon size={16} className="text-primary-foreground mr-2" />
                                ) : (
                                    <PenToolIcon size={16} className="text-primary-foreground mr-2" />
                                )}
                                <Text className="font-semibold">
                                    {mode === 'transaction' ? 'Send' : 'Sign'}
                                </Text>
                            </>
                        )}
                    </Button>
                </View>
            </CardContent>
        </Card>
    );
}

export default TransactionSigner;
