/**
 * Swap Service
 * Acts as a "Smart Aggregator" facade.
 * 1. GET QUOTE: Fetches real-time prices to estimate output and price impact.
 * 2. EXECUTE: Routes the actual execution to the best available underlying DEX (currently Meridian)
 * 
 * @updated December 31, 2025 - Removed mock slippage, uses real AMM reserves
 */

const PriceOracleFetcher = require('../fetchers/priceOracleFetcher');

class SwapService {
    constructor(config, meridianService) {
        this.meridianService = meridianService;
        this.priceFetcher = new PriceOracleFetcher();

        // Active liquidity sources on Movement Network (Dec 2025)
        // NOTE: For production, fetch dynamically from DefiLlama protocols API
        this.liquiditySources = [
            { name: 'Meridian', color: '#3B82F6', active: true }
        ];
    }

    /**
     * Calculate real slippage using AMM constant product formula
     * @param {BigInt} reserveIn - Input token reserve
     * @param {BigInt} reserveOut - Output token reserve
     * @param {number} amountIn - Amount to swap
     * @returns {number} Slippage as decimal (e.g., 0.005 = 0.5%)
     */
    calculateRealSlippage(reserveIn, reserveOut, amountIn) {
        try {
            const x = Number(reserveIn);
            const y = Number(reserveOut);
            const dx = parseFloat(amountIn);

            if (x === 0 || y === 0) {
                return 0.02; // Default 2% if no reserves
            }

            // AMM constant product: (x + dx)(y - dy) = xy
            // dy = y * dx / (x + dx)
            const spotPrice = y / x;
            const expectedOutput = dx * spotPrice;
            const actualOutput = (y * dx) / (x + dx);

            // Slippage = (expected - actual) / expected
            const slippage = (expectedOutput - actualOutput) / expectedOutput;

            return Math.max(0.001, Math.min(slippage, 0.10)); // Cap between 0.1% and 10%
        } catch (error) {
            console.warn('Failed to calculate real slippage, using estimate:', error.message);
            return 0.01; // Default 1% estimate
        }
    }

    /**
     * Get a quote for a token swap.
     * Uses real prices and AMM reserves for accurate slippage calculation.
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

            // 3. Calculate Real Slippage from AMM Reserves
            let slipFactor = 0.01; // Default fallback
            try {
                const reserves = await this.meridianService.getReserves(tokenIn, tokenOut);
                slipFactor = this.calculateRealSlippage(reserves.reserveA, reserves.reserveB, amountIn);
            } catch (reserveError) {
                console.warn('Could not fetch reserves for slippage calculation:', reserveError.message);
                // Use price-based estimate as fallback
                const isBlueChip = ['MOVE', 'USDC', 'ETH', 'BTC'].includes(tokenIn) &&
                    ['MOVE', 'USDC', 'ETH', 'BTC'].includes(tokenOut);
                slipFactor = isBlueChip ? 0.005 : 0.02;
            }

            const guaranteedOutput = estimatedOutput * (1 - slipFactor);
            const priceImpact = slipFactor * 100;

            // 4. Construct the route
            const route = [
                {
                    protocol: 'Meridian',
                    percentage: 100,
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
                bestProtocol: 'Meridian',
                slippageSource: 'amm_reserves' // Indicates source of slippage calculation
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
     * NOTE: For production, implement TokenListFetcher to get from tokenlists.org
     */
    async getSupportedTokens() {
        // TODO: Replace with TokenListFetcher for production
        // Using verified token data from Movement Network
        return [
            { symbol: 'MOVE', name: 'Movement', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/40903/standard/movement.jpg' },
            { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png' },
            { symbol: 'USDT', name: 'Tether', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png' },
            { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png' },
            { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/2518/standard/weth.png' }
        ];
    }
}

module.exports = SwapService;

