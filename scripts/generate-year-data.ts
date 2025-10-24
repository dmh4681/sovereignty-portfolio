// scripts/generate-year-data.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GenerationConfig {
  userId: string;
  days: number;
  startDate?: Date;
  path?: string;
  includeBreaks?: boolean;
  showProgress?: boolean;
  performanceLevel?: 'low' | 'medium' | 'high' | 'perfect';
}

async function deleteUserData(userId: string) {
  console.log('🗑️  DELETING ALL DATA FOR USER');
  console.log(`👤 User ID: ${userId}`);
  console.log('');
  
  // Get count first
  const { count, error: countError } = await supabase
    .from('daily_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  if (countError) {
    console.error('❌ Error checking data:', countError.message);
    return;
  }
  
  if (!count || count === 0) {
    console.log('ℹ️  No data found for this user');
    return;
  }
  
  console.log(`📊 Found ${count} entries to delete`);
  console.log('');
  
  // Delete all entries
  const { error: deleteError } = await supabase
    .from('daily_entries')
    .delete()
    .eq('user_id', userId);
  
  if (deleteError) {
    console.error('❌ Error deleting data:', deleteError.message);
    return;
  }
  
  console.log(`✅ Successfully deleted ${count} entries`);
  console.log('');
}

async function generateYearData(config: GenerationConfig) {
  const {
    userId,
    days = 365,
    startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    path = 'financial_sovereignty',
    includeBreaks = true,
    showProgress = true,
    performanceLevel = 'medium',
  } = config;

  console.log(`🚀 Generating ${days} days of realistic sovereignty data...`);
  console.log(`📅 Start date: ${startDate.toISOString().split('T')[0]}`);
  console.log(`👤 User ID: ${userId}`);
  console.log(`🛤️  Path: ${path}`);
  console.log(`📊 Performance: ${performanceLevel}`);
  console.log('');

  // Performance profiles affecting investment behavior
  const performanceProfiles = {
    low: {
      investmentProb: 0.2,
      investmentRange: { min: 10, max: 50 },
      activityBonus: -15,
    },
    medium: {
      investmentProb: 0.5,
      investmentRange: { min: 25, max: 100 },
      activityBonus: 0,
    },
    high: {
      investmentProb: 0.7,
      investmentRange: { min: 50, max: 200 },
      activityBonus: 10,
    },
    perfect: {
      investmentProb: 0.9,
      investmentRange: { min: 100, max: 500 },
      activityBonus: 20,
    },
  };
  
  const profile = performanceProfiles[performanceLevel];
  
  const entries = [];
  
  // Define realistic patterns and breaks
  const vacationPeriods = includeBreaks ? [
    { start: 120, end: 127 }, // ~4 months in (1 week vacation)
    { start: 250, end: 264 }, // ~8 months in (2 week vacation)
  ] : [];
  
  const sickDays = includeBreaks ? [65, 66, 180, 181, 182] : [];
  
  // Bitcoin price simulation - start around $65,000 with realistic variance
  const btcBasePrice = 65000;
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const month = currentDate.getMonth();
    
    // Check if in vacation or sick period
    const isVacation = vacationPeriods.some(p => i >= p.start && i <= p.end);
    const isSick = sickDays.includes(i);
    
    // Skip entry if on vacation or sick (realistic gaps)
    if (isVacation || isSick) {
      if (showProgress && i % 30 === 0) {
        console.log(`📆 Day ${i}/${days} - Skipping (${isVacation ? 'vacation' : 'sick'})`);
      }
      continue;
    }
    
    // Seasonal patterns
    let seasonalBonus = 0;
    if (month === 0 || month === 1) seasonalBonus = 5; // Jan-Feb (New Year energy)
    else if (month === 6 || month === 7) seasonalBonus = -3; // Jul-Aug (summer slump)
    else if (month === 8 || month === 9) seasonalBonus = 3; // Sep-Oct (fall comeback)
    else if (month === 11) seasonalBonus = -5; // Dec (holiday chaos)
    
    // Progressive improvement over the year
    const progressBonus = Math.floor(i / 30) * 1.5;
    
    // Weekend effect
    const weekendPenalty = isWeekend ? -12 : 0;
    
    // Random daily variation
    const randomVariation = Math.floor(Math.random() * 10) - 5;
    
    // Calculate score
    const baseScore = 75;
    const score = Math.round(Math.min(100, Math.max(45, 
      baseScore + progressBonus + seasonalBonus + weekendPenalty + randomVariation + profile.activityBonus
    )));
    
    // Activity probabilities (improve over time)
    const baseProgress = i / days; // 0 to 1 over the year
    
    const meditationProb = 0.65 + (baseProgress * 0.25) - (isWeekend ? 0.15 : 0);
    const gratitudeProb = 0.70 + (baseProgress * 0.2) - (isWeekend ? 0.1 : 0);
    const strengthProb = 0.55 + (baseProgress * 0.25) - (isWeekend ? 0.2 : 0);
    const learningProb = 0.75 + (baseProgress * 0.15) - (isWeekend ? 0.15 : 0);
    const bitcoinProb = profile.investmentProb + (baseProgress * 0.2);
    const spendingProb = 0.60 + (baseProgress * 0.25) - (isWeekend ? 0.25 : 0);
    const envActionProb = 0.25 + (baseProgress * 0.15);
    
    // Special days with perfect scores
    const isPerfectDay = i === 30 || i === 100 || i === 200 || i === 300 || i === 364;
    
    // Investment tracking
    const investedBitcoin = isPerfectDay ? true : Math.random() < bitcoinProb;
    let investmentAmountUsd = 0;
    let btcPurchased = 0;
    let satsPurchased = 0;
    
    if (investedBitcoin) {
      // Generate realistic investment amount based on performance profile
      investmentAmountUsd = Math.round(
        (Math.random() * (profile.investmentRange.max - profile.investmentRange.min) + 
        profile.investmentRange.min) * 100
      ) / 100;
      
      // Simulate Bitcoin price with realistic daily variance (-5% to +5%)
      const btcPrice = btcBasePrice * (1 + (Math.random() * 0.1 - 0.05));
      
      // Calculate BTC purchased
      btcPurchased = investmentAmountUsd / btcPrice;
      
      // Calculate sats (100,000,000 sats = 1 BTC)
      satsPurchased = Math.round(btcPurchased * 100_000_000);
    }
    
    const entry = {
      user_id: userId,
      entry_date: dateStr,
      score: isPerfectDay ? 100 : score,
      path: path,
      
      // Activities
      meditation: isPerfectDay ? true : Math.random() < meditationProb,
      gratitude: isPerfectDay ? true : Math.random() < gratitudeProb,
      read_or_learned: isPerfectDay ? true : Math.random() < learningProb,
      strength_training: isPerfectDay ? true : Math.random() < strengthProb,
      no_spending: isPerfectDay ? true : Math.random() < spendingProb,
      invested_bitcoin: investedBitcoin,
      environmental_action: Math.random() < envActionProb,
      junk_food: isPerfectDay ? false : Math.random() < 0.12,
      
      // Numeric activities
      home_cooked_meals: isPerfectDay ? 3 : Math.floor(Math.random() * 4),
      exercise_minutes: isPerfectDay ? 45 : Math.floor(Math.random() * 60),
      
      // Investment tracking
      investment_amount_usd: investmentAmountUsd,
      btc_purchased: btcPurchased,
      sats_purchased: satsPurchased,
    };
    
    entries.push(entry);
    
    // Progress indicator
    if (showProgress && i % 30 === 0) {
      const monthNum = Math.floor(i / 30) + 1;
      console.log(`📆 Month ${monthNum}/12 complete - ${entries.length} entries generated`);
    }
  }
  
  console.log('');
  console.log(`✅ Generated ${entries.length} entries (skipped ${days - entries.length} for vacation/sick days)`);
  console.log('');
  console.log('📤 Inserting into database...');
  
  // Insert in batches of 50
  let inserted = 0;
  for (let i = 0; i < entries.length; i += 50) {
    const batch = entries.slice(i, i + 50);
    const { error } = await supabase
      .from('daily_entries')
      .upsert(batch, { onConflict: 'user_id,entry_date' });
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / 50) + 1}:`, error.message);
    } else {
      inserted += batch.length;
      if (showProgress) {
        console.log(`✅ Batch ${Math.floor(i / 50) + 1}/${Math.ceil(entries.length / 50)} inserted (${inserted} total)`);
      }
    }
  }
  
  // Calculate summary statistics
  const totalInvested = entries.reduce((sum, e) => sum + e.investment_amount_usd, 0);
  const totalBtc = entries.reduce((sum, e) => sum + e.btc_purchased, 0);
  const totalSats = entries.reduce((sum, e) => sum + e.sats_purchased, 0);
  const investmentDays = entries.filter(e => e.invested_bitcoin).length;
  
  console.log('');
  console.log('🎉 Year of sovereignty data generation complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Total days: ${days}`);
  console.log(`   Entries created: ${entries.length}`);
  console.log(`   Vacation days: ${vacationPeriods.reduce((sum, p) => sum + (p.end - p.start + 1), 0)}`);
  console.log(`   Sick days: ${sickDays.length}`);
  console.log(`   Average score: ${Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)}`);
  console.log('');
  console.log('💰 Investment Summary:');
  console.log(`   Investment days: ${investmentDays}/${entries.length} (${(investmentDays/entries.length*100).toFixed(1)}%)`);
  console.log(`   Total invested: $${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`   Total BTC: ${totalBtc.toFixed(8)} BTC`);
  console.log(`   Total sats: ${totalSats.toLocaleString()} sats`);
  console.log(`   Avg per investment: $${(totalInvested / investmentDays).toFixed(2)}`);
  console.log('');
  console.log('🚀 Ready to view analytics at /app/analytics');
}

// Parse command line arguments
const args = process.argv.slice(2);

console.log('');

// Check for delete command
if (args[0] === 'delete' || args[0] === '--delete') {
  if (!args[1]) {
    console.log('❌ Error: User ID required for deletion');
    console.log('');
    console.log('Usage:');
    console.log('  npx tsx scripts/generate-year-data.ts delete <user_id>');
    console.log('');
    process.exit(1);
  }
  
  const userId = args[1];
  deleteUserData(userId).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
} else {
  // Generation mode
  if (args.length === 0 || !args[0] || args[0].startsWith('--')) {
    console.log('📚 Usage:');
    console.log('');
    console.log('GENERATE DATA:');
    console.log('  npx tsx scripts/generate-year-data.ts <user_id> [options]');
    console.log('');
    console.log('DELETE DATA:');
    console.log('  npx tsx scripts/generate-year-data.ts delete <user_id>');
    console.log('');
    console.log('Options:');
    console.log('  --days=365              Number of days (default: 365)');
    console.log('  --path=financial        Sovereignty path (default: financial_sovereignty)');
    console.log('  --performance=medium    Performance level: low, medium, high, perfect (default: medium)');
    console.log('  --no-breaks             Skip vacation and sick days');
    console.log('  --quiet                 Minimal output');
    console.log('');
    console.log('Examples:');
    console.log('  # Generate medium performance data');
    console.log('  npx tsx scripts/generate-year-data.ts bf8cee87-68d0-4fc5-911d-5e75f6167b36');
    console.log('');
    console.log('  # Generate high performance data with more investment');
    console.log('  npx tsx scripts/generate-year-data.ts <user_id> --performance=high');
    console.log('');
    console.log('  # Generate 180 days of perfect performance');
    console.log('  npx tsx scripts/generate-year-data.ts <user_id> --days=180 --performance=perfect');
    console.log('');
    console.log('  # Delete all data for user');
    console.log('  npx tsx scripts/generate-year-data.ts delete <user_id>');
    console.log('');
    console.log('Investment by Performance Level:');
    console.log('  low:     20% investment days, $10-50 per investment');
    console.log('  medium:  50% investment days, $25-100 per investment');
    console.log('  high:    70% investment days, $50-200 per investment');
    console.log('  perfect: 90% investment days, $100-500 per investment');
    console.log('');
    process.exit(1);
  }

  const userId = args[0];
  const days = parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1] || '365');
  const path = args.find(a => a.startsWith('--path='))?.split('=')[1] || 'financial_sovereignty';
  const performance = (args.find(a => a.startsWith('--performance='))?.split('=')[1] || 'medium') as 'low' | 'medium' | 'high' | 'perfect';
  const includeBreaks = !args.includes('--no-breaks');
  const showProgress = !args.includes('--quiet');

  console.log('✅ Starting generation with config:');
  console.log('   User ID:', userId);
  console.log('   Days:', days);
  console.log('   Path:', path);
  console.log('   Performance:', performance);
  console.log('');

  generateYearData({
    userId,
    days,
    path,
    includeBreaks,
    showProgress,
    performanceLevel: performance,
  }).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}