/**
 * Meridian Service
 * Handles swap and liquidity operations for Meridian DEX.
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const { ADDRESSES } = require('../utils/addressRegistry');

class MeridianService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
        });

        this.aptos = new Aptos(aptosConfig);
        this.routerAddress = ADDRESSES.meridian.router;

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
     * Swap tokens via Meridian router
     * @param {string} tokenIn - Input token address
     * @param {string} tokenOut - Output token address
     * @param {string} amountIn - Amount to swap
     * @param {string} minAmountOut - Minimum output amount (slippage protection)
     */
    async swap(tokenIn, tokenOut, amountIn, minAmountOut, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.routerAddress}::router::swap_exact_input`,
                    typeArguments: [tokenIn, tokenOut],
                    functionArguments: [amountIn.toString(), minAmountOut.toString()],
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
                tokenIn,
                tokenOut,
                amountIn: amountIn.toString(),
                protocol: 'meridian',
            };
        } catch (error) {
            console.error('Meridian swap error:', error);
            throw new Error(`Failed to swap on Meridian: ${error.message}`);
        }
    }

    /**
     * Add liquidity to a pool
     */
    async addLiquidity(tokenA, tokenB, amountA, amountB, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.routerAddress}::router::add_liquidity`,
                    typeArguments: [tokenA, tokenB],
                    functionArguments: [
                        amountA.toString(),
                        amountB.toString(),
                        '0', // min A
                        '0', // min B
                    ],
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
                tokenA,
                tokenB,
                amountA: amountA.toString(),
                amountB: amountB.toString(),
                protocol: 'meridian',
            };
        } catch (error) {
            throw new Error(`Failed to add liquidity: ${error.message}`);
        }
    }

    /**
     * Remove liquidity from a pool
     */
    async removeLiquidity(tokenA, tokenB, lpTokenAmount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.routerAddress}::router::remove_liquidity`,
                    typeArguments: [tokenA, tokenB],
                    functionArguments: [
                        lpTokenAmount.toString(),
                        '0', // min A
                        '0', // min B
                    ],
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
                tokenA,
                tokenB,
                lpTokenAmount: lpTokenAmount.toString(),
                protocol: 'meridian',
            };
        } catch (error) {
            throw new Error(`Failed to remove liquidity: ${error.message}`);
        }
    }

    /**
     * Get reserves for a pair to calculate optimal swap
     * @throws {Error} If reserves cannot be fetched from on-chain
     */
    async getReserves(tokenA, tokenB) {
        try {
            const payload = {
                function: `${this.routerAddress}::router::get_reserves`,
                type_arguments: [tokenA, tokenB],
                arguments: [],
            };

            const result = await this.aptos.view({ payload });
            return {
                reserveA: BigInt(result[0]),
                reserveB: BigInt(result[1]),
            };
        } catch (error) {
            // REMOVED: Mock fallback reserves
            // Swap service must handle this error gracefully
            throw new Error(`Failed to fetch reserves for ${tokenA}/${tokenB}: ${error.message}`);
        }
    }
}

module.exports = MeridianService;
