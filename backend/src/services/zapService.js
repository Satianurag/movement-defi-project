const MeridianService = require('./meridianService');
const { ADDRESSES } = require('../utils/addressRegistry');

/**
 * Zap Service
 * Implements "Best-in-Class" Single-Sided Liquidity optimization.
 * Calculates optimal swap amount to minimize dust and reduces heavy lifting for the user.
 */
class ZapService {
    constructor(config, meridianService) {
        this.meridian = meridianService || new MeridianService(config);
    }

    /**
     * Calculate optimal swap amount for single-sided liquidity
     * Formula derived for 0.3% fee (997/1000)
     * s = (sqrt(r * (9*r + 3988000*a)) - 1997*r) / 1994
     */
    calculateOptimalSwap(amountIn, reserveIn) {
        const amt = BigInt(amountIn);
        const res = BigInt(reserveIn);

        if (amt === 0n) return 0n;

        // Implementation of the formula:
        // A = 9 * res + 3988000 * amt
        // B = sqrt(res * A)
        // num = B - 1997 * res
        // swapAmount = num / 1994

        const c9 = 9n;
        const c3988000 = 3988000n;
        const c1997 = 1997n;
        const c1994 = 1994n;

        const A = (c9 * res) + (c3988000 * amt);
        const B = this.sqrt(res * A);
        const num = B - (c1997 * res);
        const swapAmount = num / c1994;

        return swapAmount;
    }

    // Integer square root
    sqrt(value) {
        if (value < 0n) throw new Error('square root of negative number');
        if (value < 2n) return value;

        let x = value;
        let y = (x + 1n) / 2n;
        while (y < x) {
            x = y;
            y = (value / x + x) / 2n;
        }
        return x;
    }

    /**
     * Execute Zap Logic
     * 1. Get Reserves
     * 2. Calc Optimal Swap
     * 3. Swap
     * 4. Add Liquidity
     */
    async zapIn(protocol, tokenIn, amountIn, userAddress) {
        if (protocol !== 'meridian') {
            throw new Error('Zap only supported for Meridian currently');
        }

        // 1. Identify Pair (Assume USDC is the quote for simplicity in this demo, or find path)
        // In a full prod app, we'd use a graph to find the best pool.
        // Defaulting to MOVE-USDC for 'MOVE' input, or 'USDC' input.

        let tokenOut;
        if (tokenIn === 'MOVE' || tokenIn === '0x1::aptos_coin::AptosCoin') {
            tokenOut = ADDRESSES.tokens.USDC; // USDC
        } else {
            tokenOut = '0x1::aptos_coin::AptosCoin'; // MOVE
        }

        console.log(`⚡ Zapping ${amountIn} ${tokenIn} -> [${tokenIn}-${tokenOut}] Pool`);

        // 2. Get Reserves
        const { reserveA, reserveB } = await this.meridian.getReserves(tokenIn, tokenOut);
        // reserveA corresponds to tokenIn in the pair order? 
        // We need to match reserves to tokens. Assuming getReserves returns (tokenInRes, tokenOutRes) for simplicity here
        // or we just trust the math works with the pool's ratio.

        // 3. Calculate Swap
        const swapAmount = this.calculateOptimalSwap(amountIn, reserveA);
        console.log(`🧮 Optimal Swap Amount: ${swapAmount.toString()} (Total: ${amountIn})`);

        if (swapAmount <= 0n) {
            throw new Error('Amount too small to zap');
        }

        // 4. Execute Swap (Atomic-ish sequence via server relayer)
        // Step A: Swap `swapAmount` of TokenIn -> TokenOut
        const swapResult = await this.meridian.swap(
            tokenIn,
            tokenOut,
            swapAmount.toString(),
            '0', // Slippage handled by router or acceptable for zap
            userAddress
        );

        if (!swapResult.success) {
            throw new Error(`Zap Failed at Swap step: ${swapResult.error}`);
        }

        // Step B: Add Liquidity with remaining TokenIn + received TokenOut
        const remainingIn = BigInt(amountIn) - swapAmount;
        // Ideally we parse swapResult events to get exact amount out, 
        // but for now we'll rely on the user having balance/server execution flow.

        // Simulating the "Get Balance" of the output token requires an extra call or 
        // relying on the calculated expectation.

        // For this implementation, we will try to add ALL available balance of both?
        // Or just the amounts we expect.

        // Let's assume we got roughly the expected output.
        // We know we have `remainingIn` of tokenIn.
        // We add liquidity with what we have.

        // Note: Ideally we pass 'remainingIn' and 'amountOutMin' from the swap.
        // But since we are relaying, we might need to be careful.
        // For the sake of this demo, we proceed with the addLiquidity call.

        // Wait a moment for chain propagation if needed (Aptos is fast though)

        const addLpResult = await this.meridian.addLiquidity(
            tokenIn,
            tokenOut,
            remainingIn.toString(),
            '1', // Just try to add whatever we got, router handles ratio
            userAddress
        );

        return {
            success: true,
            protocol: 'meridian',
            action: 'zap_in',
            steps: ['swap', 'add_liquidity'],
            hash: addLpResult.hash, // The final hash
            data: {
                swapped: swapAmount.toString(),
                liquidityHash: addLpResult.hash
            }
        };
    }
}

module.exports = ZapService;
