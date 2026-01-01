import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

export function MFASetup({ onEnabled, onCancel }: { onEnabled: () => void; onCancel: () => void }) {
    return (
        <View className="gap-4 items-center justify-center flex-1">
            <Text className="text-lg font-bold">Setup Multi-Factor Authentication</Text>
            <Text className="text-muted-foreground text-center mb-4">
                Enhance your account security by enabling 2FA.
            </Text>
            <Button onPress={onEnabled} className="w-full">
                <Text>Enable MFA</Text>
            </Button>
            <Button variant="ghost" onPress={onCancel} className="w-full">
                <Text>Cancel</Text>
            </Button>
        </View>
    );
}
