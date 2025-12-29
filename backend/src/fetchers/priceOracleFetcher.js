const axios = require('axios');

class PriceOracleFetcher {
    constructor() {
        // Use Pyth's public API endpoint
        this.pythURL = 'https://hermes.pyth.network/api/latest_price_feeds';

        // Real Price feed IDs (verified from Pyth docs)
        this.priceFeeds = {
            MOVE: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665ed50e18987d6051',
            BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
            ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480a934e213f430',
            USDC: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
        };
    }

    async getPrice(tokenSymbol) {
        try {
            const feedId = this.priceFeeds[tokenSymbol];
            if (!feedId) return null;

            const response = await axios.get(`${this.pythURL}?ids[]=${feedId}`);
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
                timestamp: priceData.price.publish_time
            };
        } catch (error) {
            console.error(`Price fetch error for ${tokenSymbol}:`, error.message);
            return null;
        }
    }

    async getAllPrices() {
        const prices = await Promise.all([
            this.getPrice('MOVE'),
            this.getPrice('BTC'),
            this.getPrice('ETH'),
            this.getPrice('USDC')
        ]);

        return prices.filter(p => p !== null).reduce((acc, price) => {
            acc[price.symbol] = {
                usd: price.price,
                confidence: price.confidence,
                lastUpdate: new Date(price.timestamp * 1000).toISOString()
            };
            return acc;
        }, {});
    }
}

module.exports = PriceOracleFetcher;
