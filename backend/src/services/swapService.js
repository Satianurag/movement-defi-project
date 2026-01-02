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
     * @throws {Error} If reserves are invalid
     */
    calculateRealSlippage(reserveIn, reserveOut, amountIn) {
        const x = Number(reserveIn);
        const y = Number(reserveOut);
        const dx = parseFloat(amountIn);

        if (x === 0 || y === 0) {
            throw new Error('Invalid pool: zero reserves');
        }

        // AMM constant product: (x + dx)(y - dy) = xy
        // dy = y * dx / (x + dx)
        const spotPrice = y / x;
        const expectedOutput = dx * spotPrice;
        const actualOutput = (y * dx) / (x + dx);

        // Slippage = (expected - actual) / expected
        const slippage = (expectedOutput - actualOutput) / expectedOutput;

        return Math.max(0.001, Math.min(slippage, 0.10)); // Cap between 0.1% and 10%
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

            // 3. Calculate Real Slippage from AMM Reserves (required)
            let slipFactor;
            let slippageSource = 'amm_reserves';

            try {
                const reserves = await this.meridianService.getReserves(tokenIn, tokenOut);
                slipFactor = this.calculateRealSlippage(reserves.reserveA, reserves.reserveB, amountIn);
            } catch (reserveError) {
                // REMOVED: Hardcoded slippage fallbacks
                // If we can't get real reserves, we can't provide an accurate quote
                throw new Error(`Cannot calculate slippage: ${reserveError.message}. Pool may not exist.`);
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
     * Fetches from CoinGecko's Movement ecosystem tokens
     */
    async getSupportedTokens() {
        try {
            // Fetch Movement Network tokens from CoinGecko
            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=movement,bitcoin,ethereum,usd-coin,tether,wrapped-bitcoin,weth&order=market_cap_desc',
                {
                    timeout: 5000,
                    headers: { 'Accept': 'application/json' }
                }
            );

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status}`);
            }

            const coins = await response.json();

            // Map CoinGecko response to our token format
            const symbolMap = {
                'movement': 'MOVE',
                'bitcoin': 'BTC',
                'ethereum': 'ETH',
                'usd-coin': 'USDC',
                'tether': 'USDT',
                'wrapped-bitcoin': 'WBTC',
                'weth': 'WETH'
            };

            const decimalsMap = {
                'MOVE': 8,
                'BTC': 8,
                'ETH': 18,
                'USDC': 6,
                'USDT': 6,
                'WBTC': 8,
                'WETH': 18
            };

            return coins.map(coin => ({
                symbol: symbolMap[coin.id] || coin.symbol.toUpperCase(),
                name: coin.name,
                decimals: decimalsMap[symbolMap[coin.id]] || 18,
                logoURI: coin.image,
                price: coin.current_price // Bonus: include current price
            }));
        } catch (error) {
            console.error('Failed to fetch tokens from CoinGecko:', error.message);
            throw new Error(`Failed to fetch token list: ${error.message}`);
        }
    }
}

module.exports = SwapService;

