/**
 * MST Staking Service
 * Handles Meridian Staking Token (MST) staking operations.
 * MST holders stake to earn protocol fee revenue.
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const { ADDRESSES } = require('../utils/addressRegistry');

class MSTStakingService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
        });

        this.aptos = new Aptos(aptosConfig);
        this.stakingAddress = ADDRESSES.meridian.mstStaking;

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
     * Stake MST tokens
     * @param {string} amount - Amount of MST to stake
     * @param {string} userAddress - User's address
     */
    async stake(amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.stakingAddress}::mst_staking::stake`,
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
                protocol: 'meridian-mst',
            };
        } catch (error) {
            throw new Error(`Failed to stake MST: ${error.message}`);
        }
    }

    /**
     * Generate stake payload for Smart Wallet
     */
    getStakePayload(amount) {
        return {
            function: `${this.stakingAddress}::mst_staking::stake`,
            typeArguments: [],
            functionArguments: [amount.toString()],
        };
    }

    /**
     * Unstake MST tokens
     * @param {string} amount - Amount of MST to unstake
     * @param {string} userAddress - User's address
     */
    async unstake(amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.stakingAddress}::mst_staking::unstake`,
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
                protocol: 'meridian-mst',
            };
        } catch (error) {
            throw new Error(`Failed to unstake MST: ${error.message}`);
        }
    }

    /**
     * Generate unstake payload for Smart Wallet
     */
    getUnstakePayload(amount) {
        return {
            function: `${this.stakingAddress}::mst_staking::unstake`,
            typeArguments: [],
            functionArguments: [amount.toString()],
        };
    }

    /**
     * Claim staking rewards
     */
    async claimRewards(userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.stakingAddress}::mst_staking::claim_rewards`,
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
                protocol: 'meridian-mst',
            };
        } catch (error) {
            throw new Error(`Failed to claim MST rewards: ${error.message}`);
        }
    }

    /**
     * Generate claim rewards payload for Smart Wallet
     */
    getClaimRewardsPayload() {
        return {
            function: `${this.stakingAddress}::mst_staking::claim_rewards`,
            typeArguments: [],
            functionArguments: [],
        };
    }

    /**
     * Get user's staking info
     */
    async getStakingInfo(userAddress) {
        try {
            const payload = {
                function: `${this.stakingAddress}::mst_staking::get_user_info`,
                typeArguments: [],
                functionArguments: [userAddress],
            };

            const result = await this.aptos.view({ payload });

            return {
                success: true,
                userAddress,
                stakedAmount: result[0] || '0',
                pendingRewards: result[1] || '0',
                stakingSince: result[2] || null,
            };
        } catch (error) {
            return {
                success: true,
                userAddress,
                stakedAmount: '0',
                pendingRewards: '0',
                stakingSince: null,
            };
        }
    }

    /**
     * Get total staking stats
     */
    async getStakingStats() {
        try {
            const payload = {
                function: `${this.stakingAddress}::mst_staking::get_stats`,
                typeArguments: [],
                functionArguments: [],
            };

            const result = await this.aptos.view({ payload });

            return {
                success: true,
                totalStaked: result[0] || '0',
                apr: this.calculateAPR(result),
                totalStakers: result[2] || 0,
            };
        } catch (error) {
            console.error('Failed to fetch staking stats:', error.message);
            throw new Error('Failed to fetch staking stats from on-chain. Please try again later.');
        }
    }

    /**
     * Calculate APR from protocol fees
     */
    calculateAPR(data) {
        // Calculate APR from on-chain data
        // APR = (Annual Reward / Total Staked) * 100
        if (data && data[0] && data[1]) {
            const totalStaked = parseFloat(data[0]);
            const rewardsPerYear = parseFloat(data[1]) * 365 * 24; // Assuming hourly rewards
            if (totalStaked > 0) {
                return parseFloat(((rewardsPerYear / totalStaked) * 100).toFixed(2));
            }
        }
        // Return null if we can't calculate - caller should fetch from DefiLlama
        return null;
    }
}

module.exports = MSTStakingService;
