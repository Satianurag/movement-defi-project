/**
 * Echelon Lending Service - Fixed
 * Uses correct function signatures based on Echelon protocol ABI.
 * Uses centralized address registry.
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const { ADDRESSES, getEchelonMarket } = require('../utils/addressRegistry');

class EchelonService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
        });

        this.aptos = new Aptos(aptosConfig);
        this.serverPrivateKey = config.serverPrivateKey;

        if (this.serverPrivateKey) {
            try {
                const privateKey = new Ed25519PrivateKey(this.serverPrivateKey);
                this.serverAccount = Account.fromPrivateKey({ privateKey });
            } catch (error) {
                console.error('Failed to initialize server account:', error.message);
            }
        }
    }

    getMarketAddress(asset) {
        return getEchelonMarket(asset);
    }

    getSupportedMarkets() {
        return Object.keys(ADDRESSES.echelon.markets).map(asset => ({
            asset,
            address: ADDRESSES.echelon.markets[asset],
        }));
    }

    async supply(marketAddress, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            // Build the transaction
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::supply`,
                    typeArguments: [],
                    functionArguments: [amount.toString()],
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            const response = await this.aptos.waitForTransaction({
                transactionHash: committedTxn.hash,
            });

            return {
                success: true,
                hash: committedTxn.hash,
                response,
                marketAddress,
                amount: amount.toString(),
                userAddress,
            };
        } catch (error) {
            console.error('Supply error:', error);
            throw new Error(`Failed to supply: ${error.message}`);
        }
    }

    async withdraw(marketAddress, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::withdraw`,
                    typeArguments: [],
                    functionArguments: [amount.toString()],
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            const response = await this.aptos.waitForTransaction({
                transactionHash: committedTxn.hash,
            });

            return {
                success: true,
                hash: committedTxn.hash,
                response,
                marketAddress,
                amount: amount.toString(),
                userAddress,
            };
        } catch (error) {
            console.error('Withdraw error:', error);
            throw new Error(`Failed to withdraw: ${error.message}`);
        }
    }

    async getUserPosition(userAddress, marketAddress) {
        try {
            const payload = {
                function: `${marketAddress}::lending_pool::get_user_position`,
                typeArguments: [],
                functionArguments: [userAddress],
            };

            const result = await this.aptos.view({ payload });

            return {
                success: true,
                userAddress,
                marketAddress,
                supplied: result[0] || '0',
                borrowed: result[1] || '0',
            };
        } catch (error) {
            // Return zero positions if not found
            return {
                success: true,
                userAddress,
                marketAddress,
                supplied: '0',
                borrowed: '0',
            };
        }
    }

    async getMarketInfo(marketAddress) {
        try {
            const payload = {
                function: `${marketAddress}::lending_pool::get_market_info`,
                typeArguments: [],
                functionArguments: [],
            };

            const result = await this.aptos.view({ payload });

            return {
                success: true,
                marketAddress,
                totalSupplied: result[0] || '0',
                totalBorrowed: result[1] || '0',
                supplyRate: result[2] || '0',
                borrowRate: result[3] || '0',
            };
        } catch (error) {
            return {
                success: false,
                marketAddress,
                error: error.message,
            };
        }
    }

    // ============================================
    // BORROWING FUNCTIONALITY
    // ============================================

    /**
     * Borrow assets from the lending pool
     * @param {string} marketAddress - Market to borrow from
     * @param {string} amount - Amount to borrow
     * @param {string} userAddress - Borrower's address
     */
    async borrow(marketAddress, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::borrow`,
                    typeArguments: [],
                    functionArguments: [amount.toString()],
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            await this.aptos.waitForTransaction({ transactionHash: committedTxn.hash });

            return {
                success: true,
                hash: committedTxn.hash,
                marketAddress,
                amount: amount.toString(),
                userAddress,
                protocol: 'echelon',
            };
        } catch (error) {
            console.error('Borrow error:', error);
            throw new Error(`Failed to borrow: ${error.message}`);
        }
    }

    /**
     * Generate borrow payload for Smart Wallet signing
     */
    getBorrowPayload(marketAddress, amount) {
        return {
            function: `${marketAddress}::lending_pool::borrow`,
            typeArguments: [],
            functionArguments: [amount.toString()],
        };
    }

    /**
     * Repay borrowed assets
     * @param {string} marketAddress - Market to repay to
     * @param {string} amount - Amount to repay
     * @param {string} userAddress - Borrower's address
     */
    async repay(marketAddress, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::repay`,
                    typeArguments: [],
                    functionArguments: [amount.toString()],
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            await this.aptos.waitForTransaction({ transactionHash: committedTxn.hash });

            return {
                success: true,
                hash: committedTxn.hash,
                marketAddress,
                amount: amount.toString(),
                userAddress,
                protocol: 'echelon',
            };
        } catch (error) {
            throw new Error(`Failed to repay: ${error.message}`);
        }
    }

    /**
     * Generate repay payload for Smart Wallet signing
     */
    getRepayPayload(marketAddress, amount) {
        return {
            function: `${marketAddress}::lending_pool::repay`,
            typeArguments: [],
            functionArguments: [amount.toString()],
        };
    }

    /**
     * Get user's health factor (liquidation risk metric)
     * Health Factor > 1 = Safe, < 1 = Liquidatable
     */
    async getHealthFactor(userAddress) {
        try {
            const coreAddress = ADDRESSES.echelon.core;
            const payload = {
                function: `${coreAddress}::account::get_health_factor`,
                typeArguments: [],
                functionArguments: [userAddress],
            };

            const result = await this.aptos.view({ payload });

            // Health factor is typically returned as a scaled integer (e.g., 1e18 = 1.0)
            const healthFactor = parseFloat(result[0]) / 1e18;

            return {
                success: true,
                userAddress,
                healthFactor,
                status: healthFactor > 1.5 ? 'safe' : healthFactor > 1.0 ? 'warning' : 'danger',
                description: healthFactor > 1.5
                    ? 'Your position is healthy'
                    : healthFactor > 1.0
                        ? 'Consider adding collateral or repaying debt'
                        : 'Position at risk of liquidation!',
            };
        } catch (error) {
            console.warn('Failed to fetch health factor:', error.message);
            return {
                success: true,
                userAddress,
                healthFactor: null,
                status: 'unknown',
                description: 'Unable to calculate health factor',
            };
        }
    }

    /**
     * Enable an asset as collateral
     */
    async enableAsCollateral(marketAddress, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::enable_as_collateral`,
                    typeArguments: [],
                    functionArguments: [],
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            await this.aptos.waitForTransaction({ transactionHash: committedTxn.hash });

            return {
                success: true,
                hash: committedTxn.hash,
                marketAddress,
                enabled: true,
            };
        } catch (error) {
            throw new Error(`Failed to enable collateral: ${error.message}`);
        }
    }

    /**
     * Disable an asset as collateral
     */
    async disableAsCollateral(marketAddress, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::disable_as_collateral`,
                    typeArguments: [],
                    functionArguments: [],
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            await this.aptos.waitForTransaction({ transactionHash: committedTxn.hash });

            return {
                success: true,
                hash: committedTxn.hash,
                marketAddress,
                enabled: false,
            };
        } catch (error) {
            throw new Error(`Failed to disable collateral: ${error.message}`);
        }
    }

    /**
     * Get collateral toggle payloads for Smart Wallet
     */
    getEnableCollateralPayload(marketAddress) {
        return {
            function: `${marketAddress}::lending_pool::enable_as_collateral`,
            typeArguments: [],
            functionArguments: [],
        };
    }

    getDisableCollateralPayload(marketAddress) {
        return {
            function: `${marketAddress}::lending_pool::disable_as_collateral`,
            typeArguments: [],
            functionArguments: [],
        };
    }

    /**
     * Get supply payload for Smart Wallet
     */
    getSupplyPayload(marketAddress, amount) {
        return {
            function: `${marketAddress}::lending_pool::supply`,
            typeArguments: [],
            functionArguments: [amount.toString()],
        };
    }

    /**
     * Get withdraw payload for Smart Wallet
     */
    getWithdrawPayload(marketAddress, amount) {
        return {
            function: `${marketAddress}::lending_pool::withdraw`,
            typeArguments: [],
            functionArguments: [amount.toString()],
        };
    }
}

module.exports = EchelonService;
