import { Easing, withSpring, withTiming, Layout, FadeIn, FadeOut } from 'react-native-reanimated';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const DURATION = {
    FAST: 300,
    NORMAL: 500,
    SLOW: 700,
    X_SLOW: 1000,
};

export const SPRING_CONFIG = {
    DEFAULT: { damping: 15, stiffness: 100 },
    BOUNCY: { damping: 10, stiffness: 120 },
    STIFF: { damping: 20, stiffness: 200 },
};

export const EASING = {
    DEFAULT: Easing.out(Easing.exp),
    IN_OUT: Easing.inOut(Easing.cubic),
    ELASTIC: Easing.elastic(1),
};

// -----------------------------------------------------------------------------
// Layout Transitions
// -----------------------------------------------------------------------------

export const LayoutTransition = Layout.springify().damping(15).stiffness(100);

export const FadeInStagger = (index: number = 0, duration: number = DURATION.NORMAL) =>
    FadeIn.delay(index * 100).duration(duration).easing(EASING.DEFAULT);

export const FadeOutStagger = (index: number = 0, duration: number = DURATION.FAST) =>
    FadeOut.delay(index * 50).duration(duration).easing(EASING.DEFAULT);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Returns a standard spring animation with optional config override
 */
export const spring = (toValue: number, config?: any) => {
    'worklet';
    return withSpring(toValue, config || SPRING_CONFIG.DEFAULT);
};

/**
 * Returns a standard timing animation with optional config override
 */
export const timing = (toValue: number, duration: number = DURATION.NORMAL) => {
    'worklet';
    return withTiming(toValue, { duration, easing: EASING.DEFAULT });
};
