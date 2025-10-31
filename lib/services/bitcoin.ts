/**
 * Bitcoin Service - Handles all Bitcoin price and portfolio operations
 */

import { getCachedBitcoinPrice } from '@/lib/bitcoin/price-cache';

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
  private static SATS_PER_BTC = 100_000_000;

  /**
   * Get current Bitcoin price (uses 5-minute cache)
   * This is the recommended method to use throughout the app
   */
  static async getCurrentPrice(): Promise<BitcoinPrice | null> {
    try {
      return await getCachedBitcoinPrice();
    } catch (error) {
      console.error('Failed to get Bitcoin price:', error);
      return null;
    }
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
