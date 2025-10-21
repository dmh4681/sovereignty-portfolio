import { NextResponse } from 'next/server';
import { BitcoinService } from '@/lib/services/bitcoin';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const btcPrice = await BitcoinService.getCurrentPrice();

    if (!btcPrice) {
      return NextResponse.json(
        { error: 'Unable to fetch Bitcoin price' },
        { status: 500 }
      );
    }

    // Cache price in database
    const supabase = await createServerClient();
    await supabase.from('bitcoin_prices').insert({
      price_usd: btcPrice.priceUsd,
      source: btcPrice.source
    });

    return NextResponse.json(btcPrice);
  } catch (error) {
    console.error('Bitcoin price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
