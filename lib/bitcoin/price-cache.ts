/**
 * Bitcoin Price Cache - Implements 5-minute caching with database fallback
 *
 * This module caches Bitcoin price to:
 * - Avoid API rate limiting
 * - Improve performance
 * - Provide fallback when APIs are down
 */

import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

interface BitcoinPrice {
  priceUsd: number;
  timestamp: Date;
  source: string;
}

const CACHE_DURATION = 300; // 5 minutes in seconds

/**
 * Store last known price in database for fallback
 */
async function storeLastKnownPrice(price: number): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    await supabase
      .from('bitcoin_price_cache')
      .insert({
        price,
        fetched_at: new Date().toISOString()
      });

    // Clean up old cache entries (keep last 100)
    const { data: oldEntries } = await supabase
      .from('bitcoin_price_cache')
      .select('id')
      .order('fetched_at', { ascending: false })
      .range(100, 1000);

    if (oldEntries && oldEntries.length > 0) {
      const idsToDelete = oldEntries.map(entry => entry.id);
      await supabase
        .from('bitcoin_price_cache')
        .delete()
        .in('id', idsToDelete);
    }
  } catch (error) {
    console.error('Failed to store Bitcoin price in cache:', error);
    // Non-critical error, continue
  }
}

/**
 * Retrieve last known price from database
 */
async function getLastKnownPrice(): Promise<number | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase
      .from('bitcoin_price_cache')
      .select('price')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return parseFloat(data.price);
  } catch (error) {
    console.error('Failed to retrieve last known Bitcoin price:', error);
    return null;
  }
}

/**
 * Fetch Bitcoin price from external APIs with fallback
 */
async function fetchBitcoinPrice(): Promise<BitcoinPrice> {
  const COINBASE_API = 'https://api.coinbase.com/v2/prices/BTC-USD/spot';
  const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

  // Try Coinbase first (most reliable)
  try {
    const response = await fetch(COINBASE_API, {
      next: { revalidate: CACHE_DURATION }
    });

    if (response.ok) {
      const data = await response.json();
      const price = parseFloat(data.data.amount);

      // Store in database for fallback
      await storeLastKnownPrice(price);

      return {
        priceUsd: price,
        timestamp: new Date(),
        source: 'coinbase'
      };
    }
  } catch (error) {
    console.warn('Coinbase API failed, trying CoinGecko...', error);
  }

  // Fallback to CoinGecko
  try {
    const response = await fetch(COINGECKO_API, {
      next: { revalidate: CACHE_DURATION }
    });

    if (response.ok) {
      const data = await response.json();
      const price = data.bitcoin.usd;

      // Store in database for fallback
      await storeLastKnownPrice(price);

      return {
        priceUsd: price,
        timestamp: new Date(),
        source: 'coingecko'
      };
    }
  } catch (error) {
    console.error('CoinGecko API failed:', error);
  }

  // Ultimate fallback: use last known price from database
  const lastPrice = await getLastKnownPrice();
  if (lastPrice) {
    console.log('Using cached fallback price from database:', lastPrice);
    return {
      priceUsd: lastPrice,
      timestamp: new Date(),
      source: 'database_cache'
    };
  }

  // If all else fails, throw error
  throw new Error('Unable to fetch Bitcoin price from any source');
}

/**
 * Get cached Bitcoin price (refreshes every 5 minutes)
 * This is the main function to use throughout the app
 */
export const getCachedBitcoinPrice = unstable_cache(
  async (): Promise<BitcoinPrice> => {
    return await fetchBitcoinPrice();
  },
  ['bitcoin-price'],
  {
    revalidate: CACHE_DURATION,
    tags: ['bitcoin-price']
  }
);

/**
 * Force refresh the Bitcoin price cache
 * Use this when you need to manually invalidate the cache
 */
export async function refreshBitcoinPriceCache(): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('bitcoin-price');
}
