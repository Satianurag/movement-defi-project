/**
 * USDM Service
 * Handles Meridian USDM stablecoin minting and burning operations.
 * USDM is a CDP (Collateralized Debt Position) style stablecoin.
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const { ADDRESSES } = require('../utils/addressRegistry');

class USDMService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
        });

        this.aptos = new Aptos(aptosConfig);
        this.usdmAddress = ADDRESSES.meridian.usdm.mint;
        this.stabilityPoolAddress = ADDRESSES.meridian.usdm.stabilityPool;

        if (config.serverPrivateKey) {
            try {
                const privateKey = new Ed25519PrivateKey(config.serverPrivateKey);
                this.serverAccount = Account.fromPrivateKey({ privateKey });
            } catch (error) {
                console.error('Failed to initialize server account:', error.message);
            }
        }
    }

    /**
     * Mint USDM stablecoin by depositing collateral
     * @param {string} collateralType - Type of collateral (e.g., MOVE, ETH)
     * @param {string} collateralAmount - Amount of collateral to deposit
     * @param {string} usdmAmount - Amount of USDM to mint
     * @param {string} userAddress - User's address
     */
    async mintUSDM(collateralType, collateralAmount, usdmAmount, userAddress) {
        if (process.env.SIMULATION_MODE === 'true') {
            console.log(`[SIMULATION] Minting ${usdmAmount} USDM with ${collateralAmount} ${collateralType}`);
            return {
                success: true,
                hash: '0xSIMULATED_MINT_USDM_' + Date.now(),
                collateralType,
                collateralAmount: collateralAmount.toString(),
                usdmAmount: usdmAmount.toString(),
                protocol: 'meridian-usdm',
            };
        }

        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.usdmAddress}::trove::open_trove`,
                    typeArguments: [collateralType],
                    functionArguments: [collateralAmount.toString(), usdmAmount.toString()],
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
                collateralType,
                collateralAmount: collateralAmount.toString(),
                usdmAmount: usdmAmount.toString(),
                protocol: 'meridian-usdm',
            };
        } catch (error) {
            throw new Error(`Failed to mint USDM: ${error.message}`);
        }
    }

    /**
     * Generate mint payload for Smart Wallet
     */
    getMintPayload(collateralType, collateralAmount, usdmAmount) {
        return {
            function: `${this.usdmAddress}::trove::open_trove`,
            typeArguments: [collateralType],
            functionArguments: [collateralAmount.toString(), usdmAmount.toString()],
        };
    }

    /**
     * Burn USDM to reclaim collateral
     * @param {string} collateralType - Type of collateral
     * @param {string} usdmAmount - Amount of USDM to burn
     * @param {string} userAddress - User's address
     */
    async burnUSDM(collateralType, usdmAmount, userAddress) {
        if (process.env.SIMULATION_MODE === 'true') {
            console.log(`[SIMULATION] Burning ${usdmAmount} USDM`);
            return {
                success: true,
                hash: '0xSIMULATED_BURN_USDM_' + Date.now(),
                usdmAmount: usdmAmount.toString(),
                protocol: 'meridian-usdm',
            };
        }

        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.usdmAddress}::trove::repay_usdm`,
                    typeArguments: [collateralType],
                    functionArguments: [usdmAmount.toString()],
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
                usdmAmount: usdmAmount.toString(),
                protocol: 'meridian-usdm',
            };
        } catch (error) {
            throw new Error(`Failed to burn USDM: ${error.message}`);
        }
    }

    /**
     * Generate burn payload for Smart Wallet
     */
    getBurnPayload(collateralType, usdmAmount) {
        return {
            function: `${this.usdmAddress}::trove::repay_usdm`,
            typeArguments: [collateralType],
            functionArguments: [usdmAmount.toString()],
        };
    }

    /**
     * Get user's USDM position (collateral ratio)
     */
    async getUserPosition(userAddress, collateralType) {
        try {
            const payload = {
                function: `${this.usdmAddress}::trove::get_trove`,
                typeArguments: [collateralType],
                functionArguments: [userAddress],
            };

            const result = await this.aptos.view({ payload });

            const collateral = parseFloat(result[0] || 0);
            const debt = parseFloat(result[1] || 0);
            const collateralRatio = debt > 0 ? (collateral / debt) * 100 : 0;

            return {
                success: true,
                userAddress,
                collateralType,
                collateral: result[0] || '0',
                debt: result[1] || '0',
                collateralRatio, // Percentage
                status: collateralRatio > 150 ? 'safe' : collateralRatio > 110 ? 'warning' : 'danger',
            };
        } catch (error) {
            return {
                success: true,
                userAddress,
                collateralType,
                collateral: '0',
                debt: '0',
                collateralRatio: 0,
                status: 'none',
            };
        }
    }

    /**
     * Deposit to Stability Pool
     */
    async depositToStabilityPool(amount, userAddress) {
        if (process.env.SIMULATION_MODE === 'true') {
            return {
                success: true,
                hash: '0xSIMULATED_SP_DEPOSIT_' + Date.now(),
                amount: amount.toString(),
                protocol: 'meridian-usdm',
            };
        }

        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.stabilityPoolAddress}::stability_pool::deposit`,
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
                amount: amount.toString(),
                protocol: 'meridian-usdm',
            };
        } catch (error) {
            throw new Error(`Failed to deposit to stability pool: ${error.message}`);
        }
    }

    /**
     * Withdraw from Stability Pool
     */
    async withdrawFromStabilityPool(amount, userAddress) {
        if (process.env.SIMULATION_MODE === 'true') {
            return {
                success: true,
                hash: '0xSIMULATED_SP_WITHDRAW_' + Date.now(),
                amount: amount.toString(),
                protocol: 'meridian-usdm',
            };
        }

        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.stabilityPoolAddress}::stability_pool::withdraw`,
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
                amount: amount.toString(),
                protocol: 'meridian-usdm',
            };
        } catch (error) {
            throw new Error(`Failed to withdraw from stability pool: ${error.message}`);
        }
    }
}

module.exports = USDMService;
