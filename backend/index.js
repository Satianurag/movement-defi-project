const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const MovementDefiAggregator = require('./src/aggregator');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize aggregator
const aggregator = new MovementDefiAggregator({
    rpcUrl: process.env.MOVEMENT_RPC_URL || 'https://full.mainnet.movementinfra.xyz/v1',
    graphqlUrl: process.env.MOVEMENT_GRAPHQL_URL || 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql'
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Movement DeFi Aggregator' });
});

// Get full DeFi overview (all protocols)
app.get('/api/defi/overview', async (req, res) => {
    try {
        const data = await aggregator.getFullDeFiOverview();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user positions for a specific wallet
app.get('/api/defi/user/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const data = await aggregator.getUserPositions(address);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get combined data (overview + user positions if address provided)
app.get('/api/defi/combined', async (req, res) => {
    try {
        const { wallet } = req.query;
        const data = await aggregator.getCombinedData(wallet || null);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// NEW: Get real-time token prices
app.get('/api/prices', async (req, res) => {
    try {
        const prices = await aggregator.getPrices();
        res.json({
            success: true,
            data: prices,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// NEW: Get enhanced user data with USD values
app.get('/api/defi/portfolio/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const data = await aggregator.getEnhancedUserData(address);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// NEW: Get protocol metrics with APY estimates
app.get('/api/defi/metrics', async (req, res) => {
    try {
        const data = await aggregator.getProtocolMetrics();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// NEW: Get user transaction history
app.get('/api/history/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const history = await aggregator.getUserHistory(address);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// NEW: Get protocol historical TVL
app.get('/api/defi/history/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const history = await aggregator.getProtocolHistory(slug);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// SATAY FINANCE ENDPOINTS (Real On-Chain Data)
// ============================================

// Get all Satay vaults with real APY
app.get('/api/satay/vaults', async (req, res) => {
    try {
        const vaults = await aggregator.getSatayVaults();
        res.json({
            success: true,
            data: vaults,
            count: vaults.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific vault by asset name
app.get('/api/satay/vault/:asset', async (req, res) => {
    try {
        const { asset } = req.params;
        const vault = await aggregator.getSatayVaultByAsset(asset);

        if (!vault) {
            return res.status(404).json({
                success: false,
                error: `No vault found for asset: ${asset}`
            });
        }

        res.json({
            success: true,
            data: vault
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ECHELON LENDING PROTOCOL ENDPOINTS
// ============================================

// Get all Echelon markets (on-chain data)
app.get('/api/echelon/markets-data', async (req, res) => {
    try {
        const markets = await aggregator.getEchelonMarkets();
        res.json({
            success: true,
            data: markets,
            count: markets.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific Echelon market by asset
app.get('/api/echelon/market-data/:asset', async (req, res) => {
    try {
        const { asset } = req.params;
        const market = await aggregator.getEchelonMarket(asset);

        if (!market) {
            return res.status(404).json({
                success: false,
                error: `No market found for asset: ${asset}`
            });
        }

        res.json({
            success: true,
            data: market
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ECHELON SERVICE ENDPOINTS (Transactions)
// ============================================

const EchelonService = require('./src/services/echelonService');
const echelon = new EchelonService({
    rpcUrl: process.env.MOVEMENT_RPC_URL || 'https://mainnet.movementnetwork.xyz/v1',
    faucetUrl: process.env.MOVEMENT_FAUCET_URL,
    serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
});

// Get supported Echelon markets
app.get('/api/echelon/markets', (req, res) => {
    try {
        const markets = echelon.getSupportedMarkets();
        res.json({
            success: true,
            data: markets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Supply to Echelon market
app.post('/api/echelon/supply', async (req, res) => {
    try {
        const { asset, amount, userAddress } = req.body;

        if (!asset || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: asset, amount'
            });
        }

        const marketAddress = echelon.getMarketAddress(asset);
        const result = await echelon.supply(marketAddress, amount, userAddress);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Withdraw from Echelon market
app.post('/api/echelon/withdraw', async (req, res) => {
    try {
        const { asset, amount, userAddress } = req.body;

        if (!asset || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: asset, amount'
            });
        }

        const marketAddress = echelon.getMarketAddress(asset);
        const result = await echelon.withdraw(marketAddress, amount, userAddress);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user position in Echelon market
app.get('/api/echelon/position/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        const { asset } = req.query;

        const marketAddress = echelon.getMarketAddress(asset || 'MOVE');
        const position = await echelon.getUserPosition(userAddress, marketAddress);

        res.json({
            success: true,
            data: position
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get market info
app.get('/api/echelon/market/:asset', async (req, res) => {
    try {
        const { asset } = req.params;
        const marketAddress = echelon.getMarketAddress(asset);
        const info = await echelon.getMarketInfo(marketAddress);

        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ECHELON BORROWING ENDPOINTS
// ============================================

// Borrow from Echelon market
app.post('/api/echelon/borrow', async (req, res) => {
    try {
        const { asset, amount, userAddress } = req.body;
        if (!asset || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: asset, amount'
            });
        }

        const marketAddress = echelon.getMarketAddress(asset);
        const result = await echelon.borrow(marketAddress, amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get borrow payload for Smart Wallet
app.post('/api/echelon/borrow/payload', (req, res) => {
    try {
        const { asset, amount } = req.body;
        const marketAddress = echelon.getMarketAddress(asset);
        const payload = echelon.getBorrowPayload(marketAddress, amount);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Repay to Echelon market
app.post('/api/echelon/repay', async (req, res) => {
    try {
        const { asset, amount, userAddress } = req.body;
        if (!asset || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: asset, amount'
            });
        }

        const marketAddress = echelon.getMarketAddress(asset);
        const result = await echelon.repay(marketAddress, amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get repay payload for Smart Wallet
app.post('/api/echelon/repay/payload', (req, res) => {
    try {
        const { asset, amount } = req.body;
        const marketAddress = echelon.getMarketAddress(asset);
        const payload = echelon.getRepayPayload(marketAddress, amount);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user health factor
app.get('/api/echelon/health/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        const healthData = await echelon.getHealthFactor(userAddress);
        res.json({ success: true, data: healthData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Enable asset as collateral
app.post('/api/echelon/collateral/enable', async (req, res) => {
    try {
        const { asset, userAddress } = req.body;
        if (!asset) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: asset'
            });
        }

        const marketAddress = echelon.getMarketAddress(asset);
        const result = await echelon.enableAsCollateral(marketAddress, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Disable asset as collateral
app.post('/api/echelon/collateral/disable', async (req, res) => {
    try {
        const { asset, userAddress } = req.body;
        if (!asset) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: asset'
            });
        }

        const marketAddress = echelon.getMarketAddress(asset);
        const result = await echelon.disableAsCollateral(marketAddress, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get supply/withdraw payloads for Smart Wallet
app.post('/api/echelon/supply/payload', (req, res) => {
    try {
        const { asset, amount } = req.body;
        const marketAddress = echelon.getMarketAddress(asset);
        const payload = echelon.getSupplyPayload(marketAddress, amount);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/echelon/withdraw/payload', (req, res) => {
    try {
        const { asset, amount } = req.body;
        const marketAddress = echelon.getMarketAddress(asset);
        const payload = echelon.getWithdrawPayload(marketAddress, amount);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// MULTI-PROTOCOL UNIFIED ENDPOINTS
// ============================================

const ProtocolService = require('./src/services/protocolService');
const protocolService = new ProtocolService({
    rpcUrl: process.env.MOVEMENT_RPC_URL || 'https://mainnet.movementnetwork.xyz/v1',
    serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
});

// Get all supported protocols
app.get('/api/protocol/list', (req, res) => {
    try {
        const protocols = protocolService.getSupportedProtocols();
        res.json({ success: true, data: protocols });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unified deposit endpoint
app.post('/api/protocol/deposit', async (req, res) => {
    try {
        const { protocol, asset, amount, userAddress } = req.body;

        if (!protocol || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: protocol, amount'
            });
        }

        const result = await protocolService.deposit(protocol, asset || 'MOVE', amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unified withdraw endpoint
app.post('/api/protocol/withdraw', async (req, res) => {
    try {
        const { protocol, asset, amount, userAddress } = req.body;

        if (!protocol || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: protocol, amount'
            });
        }

        const result = await protocolService.withdraw(protocol, asset || 'MOVE', amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// MERIDIAN DEX ENDPOINTS
// ============================================

const MeridianService = require('./src/services/meridianService');
const meridian = new MeridianService({
    rpcUrl: process.env.MOVEMENT_RPC_URL || 'https://mainnet.movementnetwork.xyz/v1',
    serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
});

// Swap tokens via Meridian
app.post('/api/meridian/swap', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn, minAmountOut, userAddress } = req.body;

        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: tokenIn, tokenOut, amountIn'
            });
        }

        const result = await meridian.swap(tokenIn, tokenOut, amountIn, minAmountOut || '0', userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add liquidity to Meridian pool
app.post('/api/meridian/add-liquidity', async (req, res) => {
    try {
        const { tokenA, tokenB, amountA, amountB, userAddress } = req.body;

        if (!tokenA || !tokenB || !amountA || !amountB) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: tokenA, tokenB, amountA, amountB'
            });
        }

        const result = await meridian.addLiquidity(tokenA, tokenB, amountA, amountB, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove liquidity from Meridian pool
app.post('/api/meridian/remove-liquidity', async (req, res) => {
    try {
        const { tokenA, tokenB, lpTokenAmount, userAddress } = req.body;

        if (!tokenA || !tokenB || !lpTokenAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: tokenA, tokenB, lpTokenAmount'
            });
        }

        const result = await meridian.removeLiquidity(tokenA, tokenB, lpTokenAmount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// Get Deposit Payload (For Smart Wallet Signing)
app.post('/api/protocol/deposit/payload', async (req, res) => {
    try {
        const { protocol, asset, amount, userAddress } = req.body;
        const payload = await protocolManager.getDepositPayload(protocol, asset, amount, userAddress);
        res.json({
            success: true,
            data: payload
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// SWAP AGGREGATOR ENDPOINTS (World-Class Swap)
// ============================================

const SwapService = require('./src/services/swapService');
// Initialize SwapService with the existing MeridianService instance
const swapService = new SwapService({}, meridian);

// Get a quote (Aggregator Logic)
app.get('/api/swap/quote', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn } = req.query;

        if (!tokenIn || !tokenOut || !amountIn) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: tokenIn, tokenOut, amountIn'
            });
        }

        const quote = await swapService.getQuote(tokenIn, tokenOut, amountIn);
        res.json({ success: true, data: quote });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Execute Swap
app.post('/api/swap/execute', async (req, res) => {
    try {
        const { tokenIn, tokenOut, amountIn, minAmountOut, userAddress } = req.body;

        if (!tokenIn || !tokenOut || !amountIn || !userAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const result = await swapService.executeSwap(
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut || '0',
            userAddress
        );
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Supported Tokens
app.get('/api/swap/tokens', async (req, res) => {
    try {
        const tokens = await swapService.getSupportedTokens();
        res.json({ success: true, data: tokens });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// MERIDIAN FARMING ENDPOINTS
// ============================================

const MeridianFarmService = require('./src/services/meridianFarmService');
const meridianFarm = new MeridianFarmService({
    rpcUrl: process.env.MOVEMENT_RPC_URL,
    serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
});

// Get all available farms
app.get('/api/meridian/farms', async (req, res) => {
    try {
        const farms = await meridianFarm.getAllFarms();
        res.json({ success: true, data: farms });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's farm positions
app.get('/api/meridian/farm/positions/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const positions = await meridianFarm.getUserFarmPositions(address);
        res.json({ success: true, data: positions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get pending rewards for a specific farm
app.get('/api/meridian/farm/rewards/:farmId/:address', async (req, res) => {
    try {
        const { farmId, address } = req.params;
        const rewards = await meridianFarm.getPendingRewards(parseInt(farmId), address);
        res.json({ success: true, data: rewards });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Stake LP tokens in farm
app.post('/api/meridian/farm/stake', async (req, res) => {
    try {
        const { farmId, lpTokenType, amount, userAddress } = req.body;
        if (!farmId === undefined || !lpTokenType || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: farmId, lpTokenType, amount'
            });
        }
        const result = await meridianFarm.stakeLPTokens(farmId, lpTokenType, amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get stake payload for Smart Wallet
app.post('/api/meridian/farm/stake/payload', async (req, res) => {
    try {
        const { farmId, lpTokenType, amount } = req.body;
        const payload = meridianFarm.getStakePayload(farmId, lpTokenType, amount);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unstake LP tokens from farm
app.post('/api/meridian/farm/unstake', async (req, res) => {
    try {
        const { farmId, lpTokenType, amount, userAddress } = req.body;
        if (farmId === undefined || !lpTokenType || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: farmId, lpTokenType, amount'
            });
        }
        const result = await meridianFarm.unstakeLPTokens(farmId, lpTokenType, amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get unstake payload for Smart Wallet
app.post('/api/meridian/farm/unstake/payload', async (req, res) => {
    try {
        const { farmId, lpTokenType, amount } = req.body;
        const payload = meridianFarm.getUnstakePayload(farmId, lpTokenType, amount);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Claim farm rewards
app.post('/api/meridian/farm/claim', async (req, res) => {
    try {
        const { farmId, userAddress } = req.body;
        if (farmId === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: farmId'
            });
        }
        const result = await meridianFarm.claimFarmRewards(farmId, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get claim payload for Smart Wallet
app.post('/api/meridian/farm/claim/payload', async (req, res) => {
    try {
        const { farmId } = req.body;
        const payload = meridianFarm.getClaimRewardsPayload(farmId);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// USDM STABLECOIN ENDPOINTS
// ============================================

const USDMService = require('./src/services/usdmService');
const usdm = new USDMService({
    rpcUrl: process.env.MOVEMENT_RPC_URL,
    serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
});

// Mint USDM stablecoin
app.post('/api/meridian/usdm/mint', async (req, res) => {
    try {
        const { collateralType, collateralAmount, usdmAmount, userAddress } = req.body;
        if (!collateralType || !collateralAmount || !usdmAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: collateralType, collateralAmount, usdmAmount'
            });
        }
        const result = await usdm.mintUSDM(collateralType, collateralAmount, usdmAmount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Burn USDM to reclaim collateral
app.post('/api/meridian/usdm/burn', async (req, res) => {
    try {
        const { collateralType, usdmAmount, userAddress } = req.body;
        if (!collateralType || !usdmAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: collateralType, usdmAmount'
            });
        }
        const result = await usdm.burnUSDM(collateralType, usdmAmount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get USDM position
app.get('/api/meridian/usdm/position/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        const { collateralType } = req.query;
        const position = await usdm.getUserPosition(userAddress, collateralType || 'MOVE');
        res.json({ success: true, data: position });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Stability Pool deposit
app.post('/api/meridian/stability-pool/deposit', async (req, res) => {
    try {
        const { amount, userAddress } = req.body;
        if (!amount) {
            return res.status(400).json({ success: false, error: 'Missing required field: amount' });
        }
        const result = await usdm.depositToStabilityPool(amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Stability Pool withdraw
app.post('/api/meridian/stability-pool/withdraw', async (req, res) => {
    try {
        const { amount, userAddress } = req.body;
        if (!amount) {
            return res.status(400).json({ success: false, error: 'Missing required field: amount' });
        }
        const result = await usdm.withdrawFromStabilityPool(amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// MST STAKING ENDPOINTS
// ============================================

const MSTStakingService = require('./src/services/mstStakingService');
const mstStaking = new MSTStakingService({
    rpcUrl: process.env.MOVEMENT_RPC_URL,
    serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
});

// Stake MST tokens
app.post('/api/meridian/mst/stake', async (req, res) => {
    try {
        const { amount, userAddress } = req.body;
        if (!amount) {
            return res.status(400).json({ success: false, error: 'Missing required field: amount' });
        }
        const result = await mstStaking.stake(amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get stake payload for Smart Wallet
app.post('/api/meridian/mst/stake/payload', (req, res) => {
    try {
        const { amount } = req.body;
        const payload = mstStaking.getStakePayload(amount);
        res.json({ success: true, data: payload });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unstake MST tokens
app.post('/api/meridian/mst/unstake', async (req, res) => {
    try {
        const { amount, userAddress } = req.body;
        if (!amount) {
            return res.status(400).json({ success: false, error: 'Missing required field: amount' });
        }
        const result = await mstStaking.unstake(amount, userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Claim MST staking rewards
app.post('/api/meridian/mst/claim', async (req, res) => {
    try {
        const { userAddress } = req.body;
        const result = await mstStaking.claimRewards(userAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user staking info
app.get('/api/meridian/mst/info/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        const info = await mstStaking.getStakingInfo(userAddress);
        res.json({ success: true, data: info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get overall staking stats
app.get('/api/meridian/mst/stats', async (req, res) => {
    try {
        const stats = await mstStaking.getStakingStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Movement DeFi Aggregator running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET /api/defi/overview - Full protocol overview`);
    console.log(`   GET /api/defi/user/:address - User positions`);
    console.log(`   GET /api/defi/combined?wallet=<address> - Combined data`);
    console.log(`   GET /api/prices - Real-time token prices`);
    console.log(`   GET /api/defi/portfolio/:address - Portfolio with USD values`);
    console.log(`   GET /api/defi/metrics - Protocol metrics with REAL APY`);
    console.log(`   --- Satay Finance (On-Chain) ---`);
    console.log(`   GET /api/satay/vaults - All Satay vaults with real APY`);
    console.log(`   GET /api/satay/vault/:asset - Vault by asset name`);
    console.log(`   --- Echelon (On-Chain) ---`);
    console.log(`   GET /api/echelon/markets-data - All Echelon markets`);
    console.log(`   GET /api/echelon/market-data/:asset - Market by asset`);
    console.log(`   --- Meridian DEX ---`);
    console.log(`   POST /api/meridian/swap - Swap tokens`);
    console.log(`   POST /api/meridian/add-liquidity - Add liquidity`);
    console.log(`   POST /api/meridian/remove-liquidity - Remove liquidity`);
    console.log(`   --- Multi-Protocol ---`);
    console.log(`   GET  /api/protocol/list - All protocols`);
    console.log(`   POST /api/protocol/deposit - Deposit to any protocol`);
    console.log(`   POST /api/protocol/withdraw - Withdraw from any protocol`);
});


module.exports = app;

