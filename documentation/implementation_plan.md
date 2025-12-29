# Professional APY Tracking System - Implementation Plan

## 🎯 Goal
Build a production-ready APY tracking system that provides **real, calculated APY data** from on-chain sources with historical tracking and automated updates.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Server                        │
│  ┌───────────────┬────────────────┬──────────────────────┐  │
│  │ Price Feeds   │ APY Calculator │ Historical Analytics │  │
│  └───────────────┴────────────────┴──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
          ┌───────────┐ ┌──────────┐ ┌────────────┐
          │PostgreSQL │ │Movement  │ │ External   │
          │ Database  │ │   RPC    │ │   APIs     │
          └───────────┘ └──────────┘ └────────────┘
                 ▲
                 │
          ┌──────────────┐
          │ Node-Cron    │
          │  Scheduler   │
          └──────────────┘
```

---

## 📊 Database Schema

### Table: `vault_snapshots`
```sql
CREATE TABLE vault_snapshots (
    id SERIAL PRIMARY KEY,
    vault_address VARCHAR(66) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    share_price DECIMAL(36, 18) NOT NULL,
    total_assets DECIMAL(36, 18),
    total_supply DECIMAL(36, 18),
    tvl_usd DECIMAL(20, 2),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    block_number BIGINT,
    UNIQUE(vault_address, timestamp)
);
CREATE INDEX idx_vault_timestamp ON vault_snapshots(vault_address, timestamp DESC);
```

### Table: `apy_calculations`
```sql
CREATE TABLE apy_calculations (
    id SERIAL PRIMARY KEY,
    vault_address VARCHAR(66) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    apy_7d DECIMAL(10, 4),
    apy_30d DECIMAL(10, 4),
    apy_90d DECIMAL(10, 4),
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    data_points_used INT
);
CREATE INDEX idx_apy_vault ON apy_calculations(vault_address, calculated_at DESC);
```

### Table: `pool_snapshots` (for DEXs)
```sql
CREATE TABLE pool_snapshots (
    id SERIAL PRIMARY KEY,
    pool_address VARCHAR(66) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    reserve0 DECIMAL(36, 18),
    reserve1 DECIMAL(36, 18),
    volume_24h DECIMAL(20, 2),
    fee_rate DECIMAL(5, 4),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Table: `lending_rates` (for Echelon)
```sql
CREATE TABLE lending_rates (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(66) NOT NULL,
    asset VARCHAR(20) NOT NULL,
    supply_rate DECIMAL(10, 6),
    borrow_rate DECIMAL(10, 6),
    utilization DECIMAL(5, 4),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 🔧 Implementation Components

### 1. Database Service
**File:** `src/services/databaseService.js`

**Responsibilities:**
- PostgreSQL connection management
- CRUD operations for snapshots
- Query optimization
- Data retention policies

**Key Methods:**
```javascript
- saveVaultSnapshot(vaultData)
- getVaultSnapshots(vaultAddress, days)
- saveAPYCalculation(apyData)
- getLatestAPY(vaultAddress)
```

---

### 2. Smart Contract Fetcher
**File:** `src/services/contractFetcher.js`

**Responsibilities:**
- Query vault share prices
- Get pool reserves
- Fetch lending rates
- Handle RPC errors

**Key Functions:**
```javascript
// Canopy vaults
async getVaultSharePrice(vaultAddress) {
    const result = await rpc.view({
        function: `${vaultAddress}::vault::share_price`,
        arguments: []
    });
    return result;
}

// Meridian pools
async getPoolReserves(poolAddress) {
    const result = await rpc.view({
        function: `${poolAddress}::pool::get_reserves`,
        arguments: []
    });
    return {reserve0: result[0], reserve1: result[1]};
}
```

---

### 3. Data Collector
**File:** `src/services/dataCollector.js`

**Responsibilities:**
- Scheduled data collection
- Batch processing
- Error handling & retries
- Data validation

**Schedule:**
- **Every 6 hours:** Vault snapshots
- **Every 1 hour:** Lending rates
- **Every 15 minutes:** DEX pool data

---

### 4. APY Calculator
**File:** `src/services/apyCalculator.js`

**Real Calculations:**

**Vault APY (from share price):**
```javascript
calculateVaultAPY(snapshots, days) {
    const latest = snapshots[0];
    const past = snapshots.find(s => 
        diffDays(s.timestamp, latest.timestamp) >= days
    );
    
    if (!past) return null;
    
    const priceRatio = latest.share_price / past.share_price;
    const actualDays = diffDays(past.timestamp, latest.timestamp);
    const annualizationFactor = 365 / actualDays;
    
    return (Math.pow(priceRatio, annualizationFactor) - 1) * 100;
}
```

**LP APY (from volume):**
```javascript
calculateLPAPY(poolData) {
    const { volume_24h, tvl, fee_rate } = poolData;
    const dailyFees = volume_24h * fee_rate;
    const annualFees = dailyFees * 365;
    return (annualFees / tvl) * 100;
}
```

---

### 5. Scheduler
**File:** `src/services/scheduler.js`

**Using:** `node-cron`

```javascript
const cron = require('node-cron');

// Every 6 hours - collect vault data
cron.schedule('0 */6 * * *', collectVaultSnapshots);

// Every hour - collect lending rates  
cron.schedule('0 * * * *', collectLendingRates);

// Every 15 minutes - collect DEX data
cron.schedule('*/15 * * * *', collectDEXData);
```

---

## 🌐 New API Endpoints

### 1. Historical Vault Data
```
GET /api/vaults/:address/history?days=30
Response: {
    vault: { address, protocol, name },
    snapshots: [{share_price, tvl, timestamp}],
    count: 120
}
```

### 2. Real APY
```
GET /api/vaults/:address/apy
Response: {
    vault_address,
    apy_7d: 12.34,
    apy_30d: 14.56,
    apy_90d: 13.89,
    last_updated,
    data_quality: "excellent" // based on data points
}
```

### 3. All Vaults Performance
```
GET /api/vaults/performance
Response: {
    vaults: [
        {
            address,
            protocol,
            tvl,
            apy_30d,
            trending: "up"  // based on recent changes
        }
    ]
}
```

### 4. Protocol Analytics
```
GET /api/protocols/:name/analytics
Response: {
    protocol,
    total_tvl,
    avg_apy,
    best_vault: {address, apy},
    historical_performance: [{date, avg_apy}]
}
```

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "pg": "^8.11.0",              // PostgreSQL client
    "node-cron": "^3.0.3",        // Scheduler
    "dotenv": "^16.3.1",          // Already have
    "axios": "^1.6.0"             // Already have
  }
}
```

---

## 🚀 Deployment Steps

### Step 1: Database Setup
```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
createdb movement_defi

# Run migrations
psql movement_defi < migrations/001_initial_schema.sql
```

### Step 2: Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/movement_defi
COLLECTION_INTERVAL_HOURS=6
ENABLE_SCHEDULER=true
```

### Step 3: Initial Data Collection
```bash
# Backfill historical data (if available)
npm run backfill:vaults

# Start scheduler
npm run start:scheduler
```

### Step 4: API Server
```bash
# Production mode
npm run start
```

---

## ⏱️ Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Database Setup | 2 hours | Schema + migrations |
| Contract Fetcher | 4 hours | Working RPC queries |
| Data Collector | 3 hours | Automated snapshots |
| APY Calculator | 3 hours | Real calculations |
| API Endpoints | 2 hours | New routes |
| Testing | 2 hours | Verified accuracy |
| **Total** | **16 hours** | Production system |

---

## ✅ Success Criteria

1. **Data Collection:**
   - ✅ Vault snapshots every 6 hours
   - ✅ Zero data loss
   - ✅ Error handling & retries

2. **APY Accuracy:**
   - ✅ Calculated from real on-chain data
   - ✅ Multiple timeframes (7d, 30d, 90d)
   - ✅ Matches protocol UI (±0.5%)

3. **Performance:**
   - ✅ API response < 500ms
   - ✅ Database queries optimized
   - ✅ Scalable to 100+ vaults

4. **Reliability:**
   - ✅ 99% uptime
   - ✅ Automatic recovery
   - ✅ Data validation

---

## 🎯 Next Steps

1. **Approve this plan**
2. **Set up PostgreSQL database**
3. **Implement database service**
4. **Create smart contract fetchers**
5. **Build data collector**
6. **Implement APY calculator**
7. **Add new API endpoints**
8. **Test with real data**
9. **Deploy to production**

This will give us **professional-grade, real APY data** based on actual on-chain historical tracking.
