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

// ============================================
// ECHELON LENDING PROTOCOL ENDPOINTS
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Movement DeFi Aggregator running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET /api/defi/overview - Full protocol overview`);
    console.log(`   GET /api/defi/user/:address - User positions`);
    console.log(`   GET /api/defi/combined?wallet=<address> - Combined data`);
    console.log(`   GET /api/prices - Real-time token prices`);
    console.log(`   GET /api/defi/portfolio/:address - Portfolio with USD values`);
    console.log(`   GET /api/defi/metrics - Protocol metrics with APY`);
    console.log(`   --- Multi-Protocol ---`);
    console.log(`   GET  /api/protocol/list - All protocols`);
    console.log(`   POST /api/protocol/deposit - Deposit to any protocol`);
    console.log(`   POST /api/protocol/withdraw - Withdraw from any protocol`);
});


module.exports = app;

