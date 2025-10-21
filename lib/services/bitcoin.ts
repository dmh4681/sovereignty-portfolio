/**
 * Bitcoin Service - Handles all Bitcoin price and portfolio operations
 */

interface BitcoinPrice {
  priceUsd: number;
  timestamp: Date;
  source: string;
}

interface BitcoinPurchase {
  amountUsd: number;
  btcPrice: number;
  btcPurchased: number;
  satsPurchased: number;
}

export class BitcoinService {
  private static COINBASE_API = 'https://api.coinbase.com/v2/prices/BTC-USD/spot';
  private static COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
  private static SATS_PER_BTC = 100_000_000;

  /**
   * Get current Bitcoin price (with fallback to multiple sources)
   */
  static async getCurrentPrice(): Promise<BitcoinPrice | null> {
    try {
      // Try Coinbase first (most reliable)
      const coinbaseResponse = await fetch(this.COINBASE_API);
      if (coinbaseResponse.ok) {
        const data = await coinbaseResponse.json();
        return {
          priceUsd: parseFloat(data.data.amount),
          timestamp: new Date(),
          source: 'coinbase'
        };
      }
    } catch (error) {
      console.warn('Coinbase API failed, trying CoinGecko...');
    }

    try {
      // Fallback to CoinGecko
      const coingeckoResponse = await fetch(this.COINGECKO_API);
      if (coingeckoResponse.ok) {
        const data = await coingeckoResponse.json();
        return {
          priceUsd: data.bitcoin.usd,
          timestamp: new Date(),
          source: 'coingecko'
        };
      }
    } catch (error) {
      console.error('All Bitcoin price APIs failed:', error);
      return null;
    }

    return null;
  }

  /**
   * Convert USD to BTC and sats
   */
  static calculatePurchase(amountUsd: number, btcPrice: number): BitcoinPurchase {
    const btcPurchased = amountUsd / btcPrice;
    const satsPurchased = Math.floor(btcPurchased * this.SATS_PER_BTC);

    return {
      amountUsd,
      btcPrice,
      btcPurchased,
      satsPurchased
    };
  }

  /**
   * Convert BTC to USD
   */
  static btcToUsd(btc: number, btcPrice: number): number {
    return btc * btcPrice;
  }

  /**
   * Convert sats to BTC
   */
  static satsToBtc(sats: number): number {
    return sats / this.SATS_PER_BTC;
  }

  /**
   * Convert BTC to sats
   */
  static btcToSats(btc: number): number {
    return Math.floor(btc * this.SATS_PER_BTC);
  }

  /**
   * Format sats with commas
   */
  static formatSats(sats: number): string {
    return sats.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  /**
   * Format BTC with 8 decimals
   */
  static formatBtc(btc: number): string {
    return btc.toFixed(8);
  }

  /**
   * Format USD currency
   */
  static formatUsd(usd: number): string {
    return usd.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
