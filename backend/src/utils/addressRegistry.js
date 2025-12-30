/**
 * Address Registry
 * Central source of truth for all protocol addresses on Movement Network.
 * Prevents duplicate/conflicting addresses across the codebase.
 */

const ADDRESSES = {
    // Satay Finance (Yield Aggregator)
    satay: {
        controller: '0xb10bd32b3979c9d04272c769d9ef52afbc6edc4bf03982a9e326b96ac25e7f2d',
        // Strategy addresses discovered from vaults_view
        strategies: {
            avalon: '0xd7c7b27e361434e18d2410fd02f7140a8c10d174c9be0efd5324578d243953bd',
            layerbank: '0xad1b34939f164ec6f6c0157da3a30bf9e5d408250978691872a79aa584852b85',
        },
    },

    // Echelon (Lending Protocol)
    echelon: {
        core: '0x8f13af22fcc2eb15e8e0aebcdbcc4e9e0c3c366d6f2cb4bbd5ea6f7e8e7d2c54',
        markets: {
            MOVE: '0x568f96c4ed010869d810abcf348f4ff6b66d14ff09672fb7b5872e4881a25db7',
            USDC: '0x789d7711b7979d47a1622692559ccd221ef7c35bb04f8762dadb5cc70222a0a0',
            USDT: '0x8191d4b8c0fc0af511b3c56c555528a3e74b7f3cfab3047df9ebda803f3bc3d2',
            wETH: '0x6889932d2ff09c9d299e72b23a62a7f07af807789c98141d08475701e7b21b7c',
            wBTC: '0xa24e2eaacf9603538af362f44dfcf9d411363923b9206260474abfaa8abebee4',
            solvBTC: '0x185f42070ab2ca5910ebfdea83c9f26f4015ad2c0f5c8e6ca1566d07c6c60aca',
            LBTC: '0x62cb5f64b5a9891c57ff12d38fbab141e18c3d63e859a595ff6525b4221eaf23',
            ezETH: '0x8dd513b2bb41f0180f807ecaa1e0d2ddfacd57bf739534201247deca13f3542',
            rsETH: '0x4cbeca747528f340ef9065c93dea0cc1ac8a46b759e31fc8b8d04bc52a86614b',
            sUSDe: '0x481fe68db505bc15973d0014c35217726efd6ee353d91a2a9faaac201f3423d',
        },
    },

    // Meridian (DEX + Farming + Lending + USDM) - By Thala Labs
    // API: https://app.meridian.money/api/liquidity-pools
    meridian: {
        // VERIFIED - Main entry point for swaps and liquidity
        router: '0xc36ceb6d7b137cea4897d4bc82d8e4d8be5f964c4217dbc96b0ba03cc64070f4',

        // Farm/MasterChef - Module: ::farm::
        // STATUS: Deployment Scheduled (not yet live on mainnet)
        // Search Movement Explorer for accounts with deployed ::farm:: module
        farm: '0xc36ceb6d7b137cea4897d4bc82d8e4d8be5f964c4217dbc96b0ba03cc64070f4', // Uses router address until farm module deployed

        // USDM Stablecoin - Module: ::trove::
        // STATUS: Partial/Scaling Phase
        usdm: {
            // Trove module handles CDP (Collateralized Debt Position) for minting
            mint: '0xc36ceb6d7b137cea4897d4bc82d8e4d8be5f964c4217dbc96b0ba03cc64070f4::trove',
            stabilityPool: '0xc36ceb6d7b137cea4897d4bc82d8e4d8be5f964c4217dbc96b0ba03cc64070f4::stability_pool',
        },

        // MST Token Staking - Module: ::mst_staking::
        // STATUS: Live with validator integration
        mstStaking: '0xc36ceb6d7b137cea4897d4bc82d8e4d8be5f964c4217dbc96b0ba03cc64070f4::mst_staking',

        // Meridian Lend (separate from swap)
        lend: '0xc36ceb6d7b137cea4897d4bc82d8e4d8be5f964c4217dbc96b0ba03cc64070f4::lending',
    },

    // Token Addresses (Fungible Assets)
    tokens: {
        'USDC.e': '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39',
        'USDT.e': '0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d',
        'WETH.e': '0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376',
        'WBTC.e': '0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c',
    },
};

// Helper functions
function getSatayController() {
    return ADDRESSES.satay.controller;
}

function getEchelonMarket(asset) {
    return ADDRESSES.echelon.markets[asset] || ADDRESSES.echelon.markets.MOVE;
}

function getMeridianRouter() {
    return ADDRESSES.meridian.router;
}

function getTokenAddress(symbol) {
    return ADDRESSES.tokens[symbol] || null;
}

function getStrategyName(strategyAddress) {
    const normalized = strategyAddress.toLowerCase();
    if (normalized === ADDRESSES.satay.strategies.avalon.toLowerCase()) {
        return 'Avalon';
    }
    if (normalized === ADDRESSES.satay.strategies.layerbank.toLowerCase()) {
        return 'Layerbank';
    }
    return 'Unknown Strategy';
}

module.exports = {
    ADDRESSES,
    getSatayController,
    getEchelonMarket,
    getMeridianRouter,
    getTokenAddress,
    getStrategyName,
};
