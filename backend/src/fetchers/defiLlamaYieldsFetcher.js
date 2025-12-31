/**
 * DefiLlama Yields Fetcher
 * Fetches real APY data from DefiLlama's yields API
 * 
 * API Documentation: https://defillama.com/docs/api
 * Yields Endpoint: https://yields.llama.fi/pools
 * 
 * Data updates hourly. Movement Network is tracked.
 * 
 * @verified December 31, 2025
 */

const axios = require('axios');

class DefiLlamaYieldsFetcher {
    constructor() {
        this.baseURL = 'https://yields.llama.fi';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes (data updates hourly anyway)
    }

    /**
     * Fetch all pools from DefiLlama yields API
     * @returns {Promise<Array>} All pools data
     */
    async getAllPools() {
        const cached = this.cache.get('all-pools');
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await axios.get(`${this.baseURL}/pools`, {
                timeout: 10000
            });

            if (response.data.status === 'success') {
                const pools = response.data.data;
                this.cache.set('all-pools', {
                    data: pools,
                    timestamp: Date.now()
                });
                return pools;
            }

            throw new Error('DefiLlama API returned non-success status');
        } catch (error) {
            console.error('Failed to fetch DefiLlama pools:', error.message);
            throw error;
        }
    }

    /**
     * Get all pools for Movement Network
     * @returns {Promise<Array>} Movement chain pools
     */
    async getMovementPools() {
        const cached = this.cache.get('movement-pools');
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const allPools = await this.getAllPools();

            // Filter for Movement chain pools (case-insensitive)
            const movementPools = allPools.filter(
                pool => pool.chain?.toLowerCase() === 'movement'
            );

            console.log(`Found ${movementPools.length} Movement pools on DefiLlama`);

            this.cache.set('movement-pools', {
                data: movementPools,
                timestamp: Date.now()
            });

            return movementPools;
        } catch (error) {
            console.error('Failed to fetch Movement pools:', error.message);
            return [];
        }
    }

    /**
     * Get APY for a specific pool by pool ID
     * @param {string} poolId - DefiLlama pool UUID
     * @returns {Promise<Object|null>} Pool APY data or null
     */
    async getPoolAPY(poolId) {
        try {
            const pools = await this.getAllPools();
            const pool = pools.find(p => p.pool === poolId);

            if (!pool) return null;

            return {
                apy: pool.apy,           // Total APY
                apyBase: pool.apyBase,   // Base APY (fees)
                apyReward: pool.apyReward, // Reward token APY
                tvlUsd: pool.tvlUsd,
                symbol: pool.symbol,
                project: pool.project,
                chain: pool.chain,
                source: 'defillama',
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Failed to get APY for pool ${poolId}:`, error.message);
            return null;
        }
    }

    /**
     * Get APY for a specific protocol on Movement
     * @param {string} protocolSlug - Protocol slug (e.g., 'meridian')
     * @returns {Promise<Object|null>} Protocol APY data
     */
    async getProtocolAPY(protocolSlug) {
        try {
            const movementPools = await this.getMovementPools();

            const protocolPools = movementPools.filter(p =>
                p.project?.toLowerCase() === protocolSlug.toLowerCase()
            );

            if (protocolPools.length === 0) {
                console.warn(`No pools found for protocol "${protocolSlug}" on Movement`);
                return null;
            }

            // Calculate weighted average APY by TVL
            const totalTVL = protocolPools.reduce((sum, p) => sum + (p.tvlUsd || 0), 0);

            if (totalTVL === 0) {
                // Simple average if no TVL data
                const avgAPY = protocolPools.reduce((sum, p) => sum + (p.apy || 0), 0) / protocolPools.length;
                return {
                    apy: parseFloat(avgAPY.toFixed(2)),
                    poolCount: protocolPools.length,
                    totalTvlUsd: 0,
                    source: 'defillama',
                    method: 'simple_average'
                };
            }

            const weightedAPY = protocolPools.reduce((sum, p) =>
                sum + (p.apy || 0) * (p.tvlUsd || 0), 0) / totalTVL;

            return {
                apy: parseFloat(weightedAPY.toFixed(2)),
                poolCount: protocolPools.length,
                totalTvlUsd: totalTVL,
                pools: protocolPools.map(p => ({
                    symbol: p.symbol,
                    apy: p.apy,
                    tvlUsd: p.tvlUsd
                })),
                source: 'defillama',
                method: 'tvl_weighted_average'
            };
        } catch (error) {
            console.error(`Failed to get protocol APY for ${protocolSlug}:`, error.message);
            return null;
        }
    }

    /**
     * Get APY for a token symbol on Movement (e.g., 'MOVE', 'USDC')
     * @param {string} symbol - Token symbol
     * @returns {Promise<Array>} Matching pools
     */
    async getPoolsBySymbol(symbol) {
        try {
            const movementPools = await this.getMovementPools();

            return movementPools.filter(p =>
                p.symbol?.toUpperCase().includes(symbol.toUpperCase())
            );
        } catch (error) {
            console.error(`Failed to get pools for symbol ${symbol}:`, error.message);
            return [];
        }
    }

    /**
     * Get historical APY data for a specific pool
     * @param {string} poolId - DefiLlama pool UUID
     * @returns {Promise<Array>} Historical data points
     */
    async getPoolHistory(poolId) {
        const cacheKey = `history-${poolId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await axios.get(`${this.baseURL}/chart/${poolId}`, {
                timeout: 10000
            });

            if (response.data.status === 'success') {
                const history = response.data.data;
                this.cache.set(cacheKey, {
                    data: history,
                    timestamp: Date.now()
                });
                return history;
            }

            return [];
        } catch (error) {
            console.error(`Failed to get history for pool ${poolId}:`, error.message);
            return [];
        }
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
        console.log('DefiLlama cache cleared');
    }
}

module.exports = DefiLlamaYieldsFetcher;
