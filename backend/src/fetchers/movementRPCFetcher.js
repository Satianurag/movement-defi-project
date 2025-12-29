const axios = require('axios');

class MovementRPCFetcher {
    constructor(rpcUrl) {
        this.rpcUrl = rpcUrl;
    }

    async getChainInfo() {
        try {
            const response = await axios.get(this.rpcUrl);
            return {
                chainId: response.data.chain_id,
                blockHeight: response.data.block_height,
                ledgerVersion: response.data.ledger_version
            };
        } catch (error) {
            console.error('RPC chain info error:', error.message);
            return null;
        }
    }

    async getAccountResources(address) {
        try {
            const response = await axios.get(`${this.rpcUrl}/accounts/${address}/resources`);
            return response.data;
        } catch (error) {
            console.error(`RPC account resources error for ${address}:`, error.message);
            return [];
        }
    }

    async callViewFunction(functionPath, typeArguments = [], args = []) {
        try {
            const response = await axios.post(`${this.rpcUrl}/view`, {
                function: functionPath,
                type_arguments: typeArguments,
                arguments: args
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error(`RPC view function error for ${functionPath}:`, error.message);
            return null;
        }
    }

    async getStakingInfo(poolAddress, delegatorAddress) {
        try {
            const result = await this.callViewFunction(
                '0x1::delegation_pool::get_stake',
                [],
                [poolAddress, delegatorAddress]
            );
            if (result && result.length === 3) {
                return {
                    active: result[0],
                    inactive: result[1],
                    pending_inactive: result[2]
                };
            }
            return null;
        } catch (error) {
            console.error('Staking info error:', error.message);
            return null;
        }
    }
}

module.exports = MovementRPCFetcher;
