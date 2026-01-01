import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XIcon, AlertTriangleIcon } from 'lucide-react-native';

interface SlippageModalProps {
    visible: boolean;
    onClose: () => void;
    currentSlippage: number;
    onSelectSlippage: (slippage: number) => void;
}

const PRESET_SLIPPAGES = [0.1, 0.5, 1.0];

export function SlippageModal({ visible, onClose, currentSlippage, onSelectSlippage }: SlippageModalProps) {
    const [customSlippage, setCustomSlippage] = useState(currentSlippage.toString());
    const [isCustom, setIsCustom] = useState(!PRESET_SLIPPAGES.includes(currentSlippage));

    useEffect(() => {
        setCustomSlippage(currentSlippage.toString());
        setIsCustom(!PRESET_SLIPPAGES.includes(currentSlippage));
    }, [currentSlippage, visible]);

    const handleSave = () => {
        const value = parseFloat(customSlippage);
        if (!isNaN(value) && value > 0 && value <= 50) {
            onSelectSlippage(value);
            onClose();
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <Card className="w-full max-w-sm bg-background p-6 rounded-3xl">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-foreground">Transaction Settings</Text>
                        <TouchableOpacity onPress={onClose}>
                            <XIcon size={24} className="text-muted-foreground" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-sm font-medium text-foreground mb-3">Slippage Tolerance</Text>

                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {PRESET_SLIPPAGES.map((val) => (
                            <TouchableOpacity
                                key={val}
                                onPress={() => {
                                    setIsCustom(false);
                                    setCustomSlippage(val.toString());
                                    onSelectSlippage(val);
                                }}
                                className={`px-4 py-2 rounded-full border ${!isCustom && currentSlippage === val
                                        ? 'bg-primary border-primary'
                                        : 'bg-muted border-transparent'
                                    }`}
                            >
                                <Text
                                    className={`font-medium ${!isCustom && currentSlippage === val ? 'text-primary-foreground' : 'text-muted-foreground'
                                        }`}
                                >
                                    {val}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setIsCustom(true)}
                            className={`px-4 py-2 rounded-full border ${isCustom ? 'bg-primary/10 border-primary' : 'bg-muted border-transparent'
                                }`}
                        >
                            <Text
                                className={`font-medium ${isCustom ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                Custom
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {isCustom && (
                        <View className="flex-row items-center bg-muted/50 border border-border rounded-xl px-4 h-12 mb-4">
                            <TextInput
                                className="flex-1 text-foreground font-medium text-lg h-full"
                                keyboardType="numeric"
                                value={customSlippage}
                                onChangeText={setCustomSlippage}
                                placeholder="0.5"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text className="text-muted-foreground font-bold">%</Text>
                        </View>
                    )}

                    {parseFloat(customSlippage) > 5 && (
                        <View className="flex-row items-center gap-2 bg-amber-500/10 p-3 rounded-lg mb-4">
                            <AlertTriangleIcon size={16} className="text-amber-500" />
                            <Text className="text-amber-500 text-xs flex-1">
                                High slippage may result in an unfavorable trade.
                            </Text>
                        </View>
                    )}

                    <Button onPress={handleSave} className="w-full">
                        <Text className="text-primary-foreground font-bold">Save Settings</Text>
                    </Button>
                </Card>
            </View>
        </Modal>
    );
}
