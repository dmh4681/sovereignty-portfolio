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
  includeBreaks?: boolean; // Include realistic breaks (vacation, illness)
  showProgress?: boolean;
}

async function generateYearData(config: GenerationConfig) {
  const {
    userId,
    days = 365,
    startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    path = 'financial_sovereignty',
    includeBreaks = true,
    showProgress = true,
  } = config;

  console.log(`🚀 Generating ${days} days of realistic sovereignty data...`);
  console.log(`📅 Start date: ${startDate.toISOString().split('T')[0]}`);
  console.log(`👤 User ID: ${userId}`);
  console.log(`🛤️  Path: ${path}`);
  console.log('');

  const entries = [];
  
  // Define realistic patterns and breaks
  const vacationPeriods = includeBreaks ? [
    { start: 120, end: 127 }, // ~4 months in (1 week vacation)
    { start: 250, end: 264 }, // ~8 months in (2 week vacation)
  ] : [];
  
  const sickDays = includeBreaks ? [65, 66, 180, 181, 182] : []; // A couple sick periods
  
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
    
    // Seasonal patterns (New Year motivation, summer slump, fall comeback)
    let seasonalBonus = 0;
    if (month === 0 || month === 1) seasonalBonus = 5; // Jan-Feb (New Year energy)
    else if (month === 6 || month === 7) seasonalBonus = -3; // Jul-Aug (summer slump)
    else if (month === 8 || month === 9) seasonalBonus = 3; // Sep-Oct (fall comeback)
    else if (month === 11) seasonalBonus = -5; // Dec (holiday chaos)
    
    // Progressive improvement over the year (sovereignty journey)
    const progressBonus = Math.floor(i / 30) * 1.5; // +1.5 pts per month
    
    // Weekend effect
    const weekendPenalty = isWeekend ? -12 : 0;
    
    // Random daily variation
    const randomVariation = Math.floor(Math.random() * 10) - 5;
    
    // Calculate score
    const baseScore = 75;
    const score = Math.round(Math.min(100, Math.max(45, 
      baseScore + progressBonus + seasonalBonus + weekendPenalty + randomVariation
    )));
    
    // Activity probabilities (improve over time)
    const baseProgress = i / days; // 0 to 1 over the year
    
    const meditationProb = 0.65 + (baseProgress * 0.25) - (isWeekend ? 0.15 : 0);
    const gratitudeProb = 0.70 + (baseProgress * 0.2) - (isWeekend ? 0.1 : 0);
    const strengthProb = 0.55 + (baseProgress * 0.25) - (isWeekend ? 0.2 : 0);
    const learningProb = 0.75 + (baseProgress * 0.15) - (isWeekend ? 0.15 : 0);
    const bitcoinProb = 0.45 + (baseProgress * 0.3); // Strong improvement in Bitcoin discipline
    const spendingProb = 0.60 + (baseProgress * 0.25) - (isWeekend ? 0.25 : 0);
    const envActionProb = 0.25 + (baseProgress * 0.15);
    
    // Special days with perfect scores (milestones, motivated days)
    const isPerfectDay = i === 30 || i === 100 || i === 200 || i === 300 || i === 364;
    
    const entry = {
      user_id: userId,
      entry_date: dateStr,
      score: isPerfectDay ? 100 : score,
      path: path,
      
      // Activities (with realistic improvement patterns)
      meditation: isPerfectDay ? true : Math.random() < meditationProb,
      gratitude: isPerfectDay ? true : Math.random() < gratitudeProb,
      read_or_learned: isPerfectDay ? true : Math.random() < learningProb,
      strength_training: isPerfectDay ? true : Math.random() < strengthProb,
      no_spending: isPerfectDay ? true : Math.random() < spendingProb,
      invested_bitcoin: isPerfectDay ? true : Math.random() < bitcoinProb,
      environmental_action: Math.random() < envActionProb,
      junk_food: isPerfectDay ? false : Math.random() < 0.12, // Ate junk food (improving over time)
      
      // Numeric activities
      home_cooked_meals: isPerfectDay ? 3 : Math.floor(Math.random() * 4),
      exercise_minutes: isPerfectDay ? 45 : Math.floor(Math.random() * 60),
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
  
  console.log('');
  console.log('🎉 Year of sovereignty data generation complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Total days: ${days}`);
  console.log(`   Entries created: ${entries.length}`);
  console.log(`   Vacation days: ${vacationPeriods.reduce((sum, p) => sum + (p.end - p.start + 1), 0)}`);
  console.log(`   Sick days: ${sickDays.length}`);
  console.log(`   Average score: ${Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)}`);
  console.log(`   Bitcoin investments: ${entries.filter(e => e.invested_bitcoin).length} days`);
  console.log('');
  console.log('🚀 Ready to view analytics at /app/analytics');
}

// Parse command line arguments
const args = process.argv.slice(2);

console.log('🔍 Debug - Args received:', args);
console.log('🔍 Debug - Args length:', args.length);
console.log('');

if (args.length === 0 || !args[0] || args[0].startsWith('--')) {
  console.log('');
  console.log('📚 Usage:');
  console.log('  npx tsx scripts/generate-year-data.ts <user_id> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --days=365        Number of days (default: 365)');
  console.log('  --path=financial  Sovereignty path (default: financial_sovereignty)');
  console.log('  --no-breaks       Skip vacation and sick days');
  console.log('  --quiet           Minimal output');
  console.log('');
  console.log('Examples:');
  console.log('  npx tsx scripts/generate-year-data.ts bf8cee87-68d0-4fc5-911d-5e75f6167b36');
  console.log('  npx tsx scripts/generate-year-data.ts <user_id> --days=180 --path=mental_resilience');
  console.log('  npx tsx scripts/generate-year-data.ts <user_id> --no-breaks --quiet');
  console.log('');
  process.exit(1);
}

const userId = args[0];
const days = parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1] || '365');
const path = args.find(a => a.startsWith('--path='))?.split('=')[1] || 'financial_sovereignty';
const includeBreaks = !args.includes('--no-breaks');
const showProgress = !args.includes('--quiet');

console.log('✅ Starting generation with config:');
console.log('   User ID:', userId);
console.log('   Days:', days);
console.log('   Path:', path);
console.log('');

generateYearData({
  userId,
  days,
  path,
  includeBreaks,
  showProgress,
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});