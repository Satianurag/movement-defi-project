/**
 * Multi-Protocol DeFi Service - Rewritten
 * Routes deposit/withdraw calls to correct protocol service.
 * Uses centralized address registry to prevent duplicate addresses.
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
const { ADDRESSES, getEchelonMarket, getSatayController } = require('../utils/addressRegistry');

// Protocol configurations - single source of truth
const PROTOCOLS = {
    echelon: {
        name: 'Echelon',
        type: 'lending',
        module: 'lending_pool',
        depositFn: 'supply',
        withdrawFn: 'withdraw',
        getAddress: (asset) => getEchelonMarket(asset),
    },
    satay: {
        name: 'Satay Finance',
        type: 'vault',
        module: 'vault',
        depositFn: 'deposit',
        withdrawFn: 'withdraw',
        getAddress: () => getSatayController(),
    },
    meridian: {
        name: 'Meridian',
        type: 'dex',
        module: 'router',
        depositFn: 'add_liquidity',
        withdrawFn: 'remove_liquidity',
        getAddress: () => ADDRESSES.meridian.router,
    },
};

class ProtocolService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
        });

        this.aptos = new Aptos(aptosConfig);

        if (config.serverPrivateKey) {
            try {
                const privateKey = new Ed25519PrivateKey(config.serverPrivateKey);
                this.serverAccount = Account.fromPrivateKey({ privateKey });
            } catch (error) {
                console.error('Failed to init server account:', error.message);
            }
        }
    }

    getProtocol(slug) {
        const normalized = slug?.toLowerCase().replace(/[^a-z]/g, '');
        return PROTOCOLS[normalized] || PROTOCOLS.echelon;
    }

    async deposit(protocolSlug, asset, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        const protocol = this.getProtocol(protocolSlug);
        const address = protocol.getAddress(asset);

        if (!address) {
            throw new Error(`No address found for ${protocol.name}`);
        }

        try {
            // Build function arguments based on protocol type
            let functionArguments = [amount.toString()];

            // Satay vaults need vault address as first argument
            if (protocol.type === 'vault') {
                // For Satay, we need to find the vault address for the asset
                // This is a simplified version - in production, look up vault by asset
                functionArguments = [address, amount.toString()];
            }

            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${address}::${protocol.module}::${protocol.depositFn}`,
                    typeArguments: [],
                    functionArguments,
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            await this.aptos.waitForTransaction({ transactionHash: committedTxn.hash });

            return {
                success: true,
                hash: committedTxn.hash,
                protocol: protocol.name,
                asset,
                amount: amount.toString(),
            };
        } catch (error) {
            throw new Error(`${protocol.name} deposit failed: ${error.message}`);
        }
    }

    async withdraw(protocolSlug, asset, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        const protocol = this.getProtocol(protocolSlug);
        const address = protocol.getAddress(asset);

        if (!address) {
            throw new Error(`No address found for ${protocol.name}`);
        }

        try {
            let functionArguments = [amount.toString()];

            if (protocol.type === 'vault') {
                functionArguments = [address, amount.toString()];
            }

            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${address}::${protocol.module}::${protocol.withdrawFn}`,
                    typeArguments: [],
                    functionArguments,
                },
            });

            const signature = this.aptos.transaction.sign({
                signer: this.serverAccount,
                transaction,
            });

            const committedTxn = await this.aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: signature,
            });

            await this.aptos.waitForTransaction({ transactionHash: committedTxn.hash });

            return {
                success: true,
                hash: committedTxn.hash,
                protocol: protocol.name,
                asset,
                amount: amount.toString(),
            };
        } catch (error) {
            throw new Error(`${protocol.name} withdraw failed: ${error.message}`);
        }
    }

    getSupportedProtocols() {
        return Object.entries(PROTOCOLS).map(([slug, p]) => ({
            slug,
            name: p.name,
            type: p.type,
            hasAddresses: !!p.getAddress(),
        }));
    }
}

module.exports = ProtocolService;
module.exports.PROTOCOLS = PROTOCOLS;
