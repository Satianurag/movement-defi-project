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
});

module.exports = app;
