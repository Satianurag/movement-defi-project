/**
 * Echelon Lending Service
 * Interfaces with Echelon Protocol on Movement Network using Aptos TypeScript SDK.
 * 
 * Market Addresses (Movement Mainnet):
 * - MOVE: 0x568f96c4ed010869d810abcf348f4ff6b66d14ff09672fb7b5872e4881a25db7
 * - USDC: 0x789d7711b7979d47a1622692559ccd221ef7c35bb04f8762dadb5cc70222a0a0
 * - USDT: 0x8191d4b8c0fc0af511b3c56c555528a3e74b7f3cfab3047df9ebda803f3bc3d2
 * - wETH: 0x6889932d2ff09c9d299e72b23a62a7f07af807789c98141d08475701e7b21b7c
 * - wBTC: 0xa24e2eaacf9603538af362f44dfcf9d411363923b9206260474abfaa8abebee4
 */

const { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');

// Echelon Protocol Core Module Address
const ECHELON_CORE = '0x8f13af22fcc2eb15e8e0aebcdbcc4e9e0c3c366d6f2cb4bbd5ea6f7e8e7d2c54';

// Market addresses for different assets
const MARKET_ADDRESSES = {
    MOVE: '0x568f96c4ed010869d810abcf348f4ff6b66d14ff09672fb7b5872e4881a25db7',
    USDC: '0x789d7711b7979d47a1622692559ccd221ef7c35bb04f8762dadb5cc70222a0a0',
    USDT: '0x8191d4b8c0fc0af511b3c56c555528a3e74b7f3cfab3047df9ebda803f3bc3d2',
    wETH: '0x6889932d2ff09c9d299e72b23a62a7f07af807789c98141d08475701e7b21b7c',
    wBTC: '0xa24e2eaacf9603538af362f44dfcf9d411363923b9206260474abfaa8abebee4',
    solvBTC: '0x185f42070ab2ca5910ebfdea83c9f26f4015ad2c0f5c8e6ca1566d07c6c60aca',
    LBTC: '0x62cb5f64b5a9891c57ff12d38fbab141e18c3d63e859a595ff6525b4221eaf23',
    ezETH: '0x8dd513b2bb41f0180f807ecaa1e0d2ddfacd57bf739534201247deca13f3542',
    rsETH: '0x4cbeca747528f340ef9065c93dea0cc1ac8a46b759e31fc8b8d04bc52a86614b',
    sUSDe: '0x481fe68db505bc15973d0014c35217726efd6ee353d91a2a9faaac201f3423d',
};

class EchelonService {
    constructor(config) {
        const aptosConfig = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: config.rpcUrl || 'https://mainnet.movementnetwork.xyz/v1',
            faucet: config.faucetUrl || 'https://faucet.movementnetwork.xyz/',
        });

        this.aptos = new Aptos(aptosConfig);
        this.serverPrivateKey = config.serverPrivateKey;

        if (this.serverPrivateKey) {
            try {
                const privateKey = new Ed25519PrivateKey(this.serverPrivateKey);
                this.serverAccount = Account.fromPrivateKey({ privateKey });
            } catch (error) {
                console.error('Failed to initialize server account:', error.message);
            }
        }
    }

    getMarketAddress(asset) {
        return MARKET_ADDRESSES[asset] || MARKET_ADDRESSES.MOVE;
    }

    getSupportedMarkets() {
        return Object.keys(MARKET_ADDRESSES).map(asset => ({
            asset,
            address: MARKET_ADDRESSES[asset]
        }));
    }

    async supply(marketAddress, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            // Echelon entry function: entry_deposit or deposit
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::deposit`,
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

            const response = await this.aptos.waitForTransaction({
                transactionHash: committedTxn.hash,
            });

            return {
                success: true,
                hash: committedTxn.hash,
                response,
                marketAddress,
                amount,
                userAddress,
            };
        } catch (error) {
            console.error('Supply error:', error);
            throw new Error(`Failed to supply: ${error.message}`);
        }
    }

    async withdraw(marketAddress, amount, userAddress) {
        if (!this.serverAccount) {
            throw new Error('Server account not configured. Set SERVER_PRIVATE_KEY in .env');
        }

        try {
            const transaction = await this.aptos.transaction.build.simple({
                sender: this.serverAccount.accountAddress,
                data: {
                    function: `${marketAddress}::lending_pool::withdraw`,
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

            const response = await this.aptos.waitForTransaction({
                transactionHash: committedTxn.hash,
            });

            return {
                success: true,
                hash: committedTxn.hash,
                response,
                marketAddress,
                amount,
                userAddress,
            };
        } catch (error) {
            console.error('Withdraw error:', error);
            throw new Error(`Failed to withdraw: ${error.message}`);
        }
    }

    async getUserPosition(userAddress, marketAddress) {
        try {
            const viewPayload = {
                function: `${marketAddress}::lending_pool::get_user_position`,
                typeArguments: [],
                functionArguments: [userAddress],
            };

            const result = await this.aptos.view({ payload: viewPayload });

            return {
                success: true,
                userAddress,
                marketAddress,
                supplied: result[0] || '0',
                borrowed: result[1] || '0',
            };
        } catch (error) {
            return {
                success: true,
                userAddress,
                marketAddress,
                supplied: '0',
                borrowed: '0',
            };
        }
    }

    async getMarketInfo(marketAddress) {
        try {
            const viewPayload = {
                function: `${marketAddress}::lending_pool::get_market_info`,
                typeArguments: [],
                functionArguments: [],
            };

            const result = await this.aptos.view({ payload: viewPayload });

            return {
                success: true,
                marketAddress,
                totalSupplied: result[0] || '0',
                totalBorrowed: result[1] || '0',
                supplyRate: result[2] || '0',
                borrowRate: result[3] || '0',
            };
        } catch (error) {
            return {
                success: false,
                marketAddress,
                error: error.message,
            };
        }
    }
}

module.exports = EchelonService;
module.exports.MARKET_ADDRESSES = MARKET_ADDRESSES;
