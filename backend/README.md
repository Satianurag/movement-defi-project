# Movement DeFi Aggregator Backend

A unified REST API that aggregates Movement Network DeFi data from multiple sources into a single call.

## Features

- ✅ **Single API Call** - Get all DeFi data in one request
- 🔗 **Multi-Source Aggregation** - DefiLlama, Movement RPC, GraphQL Indexer
- 💰 **Protocol Coverage** - Canopy, Meridian, MovePosition, Echelon, Native Staking
- 👤 **User Positions** - Query any wallet's complete DeFi holdings
- ⚡ **Fast** - Concurrent API calls with Promise.all

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (defaults work out of the box)
```

### 3. Run Server
```bash
npm start
# or for development
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### 1. Full DeFi Overview
Get all Movement Network protocols with TVL and token data.

```bash
GET /api/defi/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "network": {
      "name": "Movement",
      "chainId": 126,
      "currentBlock": 14875354,
      "totalTVL": 200408734.73,
      "nativeToken": "MOVE"
    },
    "protocols": {
      "canopy": {
        "name": "Canopy",
        "tvl": 36907132.99,
        "addresses": {...},
        "tokens": {...}
      },
      "meridian": {...},
      "moveposition": {...}
    },
    "allProtocols": [...]
  }
}
```

### 2. User Positions
Get a specific wallet's DeFi positions.

```bash
GET /api/defi/user/0x123abc...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "0x123abc...",
    "balances": [
      {
        "asset": "MOVE",
        "amount": "10000000000",
        "decimals": 8,
        "protocol": "native"
      }
    ],
    "totalAssets": 5
  }
}
```

### 3. Combined Data (Everything)
Get overview + user positions in one call.

```bash
GET /api/defi/combined?wallet=0x123abc...
```

## Data Sources

| Source | Used For |
|--------|----------|
| DefiLlama API | Protocol TVL, token amounts |
| Movement RPC | On-chain contract data |
| GraphQL Indexer | User balances, history |

## Project Structure

```
movement-defi-backend/
├── index.js                    # Main server
├── src/
│   ├── aggregator.js          # Main aggregation logic
│   └── fetchers/
│       ├── defiLlamaFetcher.js
│       ├── movementRPCFetcher.js
│       └── graphqlIndexerFetcher.js
├── .env.example
└── package.json
```

## Example Usage

```javascript
// Get full overview
const response = await fetch('http://localhost:3000/api/defi/overview');
const { data } = await response.json();

console.log('Total TVL:', data.network.totalTVL);
console.log('Canopy TVL:', data.protocols.canopy.tvl);

// Get user positions
const userResponse = await fetch('http://localhost:3000/api/defi/user/0x123...');
const userData = await userResponse.json();

console.log('User has', userData.data.totalAssets, 'different assets');
```

## Next Steps

- [ ] Add caching (Redis) for faster responses
- [ ] Add APY calculation endpoints
- [ ] Add WebSocket support for real-time updates
- [ ] Add rate limiting
- [ ] Deploy to production
