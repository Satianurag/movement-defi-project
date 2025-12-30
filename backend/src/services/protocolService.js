/**
 * Multi-Protocol DeFi Service
 * Routes deposit/withdraw calls to correct protocol based on slug.
 * 
 * Protocol Addresses:
 * - Echelon: Lending markets (MOVE, USDC, USDT, wETH, wBTC)
 * - Canopy: Yield vaults (router, vaults)
 * - Meridian: DEX/Staking (no public addresses yet)
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');

// Protocol configurations
const PROTOCOLS = {
    echelon: {
        name: 'Echelon',
        type: 'lending',
        module: 'lending_pool',
        depositFn: 'deposit',
        withdrawFn: 'withdraw',
        markets: {
            MOVE: '0x568f96c4ed010869d810abcf348f4ff6b66d14ff09672fb7b5872e4881a25db7',
            USDC: '0x789d7711b7979d47a1622692559ccd221ef7c35bb04f8762dadb5cc70222a0a0',
            USDT: '0x8191d4b8c0fc0af511b3c56c555528a3e74b7f3cfab3047df9ebda803f3bc3d2',
            wETH: '0x6889932d2ff09c9d299e72b23a62a7f07af807789c98141d08475701e7b21b7c',
            wBTC: '0xa24e2eaacf9603538af362f44dfcf9d411363923b9206260474abfaa8abebee4',
        }
    },
    canopy: {
        name: 'Canopy',
        type: 'vault',
        module: 'vault',
        depositFn: 'deposit',
        withdrawFn: 'withdraw',
        addresses: {
            router: '0x717b417949cd5bfa6dc02822eacb727d820de2741f6ea90bf16be6c0ed46ff4b',
            vaults: '0xb10bd32b3979c9d04272c769d9ef52afbc6edc4bf03982a9e326b96ac25e7f2d',
        }
    },
    meridian: {
        name: 'Meridian',
        type: 'dex',
        module: 'router',
        depositFn: 'add_liquidity',
        withdrawFn: 'remove_liquidity',
        addresses: {}
    },
    moveposition: {
        name: 'MovePosition',
        type: 'lending',
        module: 'lending',
        depositFn: 'supply',
        withdrawFn: 'withdraw',
        addresses: {}
    }
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

    getAddress(protocol, asset = 'MOVE') {
        if (protocol.markets) {
            return protocol.markets[asset] || protocol.markets.MOVE;
        }
        return protocol.addresses?.vaults || protocol.addresses?.router;
    }

    async deposit(protocolSlug, asset, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured');
        }

        const protocol = this.getProtocol(protocolSlug);
        const address = this.getAddress(protocol, asset);

        if (!address) {
            throw new Error(`No address found for ${protocol.name}`);
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${address}::${protocol.module}::${protocol.depositFn}`,
                    typeArguments: [],
                    functionArguments: [amount],
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
                amount,
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
        const address = this.getAddress(protocol, asset);

        if (!address) {
            throw new Error(`No address found for ${protocol.name}`);
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${address}::${protocol.module}::${protocol.withdrawFn}`,
                    typeArguments: [],
                    functionArguments: [amount],
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
                amount,
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
            hasAddresses: Object.keys(p.markets || p.addresses || {}).length > 0,
        }));
    }
}

module.exports = ProtocolService;
module.exports.PROTOCOLS = PROTOCOLS;
