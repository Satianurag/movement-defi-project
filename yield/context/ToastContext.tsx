import React, { createContext, useContext, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Toast, ToastType } from '@/components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* 
 * Usage:
 * const { showToast } = useToast();
 * showToast('Success!', 'Transaction complete', 'success');
 */

type ToastData = {
    id: string;
    type: ToastType;
    message: string;
    title?: string;
};

interface ToastContextType {
    showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const insets = useSafeAreaInsets();

    const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, type, message, title }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View
                className="absolute top-0 left-0 right-0 z-50 pointer-events-none"
                style={{ paddingTop: insets.top + 10 }}
            >
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
