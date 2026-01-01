import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const STORE_KEY = 'user_favorites_v1';

interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await SecureStore.getItemAsync(STORE_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load favorites', e);
        }
    };

    const saveFavorites = async (newFavorites: string[]) => {
        try {
            await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Failed to save favorites', e);
        }
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(id)
                ? prev.filter(fav => fav !== id)
                : [...prev, id];

            saveFavorites(newFavorites);
            return newFavorites;
        });
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
