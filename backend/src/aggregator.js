/**
 * Movement DeFi Aggregator - Rewritten
 * 
 * Data Sources:
 * 1. DefiLlama - Protocol discovery, TVL, 7-day changes
 * 2. Satay Finance - On-chain vaults, REAL APY from profit data
 * 3. Echelon - On-chain lending market data
 * 4. GraphQL Indexer - User balances
 * 5. Price Oracle - Token prices (Pyth/CoinGecko)
 * 
 * Key Improvements:
 * - Real APY from on-chain data (no more fake estimates)
 * - Deduplication logic to prevent duplicate protocols
 * - Merged data from multiple sources with source attribution
 */

const DefiLlamaFetcher = require('./fetchers/defiLlamaFetcher');
const MovementRPCFetcher = require('./fetchers/movementRPCFetcher');
const GraphQLIndexerFetcher = require('./fetchers/graphqlIndexerFetcher');
const PriceOracleFetcher = require('./fetchers/priceOracleFetcher');
const SatayFetcher = require('./fetchers/satayFetcher');
const EchelonFetcher = require('./fetchers/echelonFetcher');
const { ADDRESSES, getStrategyName } = require('./utils/addressRegistry');

class MovementDefiAggregator {
    constructor(config) {
        this.defillama = new DefiLlamaFetcher();
        this.rpc = new MovementRPCFetcher(config.rpcUrl);
        this.indexer = new GraphQLIndexerFetcher(config.graphqlUrl);
        this.priceOracle = new PriceOracleFetcher();
        this.satay = new SatayFetcher(config.rpcUrl);
        this.echelon = new EchelonFetcher(config.rpcUrl);

        // Use centralized address registry
        this.addresses = ADDRESSES;
    }

    /**
     * Get full DeFi overview combining DefiLlama and on-chain data
     */
    async getFullDeFiOverview() {
        try {
            const [networkData, protocolsData, chainInfo, satayStats] = await Promise.all([
                this.defillama.getMovementNetworkTVL(),
                this.defillama.getAllMovementProtocols(),
                this.rpc.getChainInfo(),
                this.satay.getAggregatedStats(),
            ]);

            return {
                network: {
                    name: 'Movement',
                    chainId: chainInfo?.chainId || 126,
                    currentBlock: chainInfo?.blockHeight,
                    totalTVL: networkData?.tvl || 0,
                    nativeToken: networkData?.tokenSymbol || 'MOVE',
                },
                satay: {
                    totalTVL: satayStats.totalTVL,
                    vaultCount: satayStats.vaultCount,
                    activeVaultCount: satayStats.activeVaultCount,
                    averageAPY: satayStats.averageAPY,
                },
                allProtocols: protocolsData,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Full DeFi overview error:', error.message);
            throw error;
        }
    }

    /**
     * Get user positions with protocol identification
     */
    async getUserPositions(walletAddress) {
        try {
            const balances = await this.indexer.getUserBalances(walletAddress);

            const formattedBalances = balances.map(balance => ({
                asset: balance.metadata?.symbol || 'Unknown',
                amount: balance.amount,
                decimals: balance.metadata?.decimals || 18,
                assetType: balance.asset_type,
                protocol: this.identifyProtocol(balance.asset_type),
            }));

            return {
                wallet: walletAddress,
                balances: formattedBalances,
                totalAssets: balances.length,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('User positions error:', error.message);
            throw error;
        }
    }

    /**
     * Get combined data (overview + user positions)
     */
    async getCombinedData(walletAddress = null) {
        try {
            const overview = await this.getFullDeFiOverview();

            if (walletAddress) {
                const userPositions = await this.getUserPositions(walletAddress);
                return { ...overview, userPositions };
            }

            return overview;
        } catch (error) {
            console.error('Combined data error:', error.message);
            throw error;
        }
    }

    /**
     * Identify protocol from asset type
     */
    identifyProtocol(assetType) {
        if (!assetType) return 'unknown';

        const lowerAssetType = assetType.toLowerCase();

        // Check Satay vaults
        if (lowerAssetType.includes(this.addresses.satay.controller.toLowerCase())) {
            return 'satay';
        }

        // Check Echelon markets
        for (const [asset, address] of Object.entries(this.addresses.echelon.markets)) {
            if (lowerAssetType.includes(address.toLowerCase())) {
                return 'echelon';
            }
        }

        // Check Meridian
        if (lowerAssetType.includes(this.addresses.meridian.router.toLowerCase())) {
            return 'meridian';
        }

        // Check native
        if (assetType === '0x1::aptos_coin::AptosCoin') {
            return 'native';
        }

        return 'unknown';
    }

    /**
     * Get token prices
     */
    async getPrices() {
        try {
            return await this.priceOracle.getAllPrices();
        } catch (error) {
            console.error('Get prices error:', error.message);
            return {};
        }
    }

    /**
     * Get enhanced user data with USD values
     */
    async getEnhancedUserData(walletAddress) {
        try {
            const [positions, prices] = await Promise.all([
                this.getUserPositions(walletAddress),
                this.getPrices(),
            ]);

            const enrichedBalances = positions.balances.map(balance => {
                const price = prices[balance.asset]?.usd || 0;
                const amount = parseFloat(balance.amount) / Math.pow(10, balance.decimals);
                const usdValue = amount * price;

                return {
                    ...balance,
                    priceUSD: price,
                    valueUSD: usdValue,
                };
            });

            const totalValueUSD = enrichedBalances.reduce((sum, bal) => sum + bal.valueUSD, 0);

            // Format positions for frontend
            const formattedPositions = enrichedBalances.map((bal, index) => ({
                id: `pos-${index}`,
                name: bal.asset === 'MOVE' ? 'Movement Token' : `${bal.asset} Position`,
                protocol: this.identifyProtocol(bal.assetType) === 'satay' ? 'Satay Finance' :
                    this.identifyProtocol(bal.assetType) === 'echelon' ? 'Echelon Market' :
                        this.identifyProtocol(bal.assetType) === 'meridian' ? 'Meridian' : 'Wallet',
                strategy: this.identifyProtocol(bal.assetType) === 'satay' ? 'Yield Strategy' :
                    this.identifyProtocol(bal.assetType) === 'echelon' ? 'Lending' :
                        this.identifyProtocol(bal.assetType) === 'meridian' ? 'Liquidity Pool' : 'Holding',
                amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bal.valueUSD),
                rawAmount: bal.valueUSD,
                apy: 'N/A', // TODO: Map real APY from protocol metrics here
                tokenSymbol: bal.asset
            }));

            return {
                totalNetWorth: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValueUSD),
                netWorthChange: '+0.00% (7d)', // TODO: Calculate change from historical data
                positions: formattedPositions, // New Frontend structure
                // Keep original data for backward compatibility
                wallet: walletAddress,
                balances: enrichedBalances,
                totalAssets: enrichedBalances.length,
                totalValueUSD,
                prices,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Enhanced user data error:', error.message);
            throw error;
        }
    }

    /**
     * Get protocol metrics with REAL APY data
     * This is the main endpoint that feeds the frontend PoolList
     */
    async getProtocolMetrics() {
        try {
            const [defiLlamaProtocols, satayStats, prices] = await Promise.all([
                this.defillama.getAllMovementProtocols(),
                this.satay.getAggregatedStats(),
                this.getPrices(),
            ]);

            // Create a map to track protocols and prevent duplicates
            const protocolMap = new Map();

            // Process DefiLlama protocols first
            defiLlamaProtocols.forEach(proto => {
                const key = proto.name.toLowerCase().replace(/\s+/g, '');

                // Skip if this is Satay/Canopy (we'll add from on-chain data)
                if (key.includes('satay') || key.includes('canopy')) {
                    return;
                }

                protocolMap.set(key, {
                    name: proto.name,
                    slug: proto.slug,
                    tvl: proto.tvl || 0,
                    category: proto.category || 'DeFi',
                    change_7d: proto.change_7d ? proto.change_7d.toFixed(2) + '%' : 'N/A',
                    apy: this.getDefiLlamaAPYEstimate(proto),
                    apyNote: 'Estimated from category averages',
                    apySource: 'estimated',
                    dataSource: 'defillama',
                });
            });

            // Add Satay vaults with REAL on-chain APY
            satayStats.vaults.forEach(vault => {
                // Only add vaults with actual TVL to avoid empty entries
                if (vault.tvl > 0) {
                    const key = `satay-${vault.asset.toLowerCase()}`;

                    protocolMap.set(key, {
                        name: vault.name,
                        slug: vault.vaultAddress,
                        tvl: vault.tvl,
                        category: vault.category,
                        change_7d: 'N/A', // On-chain doesn't provide this
                        apy: vault.apy || 'N/A',
                        apyNote: vault.apyNote,
                        apySource: vault.apySource,
                        dataSource: 'on-chain',
                        vaultAddress: vault.vaultAddress,
                        strategies: vault.strategies,
                    });
                }
            });

            // Convert map to array and sort by TVL
            const protocols = Array.from(protocolMap.values())
                .sort((a, b) => (b.tvl || 0) - (a.tvl || 0));

            return {
                protocols,
                prices,
                totalProtocols: protocols.length,
                satayStats: {
                    totalTVL: satayStats.totalTVL,
                    activeVaults: satayStats.activeVaultCount,
                    averageAPY: satayStats.averageAPY,
                },
                note: 'APY from on-chain data where available, otherwise category estimates',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Protocol metrics error:', error.message);
            throw error;
        }
    }

    /**
     * Get APY estimate for DefiLlama protocols
     * Only used as fallback when on-chain data unavailable
     * Note: These are ESTIMATES, not real APY
     */
    getDefiLlamaAPYEstimate(protocol) {
        // Category-based fallback ranges (more reliable than extrapolation)
        const categoryRanges = {
            'Yield Aggregator': '8-15%',
            'Dexs': '5-25%',
            'Lending': '3-12%',
            'Liquid Staking': '5-10%',
            'CDP': '2-8%',
            'Derivatives': '5-20%',
            'NFT Lending': '10-30%',
            'RWA': '5-15%',
        };

        // Return category range instead of unreliable 7-day extrapolation
        // The problem with extrapolating 7-day change: a 10% weekly change 
        // would extrapolate to astronomical APY which is misleading
        return categoryRanges[protocol.category] || 'See protocol';
    }

    /**
     * Get Satay vault details
     */
    async getSatayVaults() {
        return await this.satay.getAllVaults();
    }

    /**
     * Get specific vault by asset
     */
    async getSatayVaultByAsset(assetName) {
        return await this.satay.getVaultByAsset(assetName);
    }

    /**
     * Get all Echelon markets
     */
    async getEchelonMarkets() {
        return await this.echelon.getAllMarkets();
    }

    /**
     * Get specific Echelon market by asset
     */
    async getEchelonMarket(asset) {
        return await this.echelon.getMarketInfo(asset);
    }
}

module.exports = MovementDefiAggregator;
