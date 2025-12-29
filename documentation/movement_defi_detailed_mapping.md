# Movement DeFi: Definitive Data Mapping (One API per Metric)

This document provides a single, unambiguous source for every data point required for your application. Use these specific sources to aggregate a complete view of any DeFi position on Movement Network.

## 1. Universal Data Sources (Cross-Protocol)

| Data Type | Primary Source API / Method | Description |
| :--- | :--- | :--- |
| **Total Value Locked (TVL)** | [DefiLlama API](https://api.llama.fi/protocol/canopy) | Best for aggregate protocol TVL and historical trends. |
| **User Token Balances** | [Movement GraphQL Indexer](https://indexer.mainnet.movementnetwork.xyz/v1/graphql) | Get every asset in a wallet with one query. |
| **Asset Prices** | [Pyth Network Oracle](https://pyth.network/price-feeds/crypto-move-usd) | Real-time price feeds for MOVE, BTC, ETH, etc. |
| **Gas/Transaction Status** | [Movement RPC](https://full.mainnet.movementinfra.xyz/v1) | Verify tx success and gas estimation. |

---

## 2. Protocol-Specific Data Mappings

### A. Native Staking (MOVE)
| Metric | Source API / Call Path | Implementation Detail |
| :--- | :--- | :--- |
| **Staked Amount**| RPC `0x1::delegation_pool::get_stake` | Pass `pool_address` and `delegator_address`. |
| **Staking APY** | Formula (Off-chain) | `(InflationRate - Commission)`. Inflation ~10% currently. |
| **Validator Comm.** | RPC `0x1::delegation_pool::operator_commission_percentage` | Direct view function for pool commission. |
| **Rewards** | RPC (Subtract `initial_stake` from `total_stake`) | Staking rewards accumulate in the `active` balance. |

### B. Canopy Hub (Satay Yield Engine)
| Metric | Source API / Call Path | Implementation Detail |
| :--- | :--- | :--- |
| **Vault APY** | Formula (Share Price change) | `((SharePrice_Today / SharePrice_Start) ^ (365/Days)) - 1`. |
| **Vault TVL** | RPC `/accounts/{vault_addr}/resources` | Sum of all asset amounts in the vault resource. |
| **User Position**| Indexer `current_fungible_asset_balances` | Track the vault "Share Token" (e.g., `cvUSDC`). |
| **Fees** | RPC `/accounts/{router_addr}/resources` | Check `ManageFees` struct for 1.5% Mgmt / 0% Perf. |

### C. Echelon Market (Lending)
| Metric | Source API / Call Path | Implementation Detail |
| :--- | :--- | :--- |
| **Supply Rate** | RPC `Market::get_reserve_data` | Returns current annualized supply APY for an asset. |
| **Borrow Rate** | RPC `Market::get_reserve_data` | Returns current annualized borrow APR. |
| **Collateral TVL** | RPC `Market::get_market_info` | Total assets deposited across the market. |
| **Liquidation LTV** | RPC `Market::get_asset_params` | Max Loan-to-Value ratio for the asset. |

### D. Meridian AMM (DEX)
| Metric | Source API / Call Path | Implementation Detail |
| :--- | :--- | :--- |
| **LP Pool TVL** | RPC `MeridianAMM::Pool::get_reserves` | `(Res0 * Price0) + (Res1 * Price1)`. |
| **Trading APR** | Formula (Volume/Liquidity) | `(24h_Volume * 0.003 * 365) / Pool_TVL`. |
| **User Liquidity** | Indexer `current_fungible_asset_balances` | Track the LP token balance in user's account. |

---

## 3. Implementation Quick-Reference

### Multi-Token Price Fetch (Pyth)
- **Contract**: `0x9357e76fe965c9956a76181ee49f66d51b7f9c3800182a944ed96be86301e49f`
- **MOVE/USD Feed**: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665ed50e18987d6051`

### Global Balance Fetch (Indexer)
```graphql
query AllBalances($owner: String!) {
  current_fungible_asset_balances(
    where: {owner_address: {_eq: $owner}}
  ) {
    asset_type
    amount
    metadata {
      name
      symbol
      decimals
    }
  }
}
```

> [!IMPORTANT]
> Always use the **Indexer** for user history and current balances, and **RPC** only for real-time protocol-state calculations (like APY share prices).
