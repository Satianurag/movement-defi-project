const axios = require('axios');

class GraphQLIndexerFetcher {
    constructor(graphqlUrl) {
        this.graphqlUrl = graphqlUrl;
    }

    async query(queryString, variables = {}) {
        try {
            const response = await axios.post(this.graphqlUrl, {
                query: queryString,
                variables
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data.data;
        } catch (error) {
            console.error('GraphQL query error:', error.message);
            return null;
        }
    }

    async getUserBalances(ownerAddress, limit = 50) {
        const query = `
      query GetBalances($owner: String!, $limit: Int!) {
        current_fungible_asset_balances(
          where: {owner_address: {_eq: $owner}},
          limit: $limit
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
    `;

        const result = await this.query(query, { owner: ownerAddress, limit });
        return result?.current_fungible_asset_balances || [];
    }

    async getAllAssetBalances(limit = 100) {
        const query = `
      query GetAllBalances($limit: Int!) {
        current_fungible_asset_balances(limit: $limit) {
          asset_type
          amount
          owner_address
        }
      }
    `;

        const result = await this.query(query, { limit });
        return result?.current_fungible_asset_balances || [];
    }

    async getUserTransactions(address, limit = 50) {
        const query = `
        query GetUserTransactions($address: String, $limit: Int) {
            user_transactions(
                limit: $limit
                order_by: {timestamp: desc}
                where: {sender: {_eq: $address}}
            ) {
                version
                hash
                sender
                sequence_number
                success
                timestamp
                entry_function_id_str
                gas_unit_price
                max_gas_amount
                gas_used
                vm_status
            }
        }
    `;
        const result = await this.query(query, { address, limit });
        return result?.user_transactions || [];
    }
}

module.exports = GraphQLIndexerFetcher;
