/**
 * Meridian Farm Service
 * Handles LP token staking, unstaking, and reward claiming for Meridian Farms.
 * 
 * Farm Structure (MasterChef-like):
 * - Users stake LP tokens to earn farming rewards
 * - Rewards accumulate over time based on farm multiplier
 * - Users can claim rewards or unstake at any time
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const { ADDRESSES } = require('../utils/addressRegistry');

class MeridianFarmService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
        });

        this.aptos = new Aptos(aptosConfig);
        this.farmAddress = ADDRESSES.meridian.farm;

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
     * Get all available farms
     * @returns {Promise<Array>} List of farms with their details
     */
    async getAllFarms() {
        try {
            const payload = {
                function: `${this.farmAddress}::farm::get_all_farms`,
                type_arguments: [],
                arguments: [],
            };

            const result = await this.aptos.view({ payload });

            return result.map((farm, index) => ({
                farmId: index,
                lpToken: farm.lp_token || 'Unknown',
                rewardToken: farm.reward_token || 'MOVE',
                totalStaked: farm.total_staked || '0',
                multiplier: farm.multiplier || 1,
                apr: this.calculateFarmAPR(farm),
            }));
        } catch (error) {
            console.warn('Failed to fetch farms, returning mock data:', error.message);
            // Return mock data for development/testing
            return [
                {
                    farmId: 0,
                    lpToken: 'MOVE-USDC LP',
                    rewardToken: 'MST',
                    totalStaked: '1000000000000',
                    multiplier: 2,
                    apr: 45.5,
                },
                {
                    farmId: 1,
                    lpToken: 'MOVE-ETH LP',
                    rewardToken: 'MST',
                    totalStaked: '500000000000',
                    multiplier: 1.5,
                    apr: 32.8,
                },
            ];
        }
    }

    /**
     * Get user's staked positions in farms
     * @param {string} userAddress - User's wallet address
     * @returns {Promise<Array>} User's farm positions
     */
    async getUserFarmPositions(userAddress) {
        try {
            const payload = {
                function: `${this.farmAddress}::farm::get_user_positions`,
                type_arguments: [],
                arguments: [userAddress],
            };

            const result = await this.aptos.view({ payload });

            return result.map(position => ({
                farmId: position.farm_id,
                stakedAmount: position.staked_amount || '0',
                pendingRewards: position.pending_rewards || '0',
                stakedAt: position.staked_at,
            }));
        } catch (error) {
            console.warn('Failed to fetch user positions:', error.message);
            return [];
        }
    }

    /**
     * Get pending rewards for a user in a specific farm
     * @param {number} farmId - Farm identifier
     * @param {string} userAddress - User's wallet address
     * @returns {Promise<Object>} Pending reward amount
     */
    async getPendingRewards(farmId, userAddress) {
        try {
            const payload = {
                function: `${this.farmAddress}::farm::pending_reward`,
                type_arguments: [],
                arguments: [farmId.toString(), userAddress],
            };

            const result = await this.aptos.view({ payload });

            return {
                farmId,
                userAddress,
                pendingRewards: result[0] || '0',
                rewardToken: 'MST',
            };
        } catch (error) {
            console.warn('Failed to fetch pending rewards:', error.message);
            return {
                farmId,
                userAddress,
                pendingRewards: '0',
                rewardToken: 'MST',
            };
        }
    }

    /**
     * Generate stake LP tokens payload (for Smart Wallet signing)
     * @param {number} farmId - Farm to stake in
     * @param {string} lpTokenType - LP token type
     * @param {string} amount - Amount to stake
     * @returns {Object} Transaction payload
     */
    getStakePayload(farmId, lpTokenType, amount) {
        return {
            function: `${this.farmAddress}::farm::stake`,
            typeArguments: [lpTokenType],
            functionArguments: [farmId.toString(), amount.toString()],
        };
    }

    /**
     * Stake LP tokens into a farm (server-signed for custodial mode)
     */
    async stakeLPTokens(farmId, lpTokenType, amount, userAddress) {
        if (process.env.SIMULATION_MODE === 'true') {
            console.log(`[SIMULATION] Staking ${amount} LP tokens in farm ${farmId}`);
            return {
                success: true,
                hash: '0xSIMULATED_STAKE_HASH_' + Date.now(),
                farmId,
                amount: amount.toString(),
                protocol: 'meridian-farm',
            };
        }

        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.farmAddress}::farm::stake`,
                    typeArguments: [lpTokenType],
                    functionArguments: [farmId.toString(), amount.toString()],
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
                farmId,
                amount: amount.toString(),
                userAddress,
                protocol: 'meridian-farm',
            };
        } catch (error) {
            console.error('Stake LP error:', error);
            throw new Error(`Failed to stake LP tokens: ${error.message}`);
        }
    }

    /**
     * Generate unstake LP tokens payload
     */
    getUnstakePayload(farmId, lpTokenType, amount) {
        return {
            function: `${this.farmAddress}::farm::unstake`,
            typeArguments: [lpTokenType],
            functionArguments: [farmId.toString(), amount.toString()],
        };
    }

    /**
     * Unstake LP tokens from a farm
     */
    async unstakeLPTokens(farmId, lpTokenType, amount, userAddress) {
        if (process.env.SIMULATION_MODE === 'true') {
            console.log(`[SIMULATION] Unstaking ${amount} LP tokens from farm ${farmId}`);
            return {
                success: true,
                hash: '0xSIMULATED_UNSTAKE_HASH_' + Date.now(),
                farmId,
                amount: amount.toString(),
                protocol: 'meridian-farm',
            };
        }

        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.farmAddress}::farm::unstake`,
                    typeArguments: [lpTokenType],
                    functionArguments: [farmId.toString(), amount.toString()],
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
                farmId,
                amount: amount.toString(),
                userAddress,
                protocol: 'meridian-farm',
            };
        } catch (error) {
            throw new Error(`Failed to unstake LP tokens: ${error.message}`);
        }
    }

    /**
     * Generate claim rewards payload
     */
    getClaimRewardsPayload(farmId) {
        return {
            function: `${this.farmAddress}::farm::claim_rewards`,
            typeArguments: [],
            functionArguments: [farmId.toString()],
        };
    }

    /**
     * Claim pending farm rewards
     */
    async claimFarmRewards(farmId, userAddress) {
        if (process.env.SIMULATION_MODE === 'true') {
            console.log(`[SIMULATION] Claiming rewards from farm ${farmId}`);
            return {
                success: true,
                hash: '0xSIMULATED_CLAIM_HASH_' + Date.now(),
                farmId,
                protocol: 'meridian-farm',
            };
        }

        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${this.farmAddress}::farm::claim_rewards`,
                    typeArguments: [],
                    functionArguments: [farmId.toString()],
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
                farmId,
                userAddress,
                protocol: 'meridian-farm',
            };
        } catch (error) {
            throw new Error(`Failed to claim rewards: ${error.message}`);
        }
    }

    /**
     * Calculate farm APR based on farm data
     */
    calculateFarmAPR(farm) {
        // Formula: (rewardPerBlock * blocksPerYear * multiplier * rewardPrice) / (totalStaked * lpPrice) * 100
        // Simplified for now - in production would use real price data
        const baseAPR = 20; // Base 20% APR
        const multiplierBonus = (farm.multiplier || 1) * 10;
        return baseAPR + multiplierBonus;
    }
}

module.exports = MeridianFarmService;
