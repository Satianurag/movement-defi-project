const axios = require('axios');

class DefiLlamaFetcher {
  constructor() {
    this.baseURL = 'https://api.llama.fi';
  }

  async getProtocolTVL(protocolSlug) {
    try {
      const response = await axios.get(`${this.baseURL}/protocol/${protocolSlug}`);
      return {
        name: response.data.name,
        tvl: response.data.tvl,
        chainTvls: response.data.chainTvls?.Movement || 0,
        tokens: response.data.currentChainTvls?.Movement?.tokens || {},
        // Add historical data for real APY calculations
        tvlHistory: response.data.tvl ? response.data.chainTvls?.Movement : null
      };
    } catch (error) {
      console.error(`DefiLlama error for ${protocolSlug}:`, error.message);
      return null;
    }
  }

  async getMovementNetworkTVL() {
    try {
      const response = await axios.get(`${this.baseURL}/v2/chains`);
      const movement = response.data.find(chain => chain.name === 'Movement');
      return movement ? {
        tvl: movement.tvl,
        tokenSymbol: movement.tokenSymbol
      } : null;
    } catch (error) {
      console.error('DefiLlama chains error:', error.message);
      return null;
    }
  }

  async getAllMovementProtocols() {
    try {
      const response = await axios.get(`${this.baseURL}/protocols`);
      const movementProtocols = response.data
        .filter(protocol => protocol.chains?.includes('Movement'))
        .map(protocol => ({
          name: protocol.name,
          slug: protocol.slug,
          tvl: protocol.tvl,
          category: protocol.category,
          // Add real metrics
          change_1d: protocol.change_1d,
          change_7d: protocol.change_7d,
          mcap: protocol.mcap
        }));
      return movementProtocols;
    } catch (error) {
      console.error('DefiLlama protocols error:', error.message);
      return [];
    }
  }

  // NEW: Get historical TVL for APY calculations
  async getHistoricalTVL(protocolSlug) {
    try {
      const response = await axios.get(`${this.baseURL}/protocol/${protocolSlug}`);
      const histData = response.data.chainTvls?.Movement;

      if (!histData) return [];

      return Object.entries(histData.tvl || {}).map(([date, tvl]) => ({
        date: parseInt(date),
        tvl: tvl
      }));
    } catch (error) {
      console.error(`Historical TVL error for ${protocolSlug}:`, error.message);
      return [];
    }
  }

  // NEW: Get 24h volume data
  async get24hVolume(protocolSlug) {
    try {
      const response = await axios.get(`${this.baseURL}/summary/dexs/${protocolSlug}`);
      return {
        volume24h: response.data.total24h || 0,
        change24h: response.data.change_24h || 0
      };
    } catch (error) {
      // Not all protocols have volume data
      return { volume24h: 0, change24h: 0 };
    }
  }
}

module.exports = DefiLlamaFetcher;
