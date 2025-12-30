/**
 * Echelon Fetcher
 * Fetches on-chain market data from Echelon lending protocol.
 */

const axios = require('axios');
const { ADDRESSES } = require('../utils/addressRegistry');

class EchelonFetcher {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl || 'https://mainnet.movementnetwork.xyz/v1';
        this.markets = ADDRESSES.echelon.markets;
    }

    /**
     * Get market info for a specific asset
     */
    async getMarketInfo(asset) {
        const marketAddress = this.markets[asset];
        if (!marketAddress) {
            return null;
        }

        try {
            // Try to get market state from on-chain
            const response = await axios.post(`${this.rpcUrl}/view`, {
                function: `${marketAddress}::lending_pool::get_market_state`,
                type_arguments: [],
                arguments: [],
            });

            if (!response.data || !response.data[0]) {
                return null;
            }

            const data = response.data[0];
            return {
                asset,
                marketAddress,
                totalSupply: this.parseAmount(data.total_supply, 8),
                totalBorrow: this.parseAmount(data.total_borrow, 8),
                supplyRate: this.parseRate(data.supply_rate),
                borrowRate: this.parseRate(data.borrow_rate),
                utilizationRate: this.calculateUtilization(data.total_supply, data.total_borrow),
                lastUpdate: new Date().toISOString(),
            };
        } catch (error) {
            // Market view function might not be exposed, return static data
            return {
                asset,
                marketAddress,
                totalSupply: null,
                totalBorrow: null,
                supplyRate: null,
                borrowRate: null,
                status: 'static', // Indicates we only have static config
            };
        }
    }

    /**
     * Get all markets info
     */
    async getAllMarkets() {
        const marketPromises = Object.keys(this.markets).map(async (asset) => {
            const info = await this.getMarketInfo(asset);
            return {
                name: `Echelon ${asset}`,
                asset,
                address: this.markets[asset],
                type: 'lending',
                protocol: 'Echelon',
                ...info,
            };
        });

        const markets = await Promise.all(marketPromises);
        return markets.filter(m => m !== null);
    }

    /**
     * Get supported assets list
     */
    getSupportedAssets() {
        return Object.keys(this.markets).map(asset => ({
            asset,
            address: this.markets[asset],
        }));
    }

    /**
     * Parse raw amount with decimals
     */
    parseAmount(rawAmount, decimals = 8) {
        if (!rawAmount) return 0;
        const parsed = parseFloat(rawAmount);
        if (isNaN(parsed)) return 0;
        return parsed / Math.pow(10, decimals);
    }

    /**
     * Parse rate (usually in basis points or percentage)
     */
    parseRate(rate) {
        if (!rate) return null;
        const parsed = parseFloat(rate);
        if (isNaN(parsed)) return null;
        // Assuming rate is in basis points (0.01% = 1 bp)
        return (parsed / 10000 * 100).toFixed(2) + '%';
    }

    /**
     * Calculate utilization rate
     */
    calculateUtilization(totalSupply, totalBorrow) {
        const supply = parseFloat(totalSupply) || 0;
        const borrow = parseFloat(totalBorrow) || 0;
        if (supply === 0) return '0%';
        return ((borrow / supply) * 100).toFixed(2) + '%';
    }
}

module.exports = EchelonFetcher;
