import { useWindowDimensions, Platform } from 'react-native';

export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

export function useResponsive() {
    const { width } = useWindowDimensions();

    const isSM = width >= BREAKPOINTS.sm;
    const isMD = width >= BREAKPOINTS.md;
    const isLG = width >= BREAKPOINTS.lg;
    const isXL = width >= BREAKPOINTS.xl;
    const is2XL = width >= BREAKPOINTS['2xl'];

    // Helper to return values based on breakpoints
    const responsiveValue = <T>(values: {
        base: T;
        sm?: T;
        md?: T;
        lg?: T;
        xl?: T;
        '2xl'?: T;
    }): T => {
        if (is2XL && values['2xl'] !== undefined) return values['2xl'];
        if (isXL && values.xl !== undefined) return values.xl;
        if (isLG && values.lg !== undefined) return values.lg;
        if (isMD && values.md !== undefined) return values.md;
        if (isSM && values.sm !== undefined) return values.sm;
        return values.base;
    };

    // Calculate grid columns
    const numColumns = responsiveValue({
        base: 1,
        md: 2,
        lg: 3,
        xl: 4,
    });

    const isWeb = Platform.OS === 'web';
    const isMobileWeb = isWeb && !isMD;

    return {
        isSM,
        isMD,
        isLG,
        isXL,
        is2XL,
        isWeb,
        isMobileWeb,
        responsiveValue, // Usage: responsiveValue({ base: 16, md: 24, lg: 32 })
        numColumns,
        width
    };
}
