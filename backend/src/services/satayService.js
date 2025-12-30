/**
 * Satay Service
 * Handles deposit/withdraw operations for Satay Finance vaults.
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const { getSatayController } = require('../utils/addressRegistry');

class SatayService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
        });

        this.aptos = new Aptos(aptosConfig);
        this.controllerAddress = getSatayController();

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
     * Deposit to a Satay vault
     * @param {string} vaultAddress - The vault address
     * @param {string} amount - Amount to deposit (in smallest units)
     * @param {string} userAddress - User's wallet address (for tracking)
     */
    async deposit(vaultAddress, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.controllerAddress}::vault::deposit`,
                    typeArguments: [],
                    functionArguments: [vaultAddress, amount.toString()],
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
                vaultAddress,
                amount: amount.toString(),
                userAddress,
                protocol: 'satay',
            };
        } catch (error) {
            console.error('Satay deposit error:', error);
            throw new Error(`Failed to deposit to Satay: ${error.message}`);
        }
    }

    /**
     * Withdraw from a Satay vault
     * @param {string} vaultAddress - The vault address
     * @param {string} shares - Amount of shares to withdraw
     * @param {string} userAddress - User's wallet address (for tracking)
     */
    async withdraw(vaultAddress, shares, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.controllerAddress}::vault::withdraw`,
                    typeArguments: [],
                    functionArguments: [vaultAddress, shares.toString()],
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
                vaultAddress,
                shares: shares.toString(),
                userAddress,
                protocol: 'satay',
            };
        } catch (error) {
            console.error('Satay withdraw error:', error);
            throw new Error(`Failed to withdraw from Satay: ${error.message}`);
        }
    }

    /**
     * Get user's position in a vault
     */
    async getUserPosition(userAddress, vaultAddress) {
        try {
            const payload = {
                function: `${this.controllerAddress}::vault::user_position`,
                typeArguments: [],
                functionArguments: [userAddress, vaultAddress],
            };

            const result = await this.aptos.view({ payload });

            return {
                success: true,
                userAddress,
                vaultAddress,
                shares: result[0] || '0',
                assets: result[1] || '0',
            };
        } catch (error) {
            return {
                success: true,
                userAddress,
                vaultAddress,
                shares: '0',
                assets: '0',
            };
        }
    }
}

module.exports = SatayService;
