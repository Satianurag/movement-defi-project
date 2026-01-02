import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    KeyIcon,
    ShieldCheckIcon,
    LoaderIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    RefreshCwIcon,
    XCircleIcon,
    PlusIcon,
} from 'lucide-react-native';
import {
    usePrivy,
    useEmbeddedEthereumWallet,
    useSigners,
    useDelegatedActions,
    type ChainType,
} from '@/lib/privy-hooks';

interface SessionSignerProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

export function SessionSigner({ onComplete, onCancel }: SessionSignerProps) {
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets?.[0];

    const { addSigners, removeSigners } = useSigners();
    const { delegateWallet } = useDelegatedActions();

    const [step, setStep] = useState<'info' | 'configure' | 'success'>('info');
    const [signerId, setSignerId] = useState('');
    const [policyId, setPolicyId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDelegated, setIsDelegated] = useState(false);

    const handleDelegateWallet = async () => {
        if (!wallet) {
            Alert.alert('Error', 'Wallet not available');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await delegateWallet({
                address: wallet.address,
                chainType: 'ethereum' as ChainType,
            });
            setIsDelegated(true);
            setStep('configure');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delegate wallet';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSigner = async () => {
        if (!wallet) {
            Alert.alert('Error', 'Wallet not available');
            return;
        }
        if (!signerId.trim()) {
            Alert.alert('Error', 'Please enter a signer ID');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await addSigners({
                address: wallet.address,
                signers: [{
                    signerId: signerId.trim(),
                    policyIds: policyId.trim() ? [policyId.trim()] : [],
                }],
            });
            setStep('success');
            onComplete?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add signer';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSigner = async () => {
        if (!wallet) return;

        setIsLoading(true);
        setError(null);

        try {
            await removeSigners({
                address: wallet.address,
            });
            Alert.alert('Success', 'All signers removed');
            setSignerId('');
            setPolicyId('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove signers';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || !wallet) {
        return (
            <Card className="w-full">
                <CardContent className="items-center justify-center py-8">
                    <Text className="text-muted-foreground text-center">
                        Please sign in to configure session signers
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Session Signers</CardTitle>
                    <Badge variant="outline" className="border-success/30">
                        <KeyIcon size={12} className="text-success mr-1" />
                        <Text className="text-success text-xs">Delegation</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Enable server-side signing for automated transactions
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {step === 'info' && (
                    <>
                        {/* Info Section */}
                        <View className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <View className="flex-row items-center gap-2 mb-2">
                                <ShieldCheckIcon size={18} className="text-primary" />
                                <Text className="font-semibold text-primary">What are Session Signers?</Text>
                            </View>
                            <Text className="text-sm text-muted-foreground">
                                Session signers allow your server to sign transactions on behalf of your wallet.
                                This enables gasless transactions, automated strategies, and better UX.
                            </Text>
                        </View>

                        {/* Benefits List */}
                        <View className="gap-2">
                            <View className="flex-row items-center gap-2">
                                <CheckCircleIcon size={14} className="text-success" />
                                <Text className="text-sm">Gasless transactions for users</Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <CheckCircleIcon size={14} className="text-success" />
                                <Text className="text-sm">Automated DeFi strategies</Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <CheckCircleIcon size={14} className="text-success" />
                                <Text className="text-sm">Policy-controlled access</Text>
                            </View>
                        </View>

                        {/* Delegate Button */}
                        <Button
                            className="w-full mt-2"
                            onPress={handleDelegateWallet}
                            disabled={isLoading || isDelegated}
                        >
                            {isLoading ? (
                                <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                            ) : isDelegated ? (
                                <>
                                    <CheckCircleIcon size={16} className="text-primary-foreground mr-2" />
                                    <Text className="font-semibold">Wallet Delegated</Text>
                                </>
                            ) : (
                                <>
                                    <KeyIcon size={16} className="text-primary-foreground mr-2" />
                                    <Text className="font-semibold">Delegate Wallet</Text>
                                </>
                            )}
                        </Button>

                        {isDelegated && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onPress={() => setStep('configure')}
                            >
                                <Text>Configure Session Signers</Text>
                            </Button>
                        )}
                    </>
                )}

                {step === 'configure' && (
                    <>
                        {/* Signer ID Input */}
                        <View className="gap-2">
                            <Text className="text-sm font-medium text-muted-foreground">Signer ID</Text>
                            <Input
                                placeholder="Enter key quorum ID..."
                                value={signerId}
                                onChangeText={setSignerId}
                                autoCapitalize="none"
                            />
                            <Text className="text-xs text-muted-foreground">
                                Get this from your Privy Dashboard under "Server Signers"
                            </Text>
                        </View>

                        {/* Policy ID Input (Optional) */}
                        <View className="gap-2">
                            <Text className="text-sm font-medium text-muted-foreground">Policy ID (Optional)</Text>
                            <Input
                                placeholder="Enter policy ID..."
                                value={policyId}
                                onChangeText={setPolicyId}
                                autoCapitalize="none"
                            />
                            <Text className="text-xs text-muted-foreground">
                                Restrict signer to specific transaction types
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={() => setStep('info')}
                            >
                                <Text>Back</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={handleAddSigner}
                                disabled={isLoading || !signerId.trim()}
                            >
                                {isLoading ? (
                                    <LoaderIcon size={18} className="text-primary-foreground animate-spin" />
                                ) : (
                                    <>
                                        <PlusIcon size={16} className="text-primary-foreground mr-2" />
                                        <Text className="font-semibold">Add Signer</Text>
                                    </>
                                )}
                            </Button>
                        </View>

                        {/* Remove Signer Option */}
                        <Button
                            variant="destructive"
                            className="w-full"
                            onPress={handleRemoveSigner}
                            disabled={isLoading}
                        >
                            <XCircleIcon size={16} className="text-white mr-2" />
                            <Text className="text-white font-semibold">Remove All Signers</Text>
                        </Button>
                    </>
                )}

                {step === 'success' && (
                    <View className="items-center py-6">
                        <View className="h-16 w-16 rounded-full bg-success/10 items-center justify-center mb-4">
                            <CheckCircleIcon size={32} className="text-success" />
                        </View>
                        <Text className="text-lg font-bold text-center mb-2">Session Signer Added!</Text>
                        <Text className="text-muted-foreground text-center text-sm mb-4">
                            Your server can now sign transactions for this wallet.
                        </Text>
                        <Button
                            variant="outline"
                            onPress={() => {
                                setStep('configure');
                                setSignerId('');
                                setPolicyId('');
                            }}
                        >
                            <RefreshCwIcon size={16} className="mr-2" />
                            <Text>Add Another</Text>
                        </Button>
                    </View>
                )}

                {/* Error Display */}
                {error && (
                    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex-row items-center gap-2">
                        <AlertCircleIcon size={16} className="text-destructive" />
                        <Text className="text-destructive text-sm flex-1">{error}</Text>
                    </View>
                )}

                {/* Cancel Button */}
                {step !== 'success' && (
                    <Button
                        variant="ghost"
                        className="w-full"
                        onPress={onCancel}
                    >
                        <Text className="text-muted-foreground">Cancel</Text>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default SessionSigner;
