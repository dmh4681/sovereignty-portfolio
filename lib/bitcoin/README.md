# Bitcoin Price Caching System

This directory contains the Bitcoin price caching system that prevents API rate limiting and improves performance.

## Overview

The price caching system:
- ✅ Caches Bitcoin price for **5 minutes**
- ✅ Uses Next.js `unstable_cache` for automatic cache management
- ✅ Falls back to database when APIs fail
- ✅ Supports multiple API sources (Coinbase → CoinGecko → Database)
- ✅ Stores price history for analytics

## Files

### `price-cache.ts`
Main caching implementation that:
- Fetches from Coinbase API (primary)
- Falls back to CoinGecko API
- Falls back to database cache
- Stores successful fetches in database
- Manages automatic cache cleanup

## Usage

### Throughout the App

Always use `BitcoinService.getCurrentPrice()` to get the Bitcoin price:

```typescript
import { BitcoinService } from '@/lib/services/bitcoin';

// Get cached price (automatically refreshes every 5 minutes)
const priceData = await BitcoinService.getCurrentPrice();
if (priceData) {
  console.log(`Price: $${priceData.priceUsd}`);
  console.log(`Source: ${priceData.source}`); // 'coinbase', 'coingecko', or 'database_cache'
}
```

### Manual Cache Refresh (Advanced)

If you need to force a cache refresh:

```typescript
import { refreshBitcoinPriceCache } from '@/lib/bitcoin/price-cache';

// Force refresh the cache
await refreshBitcoinPriceCache();
```

## Database Schema

The system uses the `bitcoin_price_cache` table:

```sql
CREATE TABLE bitcoin_price_cache (
  id BIGSERIAL PRIMARY KEY,
  price DECIMAL(18, 2) NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Migration

Run the migration to create the table:

```bash
# In Supabase dashboard, run:
supabase/migrations/create_bitcoin_price_cache.sql
```

Or apply directly via Supabase SQL editor.

## How It Works

1. **First Request**: Fetches from Coinbase API, caches for 5 minutes, stores in database
2. **Subsequent Requests (< 5 min)**: Returns cached value instantly
3. **After 5 Minutes**: Automatically fetches fresh price, updates cache
4. **API Failure**: Falls back to last known price from database
5. **Cleanup**: Automatically keeps last 100 price records, deletes older ones

## Performance Benefits

- ❌ **Before**: Every request = API call (slow, rate limited)
- ✅ **After**: API call every 5 minutes (fast, no rate limits)

Example with 100 users accessing the app:
- **Before**: 100 API calls
- **After**: 1 API call (shared cache)

## Monitoring

The cache automatically logs to console:
- ✅ Successful fetches from APIs
- ⚠️ Fallback to database cache
- ❌ Complete failures

Check your logs for:
```
Using cached fallback price from database: 109678.93
```

## API Sources

1. **Coinbase** (Primary): `https://api.coinbase.com/v2/prices/BTC-USD/spot`
   - Most reliable, fastest
   - No API key required
   - Rate limit: ~10 req/sec

2. **CoinGecko** (Fallback): `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
   - Good reliability
   - No API key required
   - Rate limit: ~10-50 req/min (free tier)

3. **Database** (Ultimate Fallback): Last known successful price
   - Always available
   - May be slightly outdated
   - Prevents complete failures

## Troubleshooting

### Price not updating
- Check if 5 minutes have passed since last fetch
- Verify external APIs are accessible
- Check database connectivity

### Using old price
- This is expected when APIs fail
- Check console logs for API errors
- Verify internet connectivity

### Cache not working
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
- Check database table exists

## Future Enhancements

Potential improvements:
- [ ] Add WebSocket price streaming for real-time updates
- [ ] Implement price alerts/notifications
- [ ] Add price history charts
- [ ] Support additional currencies (EUR, GBP, etc.)
- [ ] Add price prediction/trends
