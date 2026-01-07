/**
 * Touch Target & Accessibility Constants
 * Following Apple HIG (44pt) and Android Material Design (48dp) guidelines
 */

// Minimum touch target size (Apple HIG recommends 44pt, we use dp for cross-platform)
export const TOUCH_TARGET = {
    MIN_SIZE: 44, // Minimum touch target size in dp
    MIN_SPACING: 8, // Minimum spacing between touch targets in dp
    COMFORTABLE_SIZE: 48, // Comfortable touch target size for primary actions
    LARGE_SIZE: 56, // Large touch target for important CTAs
} as const;

// Button sizes that meet accessibility guidelines
export const ACCESSIBLE_BUTTON_SIZE = {
    sm: {
        height: 36,
        minWidth: 64,
        touchPadding: 4, // Add to each side to reach 44dp
    },
    default: {
        height: 44, // Meets minimum
        minWidth: 88,
        touchPadding: 0,
    },
    lg: {
        height: 52,
        minWidth: 96,
        touchPadding: 0,
    },
    xl: {
        height: 60,
        minWidth: 120,
        touchPadding: 0,
    },
} as const;

// Icon button sizes (for icon-only buttons)
export const ICON_BUTTON_SIZE = {
    sm: 36, // With hitSlop to reach 44dp
    default: 44, // Meets minimum
    lg: 48,
} as const;

// HitSlop helper for small touch targets
export const createHitSlop = (currentSize: number, targetSize: number = TOUCH_TARGET.MIN_SIZE) => {
    const padding = Math.max(0, (targetSize - currentSize) / 2);
    return {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
    };
};

// Common hitSlop values
export const HIT_SLOP = {
    // For 24px icons
    icon24: { top: 10, right: 10, bottom: 10, left: 10 },
    // For 20px icons  
    icon20: { top: 12, right: 12, bottom: 12, left: 12 },
    // For 16px icons
    icon16: { top: 14, right: 14, bottom: 14, left: 14 },
    // Generic comfortable slop
    comfortable: { top: 8, right: 8, bottom: 8, left: 8 },
} as const;

// Accessibility helper - generates proper accessibility props
export const createAccessibilityProps = (label: string, hint?: string, role: 'button' | 'link' | 'image' | 'text' = 'button') => ({
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
});
