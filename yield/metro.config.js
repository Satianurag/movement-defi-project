const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force all uuid imports to use the root uuid package (avoids nested ESM wrapper issues)
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    uuid: path.resolve(__dirname, 'node_modules/uuid'),
};

// Enable package exports for Privy SDK compatibility
const resolveRequestWithPackageExports = (context, moduleName, platform) => {
    // On web, use our custom expo-application shim that provides mock applicationId
    // This is needed because expo-application doesn't support web and Privy SDK requires it
    if (moduleName === "expo-application" && platform === "web") {
        return {
            filePath: path.resolve(__dirname, 'lib/expo-application-web-shim.ts'),
            type: 'sourceFile',
        };
    }

    // Package exports in `isows` (a `viem` dependency) are incompatible
    if (moduleName === "isows") {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Package exports in `uuid` are incompatible with React Native bundler
    // Force it to use CommonJS version by disabling package exports
    if (moduleName === "uuid" || moduleName.startsWith("uuid/")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
            unstable_conditionNames: ["require", "node", "default"],
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Package exports in `permissionless` need to be enabled but use default/import conditions
    // The package has proper ESM and CJS output, we just need to ensure correct resolution
    if (moduleName === "permissionless" || moduleName.startsWith("permissionless/")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: true,
            unstable_conditionNames: ["import", "default"],
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Package exports in `zustand@4` are incompatible
    if (moduleName.startsWith("zustand")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Package exports in `jose` are incompatible, use browser version
    if (moduleName === "jose") {
        const ctx = {
            ...context,
            unstable_conditionNames: ["browser"],
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Disable package exports for @noble/hashes to silence resolution warnings
    // (It falls back to file-based resolution anyway, this just makes it explicit)
    if (moduleName.startsWith('@noble/hashes')) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Enable package exports for Privy packages
    if (moduleName.startsWith('@privy-io/')) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: true,
        };
        return ctx.resolveRequest(ctx, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });

