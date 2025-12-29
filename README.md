# Movement DeFi Backend - Complete Project

## 📁 Project Structure

```
movement-defi-project/
├── backend/                    # Node.js Backend API
│   ├── src/
│   │   ├── aggregator.js      # Main aggregation service
│   │   ├── fetchers/          # Data fetchers
│   │   │   ├── defiLlamaFetcher.js
│   │   │   ├── movementRPCFetcher.js
│   │   │   ├── graphqlIndexerFetcher.js
│   │   │   ├── priceOracleFetcher.js
│   │   │   └── vaultAPYFetcher.js
│   │   └── utils/
│   │       └── apyCalculator.js
│   ├── index.js               # Express server
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── documentation/             # All project documentation
    ├── final_test_report.md           # ✅ Latest test results
    ├── backend_walkthrough.md         # API usage guide
    ├── real_data_extraction_report.md # Data sources explained
    ├── apy_data_sources_research.md   # APY research findings
    ├── movement_defi_detailed_mapping.md
    ├── comprehensive_test_report.md
    ├── implementation_plan.md
    └── task.md
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ~/Desktop/movement-defi-project/backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings (defaults work fine)
```

### 3. Start Server
```bash
npm start
# Server runs on http://localhost:3000
```

### 4. Test API
```bash
# Health check
curl http://localhost:3000/health

# Get prices
curl http://localhost:3000/api/prices

# Get protocols with APY
curl http://localhost:3000/api/defi/metrics

# Get user portfolio
curl http://localhost:3000/api/defi/portfolio/YOUR_WALLET_ADDRESS
```

## 📊 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/prices` | Real-time token prices (Pyth) |
| `GET /api/defi/overview` | Network & protocols overview |
| `GET /api/defi/metrics` | **Protocols with APY data** |
| `GET /api/defi/portfolio/:address` | User portfolio + USD values |
| `GET /api/defi/user/:address` | User token balances |
| `GET /api/defi/combined?wallet=` | Combined data |

## ✨ Key Features

✅ **Real Data Sources**
- TVL from DefiLlama
- Prices from Pyth Oracle + CoinGecko
- Balances from Movement GraphQL Indexer
- APY calculated from 7d TVL changes

✅ **Production Ready**
- No database required
- Fast responses (<500ms)
- Error handling
- CORS enabled

✅ **Simple Integration**
- RESTful API
- JSON responses
- Clear documentation

## 📖 Documentation

All documentation is in the `documentation/` folder:

1. **START HERE:** `final_test_report.md` - Latest test results & verification
2. **API Guide:** `backend_walkthrough.md` - How to use the API
3. **Data Sources:** `real_data_extraction_report.md` - Where data comes from
4. **APY Research:** `apy_data_sources_research.md` - APY calculation explained

## 🎯 What This Does

Aggregates all Movement Network DeFi data into a single unified API:

- **Network TVL:** $200M+ tracked
- **Protocols:** Canopy, Meridian, MovePosition, and 6 more
- **Real APY:** Calculated from on-chain data
- **Live Prices:** BTC, ETH, USDC, MOVE
- **User Portfolios:** Balance tracking with USD values

## 🔧 Tech Stack

- **Backend:** Node.js + Express
- **Data Sources:** DefiLlama, Movement RPC, GraphQL Indexer, Pyth Oracle
- **No Database:** Stateless architecture
- **Deployment:** Ready for Vercel, Railway, AWS

## 📞 Support

- All code is documented
- See `documentation/` for guides
- Backend is production-ready
- Ready for frontend integration

---

**Made with ❤️ for Movement Network DeFi**
