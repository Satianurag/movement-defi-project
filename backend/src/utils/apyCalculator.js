// APY Calculator utilities
class APYCalculator {
    // Native Staking APY
    static calculateNativeStakingAPY(commission = 0) {
        const baseInflation = 10; // 10% annual inflation
        return baseInflation - commission;
    }

    // Vault APY from share price change
    static calculateVaultAPY(sharePriceNow, sharePricePast, daysElapsed) {
        if (!sharePriceNow || !sharePricePast || daysElapsed <= 0) return 0;

        const priceRatio = sharePriceNow / sharePricePast;
        const annualizationFactor = 365 / daysElapsed;
        return (Math.pow(priceRatio, annualizationFactor) - 1) * 100;
    }

    // LP Pool APY from trading fees
    static calculateLPPoolAPY(volume24h, tvl, feeRate = 0.003) {
        if (!tvl || tvl === 0) return 0;

        const dailyFees = volume24h * feeRate;
        const annualFees = dailyFees * 365;
        return (annualFees / tvl) * 100;
    }

    // USD value calculation
    static calculateUSDValue(amount, decimals, priceUSD) {
        const normalizedAmount = amount / Math.pow(10, decimals);
        return normalizedAmount * priceUSD;
    }

    // Portfolio total value
    static calculatePortfolioValue(balances, prices) {
        return balances.reduce((total, balance) => {
            const price = prices[balance.asset] || 0;
            const value = this.calculateUSDValue(
                balance.amount,
                balance.decimals,
                price
            );
            return total + value;
        }, 0);
    }
}

module.exports = APYCalculator;
