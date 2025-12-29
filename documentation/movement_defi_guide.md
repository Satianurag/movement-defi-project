# Movement Network DeFi Data Extraction Guide

This technical guide provides the exact smart contract addresses, Move module paths, and view functions required to extract real-time DeFi data from the Movement Network.

## 1. Core Network Data
- **Chain ID:** `126` (Wallet) / `3073` (DefiLlama)
- **RPC Endpoint:** `https://full.mainnet.movementinfra.xyz/v1`
- **GraphQL Indexer:** `https://indexer.mainnet.movementnetwork.xyz/v1/graphql`

---

## 2. On-Chain DeFi Protocols

### Native Staking (MOVE)
- **Module Path:** `0x1::delegation_pool`
- **View Functions:**
    - `get_stake(pool_address, delegator_address)`: Returns `(active, inactive, pending_inactive)` u64.
    - `operator_commission_percentage(pool_address)`: Returns u64 commission.
- **APY Formula:** ~10% annual inflation minus commission.

### Canopy Hub (Satay Yield Engine)
- **Router Address:** `0x717b417949cd5bfa6dc02822eacb727d820de2741f6ea90bf16be6c0ed46ff4b`
- **Core Vaults:** `0xb10bd32b3979c9d04272c769d9ef52afbc6edc4bf03982a9e326b96ac25e7f2d`
- **APY Calculation:**
    - Call `get_vault_info` (if available) or query share price: `Total Assets / Total Supply`.
    - Historical APR = `(Share Price T2 / Share Price T1)^(365/days) - 1`.

### Echelon Market (Lending)
- **Mainnet Address:** `0x568f96c4ed010869d810abcf348f4ff6b66d14ff09672fb7b5872e4881a25db7` (Market MOVE)
- **View Function:** `get_reserve_data(asset_address)`
- **Data Points:** Returns supply/borrow rates, utilization, and reserve factors.

### Meridian AMM (DEX)
- **Module:** `MeridianAMM::Pool`
- **View Function:** `get_reserves(pool_address)`
- **APR Calculation:** Based on 24h volume/liquidity fees.

---

## 3. Real-Time Price Oracles

### Pyth Network (Mainnet)
- **Contract Address:** `0x9357e76fe965c9956a76181ee49f66d51b7f9c3800182a944ed96be86301e49f`
- **Function:** `get_price(price_feed_id)`
- **MOVE Price Feed ID:** `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665ed50e18987d6051`

---

## 4. Implementation Methods

### RPC `view` Call Example (JSON-RPC)
```json
{
  "function": "0x1::delegation_pool::get_stake",
  "type_arguments": [],
  "arguments": ["<POOL_ADDR>", "<USER_ADDR>"]
}
```

### GraphQL Query for Balances
```graphql
query GetBalances($owner: String!) {
  current_fungible_asset_balances(where: {owner_address: {_eq: $owner}}) {
    asset_type
    amount
  }
}
```

### Gas Sponsorship (Shinami)
- Use **Shinami Gas Station** to sponsor $MOVE transactions for users on mainnet.
