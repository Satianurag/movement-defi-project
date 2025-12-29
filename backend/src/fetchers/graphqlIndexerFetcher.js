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
}

module.exports = GraphQLIndexerFetcher;
