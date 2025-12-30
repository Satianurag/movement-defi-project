/**
 * Swap Service
 * Acts as a "Smart Aggregator" facade.
 * 1. GET QUOTE: Fetches real-time prices to estimate output and price impact.
 * 2. EXECUTE: Routes the actual execution to the best available underlying DEX (currently Meridian).
 */

const PriceOracleFetcher = require('../fetchers/priceOracleFetcher');

class SwapService {
    constructor(config, meridianService) {
        this.meridianService = meridianService;
        this.priceFetcher = new PriceOracleFetcher();

        // Mock liquidity sources for "Route Visualization"
        this.liquiditySources = [
            { name: 'Meridian', color: '#3B82F6' },
            { name: 'Interest', color: '#10B981' },
            { name: 'LiquidSwap', color: '#F59E0B' }
        ];
    }

    /**
     * Get a quote for a token swap.
     * Simulates an aggregator by calculating fair market value + slippage.
     */
    async getQuote(tokenIn, tokenOut, amountIn) {
        try {
            // 1. Fetch Real-Time Prices
            const priceInData = await this.priceFetcher.getPrice(tokenIn);
            const priceOutData = await this.priceFetcher.getPrice(tokenOut);

            if (!priceInData || !priceInData.price || !priceOutData || !priceOutData.price) {
                throw new Error(`Unable to fetch price data for ${tokenIn} or ${tokenOut}`);
            }

            const priceIn = priceInData.price;
            const priceOut = priceOutData.price;

            // 2. Calculate Theoretical Output (Fair Value)
            const valueInUSD = parseFloat(amountIn) * priceIn;
            const estimatedOutput = valueInUSD / priceOut;

            // 3. Simulate "Real World" Liquidity Impact
            // In a real aggregator, we'd query the chain. Here we simulate deeper liquidity for bluechips.
            const isBlueChip = ['MOVE', 'USDC', 'ETH', 'BTC'].includes(tokenIn) && ['MOVE', 'USDC', 'ETH', 'BTC'].includes(tokenOut);
            const slipFactor = isBlueChip ? 0.005 : 0.02; // 0.5% for bluechips, 2% for others

            const guaranteedOutput = estimatedOutput * (1 - slipFactor);
            const priceImpact = slipFactor * 100;

            // 4. Construct the "Best Route"
            // We simulate a split route for professional visualization
            const route = [
                {
                    protocol: 'Meridian',
                    percentage: 100, // For now, 100% via Meridian
                    tokenIn: tokenIn,
                    tokenOut: tokenOut
                }
            ];

            return {
                tokenIn,
                tokenOut,
                amountIn,
                estimatedOutput: estimatedOutput.toFixed(6),
                minReceived: guaranteedOutput.toFixed(6),
                priceImpact: priceImpact.toFixed(2),
                executionPrice: (priceIn / priceOut).toFixed(6),
                usdValue: valueInUSD.toFixed(2),
                route,
                bestProtocol: 'Meridian'
            };

        } catch (error) {
            console.error('Swap Quote Error:', error);
            throw new Error(`Failed to generate quote: ${error.message}`);
        }
    }

    /**
     * Execute the swap using the best protocol (Meridian).
     */
    async executeSwap(tokenIn, tokenOut, amountIn, minAmountOut, userAddress) {
        try {
            console.log(`Executing Swap via Meridian: ${amountIn} ${tokenIn} -> ${tokenOut}`);

            // Delegate to the actual on-chain service
            const result = await this.meridianService.swap(
                tokenIn,
                tokenOut,
                amountIn,
                minAmountOut,
                userAddress
            );

            return {
                success: true,
                hash: result.hash,
                details: {
                    protocol: 'Meridian',
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Swap Execution Error:', error);
            throw new Error(`Swap execution failed: ${error.message}`);
        }
    }

    /**
     * Get supported tokens for the swap interface
     */
    async getSupportedTokens() {
        // This would typically come from a token list provider
        // Returns a curated list of supported assets on Movement
        return [
            { symbol: 'MOVE', name: 'Movement', decimals: 8, logoURI: 'https://movement-assets.com/move.png' },
            { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://movement-assets.com/usdc.png' },
            { symbol: 'USDT', name: 'Tether', decimals: 6, logoURI: 'https://movement-assets.com/usdt.png' },
            { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: 'https://movement-assets.com/wbtc.png' },
            { symbol: 'WETH', name: 'Wrapped Ether', decimals: 8, logoURI: 'https://movement-assets.com/weth.png' }
        ];
    }
}

module.exports = SwapService;
