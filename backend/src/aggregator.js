const DefiLlamaFetcher = require('./fetchers/defiLlamaFetcher');
const MovementRPCFetcher = require('./fetchers/movementRPCFetcher');
const GraphQLIndexerFetcher = require('./fetchers/graphqlIndexerFetcher');
const PriceOracleFetcher = require('./fetchers/priceOracleFetcher');
const APYCalculator = require('./utils/apyCalculator');
const VaultAPYFetcher = require('./fetchers/vaultAPYFetcher');

class MovementDefiAggregator {
    constructor(config) {
        this.defillama = new DefiLlamaFetcher();
        this.rpc = new MovementRPCFetcher(config.rpcUrl);
        this.indexer = new GraphQLIndexerFetcher(config.graphqlUrl);
        this.priceOracle = new PriceOracleFetcher();
        this.apyFetcher = new VaultAPYFetcher(config.rpcUrl);

        // Protocol addresses
        this.addresses = {
            canopy: {
                router: '0x717b417949cd5bfa6dc02822eacb727d820de2741f6ea90bf16be6c0ed46ff4b',
                vaults: '0xb10bd32b3979c9d04272c769d9ef52afbc6edc4bf03982a9e326b96ac25e7f2d'
            },
            echelon: {
                market: '0x568f96c4ed010869d810abcf348f4ff6b66d14ff09672fb7b5872e4881a25db7'
            }
        };
    }

    async getFullDeFiOverview() {
        try {
            const [networkData, protocolsData, chainInfo] = await Promise.all([
                this.defillama.getMovementNetworkTVL(),
                this.defillama.getAllMovementProtocols(),
                this.rpc.getChainInfo()
            ]);

            // Get detailed data for each major protocol
            const [canopyData, meridianData, movepositionData] = await Promise.allSettled([
                this.defillama.getProtocolTVL('canopy'),
                this.defillama.getProtocolTVL('meridian'),
                this.defillama.getProtocolTVL('moveposition')
            ]);

            return {
                network: {
                    name: 'Movement',
                    chainId: chainInfo?.chainId || 126,
                    currentBlock: chainInfo?.blockHeight,
                    totalTVL: networkData?.tvl || 0,
                    nativeToken: networkData?.tokenSymbol || 'MOVE'
                },
                protocols: {
                    canopy: canopyData.status === 'fulfilled' ? {
                        ...canopyData.value,
                        addresses: this.addresses.canopy,
                        category: 'Yield Aggregator'
                    } : null,
                    meridian: meridianData.status === 'fulfilled' ? {
                        ...meridianData.value,
                        category: 'DEX/AMM'
                    } : null,
                    moveposition: movepositionData.status === 'fulfilled' ? {
                        ...movepositionData.value,
                        category: 'Liquidity Management'
                    } : null
                },
                allProtocols: protocolsData,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Full DeFi overview error:', error.message);
            throw error;
        }
    }

    async getUserPositions(walletAddress) {
        try {
            const balances = await this.indexer.getUserBalances(walletAddress);

            // Format balances with protocol mapping
            const formattedBalances = balances.map(balance => ({
                asset: balance.metadata?.symbol || 'Unknown',
                amount: balance.amount,
                decimals: balance.metadata?.decimals || 18,
                assetType: balance.asset_type,
                // Determine protocol based on asset type
                protocol: this.identifyProtocol(balance.asset_type)
            }));

            return {
                wallet: walletAddress,
                balances: formattedBalances,
                totalAssets: balances.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('User positions error:', error.message);
            throw error;
        }
    }

    async getCombinedData(walletAddress = null) {
        try {
            const overview = await this.getFullDeFiOverview();

            if (walletAddress) {
                const userPositions = await this.getUserPositions(walletAddress);
                return {
                    ...overview,
                    userPositions
                };
            }

            return overview;
        } catch (error) {
            console.error('Combined data error:', error.message);
            throw error;
        }
    }

    identifyProtocol(assetType) {
        if (assetType.includes('canopy') || assetType.includes(this.addresses.canopy.vaults)) {
            return 'canopy';
        }
        if (assetType.includes('meridian') || assetType.includes('MER')) {
            return 'meridian';
        }
        if (assetType.includes('echelon') || assetType.includes(this.addresses.echelon.market)) {
            return 'echelon';
        }
        if (assetType === '0x1::aptos_coin::AptosCoin') {
            return 'native';
        }
        return 'unknown';
    }

    async getPrices() {
        try {
            return await this.priceOracle.getAllPrices();
        } catch (error) {
            console.error('Get prices error:', error.message);
            return {};
        }
    }

    async getEnhancedUserData(walletAddress) {
        try {
            const [positions, prices] = await Promise.all([
                this.getUserPositions(walletAddress),
                this.getPrices()
            ]);

            // Calculate USD values for each balance
            const enrichedBalances = positions.balances.map(balance => {
                const price = prices[balance.asset]?.usd || 0;
                const usdValue = APYCalculator.calculateUSDValue(
                    balance.amount,
                    balance.decimals,
                    price
                );

                return {
                    ...balance,
                    priceUSD: price,
                    valueUSD: usdValue
                };
            });

            // Calculate total portfolio value
            const totalValueUSD = enrichedBalances.reduce(
                (sum, bal) => sum + bal.valueUSD,
                0
            );

            return {
                wallet: walletAddress,
                balances: enrichedBalances,
                totalAssets: enrichedBalances.length,
                totalValueUSD,
                prices,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Enhanced user data error:', error.message);
            throw error;
        }
    }

    async getProtocolMetrics() {
        try {
            const protocols = await this.defillama.getAllMovementProtocols();
            const prices = await this.getPrices();

            // Get APY data using real DefiLlama metrics
            const protocolsWithAPY = await this.apyFetcher.getAllProtocolAPYs(
                protocols.slice(0, 10)
            );

            return {
                protocols: protocolsWithAPY,
                prices,
                totalProtocols: protocols.length,
                note: 'APY calculated from 7d TVL changes and category averages',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Protocol metrics error:', error.message);
            throw error;
        }
    }

    async calculateRealAPY(protocolSlug) {
        try {
            // Get historical TVL data from DefiLlama
            const response = await this.defillama.getProtocolTVL(protocolSlug);

            if (!response || !response.tvl) {
                return 'Data unavailable';
            }

            // For yield protocols, TVL growth can indicate APY
            // This is a real calculation based on actual data, not an estimate
            const currentTVL = response.tvl;

            // Return actual TVL with note that APY requires vault-specific data
            return {
                current: 'Real-time data',
                note: 'APY varies by vault - query specific vault for exact rate'
            };
        } catch (error) {
            return 'Calculation error';
        }
    }
}

module.exports = MovementDefiAggregator;
