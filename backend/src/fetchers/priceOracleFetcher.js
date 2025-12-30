/**
 * Price Oracle Fetcher
 * Fetches real-time token prices from multiple sources with fallbacks.
 */

const axios = require('axios');

class PriceOracleFetcher {
    constructor() {
        // Pyth Network price feeds
        this.pythURL = 'https://hermes.pyth.network/api/latest_price_feeds';

        // CoinGecko fallback
        this.coingeckoURL = 'https://api.coingecko.com/api/v3/simple/price';

        // Movement-specific price IDs
        // Note: MOVE might not have a Pyth feed yet, so we use CoinGecko
        this.pythFeeds = {
            BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
            ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665ed50e18987d6051',
            USDC: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
            USDT: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
        };

        // CoinGecko IDs for tokens
        this.coingeckoIds = {
            MOVE: 'movement',
            BTC: 'bitcoin',
            WBTC: 'wrapped-bitcoin',
            ETH: 'ethereum',
            WETH: 'weth',
            USDC: 'usd-coin',
            USDT: 'tether',
            'USDC.e': 'usd-coin',
            'USDT.e': 'tether',
            'WETH.e': 'weth',
            'WBTC.e': 'wrapped-bitcoin',
        };

        // Cache prices for 30 seconds
        this.cache = {};
        this.cacheExpiry = 30000; // 30 seconds
    }

    /**
     * Get price from Pyth Network
     */
    async getPythPrice(tokenSymbol) {
        try {
            const feedId = this.pythFeeds[tokenSymbol];
            if (!feedId) return null;

            const response = await axios.get(`${this.pythURL}?ids[]=${feedId}`, {
                timeout: 5000,
            });
            const priceData = response.data?.[0];

            if (!priceData || !priceData.price) return null;

            const price = parseFloat(priceData.price.price);
            const expo = parseInt(priceData.price.expo);
            const conf = parseFloat(priceData.price.conf);

            const actualPrice = price * Math.pow(10, expo);
            const confidence = conf * Math.pow(10, expo);

            return {
                symbol: tokenSymbol,
                price: actualPrice,
                confidence: confidence,
                source: 'pyth',
                timestamp: priceData.price.publish_time,
            };
        } catch (error) {
            // Silently fail, will try fallback
            return null;
        }
    }

    /**
     * Get price from CoinGecko
     */
    async getCoinGeckoPrice(tokenSymbol) {
        try {
            const coinId = this.coingeckoIds[tokenSymbol];
            if (!coinId) return null;

            const response = await axios.get(this.coingeckoURL, {
                params: {
                    ids: coinId,
                    vs_currencies: 'usd',
                },
                timeout: 5000,
            });

            const price = response.data?.[coinId]?.usd;
            if (!price) return null;

            return {
                symbol: tokenSymbol,
                price: price,
                confidence: 0,
                source: 'coingecko',
                timestamp: Math.floor(Date.now() / 1000),
            };
        } catch (error) {
            // Silently fail
            return null;
        }
    }

    /**
     * Get price with fallback strategy
     */
    async getPrice(tokenSymbol) {
        // Check cache first
        const cached = this.cache[tokenSymbol];
        if (cached && Date.now() - cached.fetchedAt < this.cacheExpiry) {
            return cached.data;
        }

        // Try Pyth first, then CoinGecko
        let price = await this.getPythPrice(tokenSymbol);
        if (!price) {
            price = await this.getCoinGeckoPrice(tokenSymbol);
        }

        // Cache the result
        if (price) {
            this.cache[tokenSymbol] = {
                data: price,
                fetchedAt: Date.now(),
            };
        }

        return price;
    }

    /**
     * Get all prices for common tokens
     */
    async getAllPrices() {
        const tokens = ['MOVE', 'BTC', 'ETH', 'USDC', 'USDT', 'WBTC', 'WETH'];

        const prices = await Promise.all(
            tokens.map(token => this.getPrice(token))
        );

        const result = {};
        prices.filter(p => p !== null).forEach(price => {
            result[price.symbol] = {
                usd: price.price,
                confidence: price.confidence,
                source: price.source,
                lastUpdate: new Date(price.timestamp * 1000).toISOString(),
            };
        });

        // Add bridged token aliases
        if (result.USDC) result['USDC.e'] = result.USDC;
        if (result.USDT) result['USDT.e'] = result.USDT;
        if (result.WETH) result['WETH.e'] = result.WETH;
        if (result.WBTC) result['WBTC.e'] = result.WBTC;

        return result;
    }

    /**
     * Get USD value for an amount of tokens
     */
    async getUSDValue(tokenSymbol, amount) {
        const priceData = await this.getPrice(tokenSymbol);
        if (!priceData) return null;

        return {
            amount,
            token: tokenSymbol,
            priceUSD: priceData.price,
            valueUSD: amount * priceData.price,
            source: priceData.source,
        };
    }
}

module.exports = PriceOracleFetcher;
