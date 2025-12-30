import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { XIcon, SearchIcon, CheckIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

export interface Token {
    symbol: string;
    name: string;
    logoURI?: string;
    balance?: string;
    decimals: number;
}

interface TokenSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (token: Token) => void;
    tokens: Token[];
    selectedToken?: string;
}

export function TokenSelector({ visible, onClose, onSelect, tokens, selectedToken }: TokenSelectorProps) {
    const [search, setSearch] = useState('');
    const { colorScheme } = useColorScheme();
    const theme = THEME[colorScheme ?? 'light'];

    const filteredTokens = tokens.filter(t =>
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-background pt-4">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 pb-4 border-b border-border">
                    <Text className="text-lg font-bold">Select Token</Text>
                    <Button variant="ghost" size="icon" onPress={onClose}>
                        <XIcon size={24} className="text-foreground" />
                    </Button>
                </View>

                {/* Search */}
                <View className="p-4">
                    <View className="flex-row items-center bg-muted rounded-xl px-3 h-12 border border-border focus:border-primary">
                        <SearchIcon size={20} className="text-muted-foreground mr-2" />
                        <TextInput
                            className="flex-1 text-base text-foreground h-full"
                            placeholder="Search name or paste address"
                            placeholderTextColor={theme.mutedForeground}
                            value={search}
                            onChangeText={setSearch}
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* List */}
                <FlatList
                    data={filteredTokens}
                    keyExtractor={item => item.symbol}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                onSelect(item);
                                onClose();
                            }}
                            className={`flex-row items-center justify-between py-4 border-b border-border ${selectedToken === item.symbol ? 'opacity-50' : ''}`}
                            disabled={selectedToken === item.symbol}
                        >
                            <View className="flex-row items-center gap-3">
                                {/* Token Icon Placeholder */}
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                    <Text className="font-bold text-primary">{item.symbol[0]}</Text>
                                </View>
                                <View>
                                    <Text className="font-semibold text-base">{item.name}</Text>
                                    <Text className="text-sm text-muted-foreground">{item.symbol}</Text>
                                </View>
                            </View>

                            <View className="items-end">
                                {item.balance ? (
                                    <>
                                        <Text className="font-medium">{item.balance}</Text>
                                        <Text className="text-xs text-muted-foreground">0.00</Text>
                                    </>
                                ) : (
                                    selectedToken === item.symbol && <CheckIcon size={20} className="text-primary" />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
}
