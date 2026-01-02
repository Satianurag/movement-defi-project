import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ShieldIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
    PlusIcon,
    TrashIcon,
    DollarSignIcon,
    WalletIcon,
    ClockIcon,
    ListIcon,
} from 'lucide-react-native';
import { usePrivy, useEmbeddedEthereumWallet } from '@/lib/privy-hooks';

interface WalletPoliciesProps {
    onSave?: () => void;
    onCancel?: () => void;
}

interface SpendingLimit {
    id: string;
    asset: string;
    amount: string;
    period: 'daily' | 'weekly' | 'monthly';
}

interface AllowedAddress {
    id: string;
    address: string;
    label: string;
}

export function WalletPolicies({ onSave, onCancel }: WalletPoliciesProps) {
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets?.[0];

    const [step, setStep] = useState<'overview' | 'limits' | 'allowlist'>('overview');
    const [spendingLimits, setSpendingLimits] = useState<SpendingLimit[]>([]);
    const [allowedAddresses, setAllowedAddresses] = useState<AllowedAddress[]>([]);

    // Form state for adding new items
    const [newLimitAsset, setNewLimitAsset] = useState('MOVE');
    const [newLimitAmount, setNewLimitAmount] = useState('');
    const [newLimitPeriod, setNewLimitPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [newAddress, setNewAddress] = useState('');
    const [newAddressLabel, setNewAddressLabel] = useState('');

    const addSpendingLimit = () => {
        if (!newLimitAmount || parseFloat(newLimitAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        const newLimit: SpendingLimit = {
            id: Date.now().toString(),
            asset: newLimitAsset,
            amount: newLimitAmount,
            period: newLimitPeriod,
        };
        setSpendingLimits([...spendingLimits, newLimit]);
        setNewLimitAmount('');
    };

    const removeSpendingLimit = (id: string) => {
        setSpendingLimits(spendingLimits.filter(l => l.id !== id));
    };

    const addAllowedAddress = () => {
        if (!newAddress.trim() || !newAddress.startsWith('0x')) {
            Alert.alert('Error', 'Please enter a valid address');
            return;
        }
        const newEntry: AllowedAddress = {
            id: Date.now().toString(),
            address: newAddress.trim(),
            label: newAddressLabel.trim() || 'Unnamed',
        };
        setAllowedAddresses([...allowedAddresses, newEntry]);
        setNewAddress('');
        setNewAddressLabel('');
    };

    const removeAllowedAddress = (id: string) => {
        setAllowedAddresses(allowedAddresses.filter(a => a.id !== id));
    };

    const handleSave = () => {
        // Note: Actual policy saving requires Privy Dashboard API configuration
        Alert.alert(
            'Policies Configured',
            `Spending Limits: ${spendingLimits.length}\nAllowed Addresses: ${allowedAddresses.length}\n\nNote: These policies require Privy Dashboard configuration to be enforced.`,
            [{ text: 'OK', onPress: onSave }]
        );
    };

    const getPeriodLabel = (period: 'daily' | 'weekly' | 'monthly') => {
        switch (period) {
            case 'daily': return 'per day';
            case 'weekly': return 'per week';
            case 'monthly': return 'per month';
        }
    };

    if (!user || !wallet) {
        return (
            <Card className="w-full">
                <CardContent className="items-center justify-center py-8">
                    <Text className="text-muted-foreground text-center">
                        Please sign in to configure wallet policies
                    </Text>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <View className="flex-row items-center justify-between">
                    <CardTitle className="text-xl">Wallet Policies</CardTitle>
                    <Badge variant="outline" className="border-amber-500/30">
                        <ShieldIcon size={12} className="text-amber-500 mr-1" />
                        <Text className="text-amber-500 text-xs">Security</Text>
                    </Badge>
                </View>
                <CardDescription>
                    Set spending limits and transaction allowlists
                </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
                {step === 'overview' && (
                    <>
                        {/* Warning Banner */}
                        <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                            <View className="flex-row items-center gap-2 mb-2">
                                <AlertTriangleIcon size={18} className="text-amber-500" />
                                <Text className="font-semibold text-amber-600">Security First</Text>
                            </View>
                            <Text className="text-sm text-muted-foreground">
                                Wallet policies help protect your funds by limiting transaction amounts
                                and restricting destinations.
                            </Text>
                        </View>

                        {/* Policy Cards */}
                        <View className="gap-3">
                            {/* Spending Limits Card */}
                            <Button
                                variant="outline"
                                className="w-full h-20 justify-start"
                                onPress={() => setStep('limits')}
                            >
                                <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                                    <DollarSignIcon size={24} className="text-primary" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-semibold text-left">Spending Limits</Text>
                                    <Text className="text-xs text-muted-foreground text-left">
                                        {spendingLimits.length > 0
                                            ? `${spendingLimits.length} limit(s) configured`
                                            : 'Set maximum spending per period'}
                                    </Text>
                                </View>
                                {spendingLimits.length > 0 && (
                                    <Badge variant="secondary">
                                        <Text className="text-xs">{spendingLimits.length}</Text>
                                    </Badge>
                                )}
                            </Button>

                            {/* Allowlist Card */}
                            <Button
                                variant="outline"
                                className="w-full h-20 justify-start"
                                onPress={() => setStep('allowlist')}
                            >
                                <View className="h-12 w-12 rounded-full bg-success/10 items-center justify-center mr-3">
                                    <ListIcon size={24} className="text-success" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-semibold text-left">Address Allowlist</Text>
                                    <Text className="text-xs text-muted-foreground text-left">
                                        {allowedAddresses.length > 0
                                            ? `${allowedAddresses.length} address(es) allowed`
                                            : 'Restrict transactions to trusted addresses'}
                                    </Text>
                                </View>
                                {allowedAddresses.length > 0 && (
                                    <Badge variant="secondary">
                                        <Text className="text-xs">{allowedAddresses.length}</Text>
                                    </Badge>
                                )}
                            </Button>
                        </View>

                        {/* Save Button */}
                        {(spendingLimits.length > 0 || allowedAddresses.length > 0) && (
                            <Button className="w-full" onPress={handleSave}>
                                <CheckCircleIcon size={16} className="text-primary-foreground mr-2" />
                                <Text className="font-semibold">Save Policies</Text>
                            </Button>
                        )}

                        <Button variant="ghost" className="w-full" onPress={onCancel}>
                            <Text className="text-muted-foreground">Cancel</Text>
                        </Button>
                    </>
                )}

                {step === 'limits' && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Spending Limits
                        </Text>

                        {/* Existing Limits */}
                        {spendingLimits.length > 0 && (
                            <View className="gap-2">
                                {spendingLimits.map((limit) => (
                                    <View
                                        key={limit.id}
                                        className="flex-row items-center justify-between bg-muted rounded-lg p-3"
                                    >
                                        <View className="flex-row items-center gap-2">
                                            <WalletIcon size={16} className="text-muted-foreground" />
                                            <Text className="font-semibold">{limit.amount} {limit.asset}</Text>
                                            <Text className="text-xs text-muted-foreground">
                                                {getPeriodLabel(limit.period)}
                                            </Text>
                                        </View>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => removeSpendingLimit(limit.id)}
                                        >
                                            <TrashIcon size={14} className="text-destructive" />
                                        </Button>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Add New Limit Form */}
                        <View className="border border-border rounded-lg p-3 gap-3">
                            <Text className="text-sm font-medium">Add Spending Limit</Text>
                            <View className="flex-row gap-2">
                                <View className="flex-1">
                                    <Input
                                        placeholder="Amount"
                                        value={newLimitAmount}
                                        onChangeText={setNewLimitAmount}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                                <View className="w-20">
                                    <Input
                                        value={newLimitAsset}
                                        onChangeText={setNewLimitAsset}
                                        placeholder="Asset"
                                    />
                                </View>
                            </View>
                            <View className="flex-row gap-2">
                                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                                    <Button
                                        key={period}
                                        variant={newLimitPeriod === period ? 'default' : 'outline'}
                                        size="sm"
                                        className="flex-1"
                                        onPress={() => setNewLimitPeriod(period)}
                                    >
                                        <ClockIcon size={12} className={newLimitPeriod === period ? 'text-primary-foreground' : 'text-muted-foreground'} />
                                        <Text className="text-xs ml-1 capitalize">{period}</Text>
                                    </Button>
                                ))}
                            </View>
                            <Button variant="secondary" onPress={addSpendingLimit}>
                                <PlusIcon size={14} className="mr-1" />
                                <Text>Add Limit</Text>
                            </Button>
                        </View>

                        <Button variant="outline" onPress={() => setStep('overview')}>
                            <Text>Back to Overview</Text>
                        </Button>
                    </>
                )}

                {step === 'allowlist' && (
                    <>
                        <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Allowed Addresses
                        </Text>

                        {/* Existing Addresses */}
                        {allowedAddresses.length > 0 && (
                            <View className="gap-2">
                                {allowedAddresses.map((addr) => (
                                    <View
                                        key={addr.id}
                                        className="flex-row items-center justify-between bg-muted rounded-lg p-3"
                                    >
                                        <View className="flex-1">
                                            <Text className="font-semibold">{addr.label}</Text>
                                            <Text className="text-xs text-muted-foreground font-mono">
                                                {addr.address.slice(0, 10)}...{addr.address.slice(-8)}
                                            </Text>
                                        </View>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => removeAllowedAddress(addr.id)}
                                        >
                                            <TrashIcon size={14} className="text-destructive" />
                                        </Button>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Add New Address Form */}
                        <View className="border border-border rounded-lg p-3 gap-3">
                            <Text className="text-sm font-medium">Add Allowed Address</Text>
                            <Input
                                placeholder="0x..."
                                value={newAddress}
                                onChangeText={setNewAddress}
                                autoCapitalize="none"
                            />
                            <Input
                                placeholder="Label (e.g., DEX Router)"
                                value={newAddressLabel}
                                onChangeText={setNewAddressLabel}
                            />
                            <Button variant="secondary" onPress={addAllowedAddress}>
                                <PlusIcon size={14} className="mr-1" />
                                <Text>Add Address</Text>
                            </Button>
                        </View>

                        <Button variant="outline" onPress={() => setStep('overview')}>
                            <Text>Back to Overview</Text>
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default WalletPolicies;
