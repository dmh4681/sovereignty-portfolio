-- Create bitcoin_price_cache table for storing last known prices
-- This provides fallback when external APIs fail

CREATE TABLE IF NOT EXISTS bitcoin_price_cache (
  id BIGSERIAL PRIMARY KEY,
  price DECIMAL(18, 2) NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for efficient lookups by timestamp
CREATE INDEX IF NOT EXISTS idx_bitcoin_price_cache_fetched
ON bitcoin_price_cache(fetched_at DESC);

-- Add comment for documentation
COMMENT ON TABLE bitcoin_price_cache IS 'Stores Bitcoin price history for fallback when external APIs are unavailable';
COMMENT ON COLUMN bitcoin_price_cache.price IS 'Bitcoin price in USD';
COMMENT ON COLUMN bitcoin_price_cache.fetched_at IS 'Timestamp when price was fetched from external API';
