// Web shim for expo-application
// On web, expo-application doesn't have native functionality
// This provides the minimum required values for Privy SDK to work

export const applicationId = 'com.anonymous.yield';
export const applicationName = 'yield';
export const nativeApplicationVersion = '1.0.0';
export const nativeBuildVersion = '1';

export async function getAndroidIdAsync() {
    return null;
}

export async function getInstallReferrerAsync() {
    return null;
}

export async function getIosIdForVendorAsync() {
    return null;
}

export async function getApplicationReleaseTypeAsync() {
    return 0; // Unknown
}

export async function getPushNotificationServiceEnvironmentAsync() {
    return null;
}

export async function getInstallationTimeAsync() {
    return new Date();
}

export async function getLastUpdateTimeAsync() {
    return new Date();
}
