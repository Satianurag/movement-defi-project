/**
 * Meridian Fetcher
 * Fetches on-chain data from Meridian DEX (AMM).
 */

const axios = require('axios');
const { ADDRESSES } = require('../utils/addressRegistry');

class MeridianFetcher {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl || 'https://mainnet.movementnetwork.xyz/v1';
        this.routerAddress = ADDRESSES.meridian.router;
    }

    /**
     * Get liquidity pool info
     * Note: Meridian may not expose a view function for pool data
     */
    async getPoolInfo(tokenA, tokenB) {
        try {
            const response = await axios.post(`${this.rpcUrl}/view`, {
                function: `${this.routerAddress}::router::get_pool`,
                type_arguments: [],
                arguments: [tokenA, tokenB],
            });

            if (!response.data || !response.data[0]) {
                return null;
            }

            return {
                tokenA,
                tokenB,
                data: response.data[0],
            };
        } catch (error) {
            // View function might not be exposed
            return null;
        }
    }

    /**
     * Get router address
     */
    getRouterAddress() {
        return this.routerAddress;
    }

    /**
     * Get supported trading pairs (static configuration)
     */
    getSupportedPairs() {
        return [
            { tokenA: 'MOVE', tokenB: 'USDC.e', pool: 'MOVE-USDC' },
            { tokenA: 'MOVE', tokenB: 'USDT.e', pool: 'MOVE-USDT' },
            { tokenA: 'WETH.e', tokenB: 'USDC.e', pool: 'WETH-USDC' },
            { tokenA: 'WBTC.e', tokenB: 'USDC.e', pool: 'WBTC-USDC' },
            { tokenA: 'USDC.e', tokenB: 'USDT.e', pool: 'USDC-USDT' },
        ];
    }

    /**
     * Get DEX summary for metrics
     */
    async getDEXSummary() {
        return {
            name: 'Meridian',
            type: 'dex',
            router: this.routerAddress,
            pairs: this.getSupportedPairs(),
            category: 'Dexs',
        };
    }
}

module.exports = MeridianFetcher;
