import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key needed to bypass RLS
);

async function generateTestData(userId: string, days: number = 90) {
  console.log(`Generating ${days} days of test data for user ${userId}...`);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const entries = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate semi-realistic data with patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseScore = isWeekend ? 65 : 85; // Weekend drop pattern
    const trendBonus = Math.floor(i / 10) * 2; // Gradual improvement
    const randomVariation = Math.floor(Math.random() * 15) - 7;
    
    const score = Math.min(100, Math.max(40, baseScore + trendBonus + randomVariation));
    
    // Activity probabilities
    const meditationProb = isWeekend ? 0.7 : 0.9;
    const gratitudeProb = 0.85 + (i / days) * 0.1; // Improving over time
    const strengthProb = isWeekend ? 0.5 : 0.75;
    const learningProb = 0.8;
    const bitcoinProb = 0.6;
    const spendingProb = isWeekend ? 0.4 : 0.8;
    const envActionProb = 0.3;
    
    const entry = {
      user_id: userId,
      entry_date: dateStr,
      score: score,
      path: 'financial_sovereignty',
      
      // Activities
      meditation: Math.random() < meditationProb,
      gratitude: Math.random() < gratitudeProb,
      read_or_learned: Math.random() < learningProb,
      strength_training: Math.random() < strengthProb,
      no_spending: Math.random() < spendingProb,
      invested_bitcoin: Math.random() < bitcoinProb,
      environmental_action: Math.random() < envActionProb,
      no_junk_food: Math.random() < 0.85,
      
      // Numeric activities
      home_cooked_meals: Math.floor(Math.random() * 4),
      exercise_minutes: Math.floor(Math.random() * 60),
    };
    
    entries.push(entry);
  }
  
  // Insert in batches of 50
  for (let i = 0; i < entries.length; i += 50) {
    const batch = entries.slice(i, i + 50);
    const { error } = await supabase
      .from('daily_entries')
      .upsert(batch, { onConflict: 'user_id,entry_date' });
    
    if (error) {
      console.error('Error inserting batch:', error);
    } else {
      console.log(`Inserted batch ${i / 50 + 1}/${Math.ceil(entries.length / 50)}`);
    }
  }
  
  console.log('✅ Test data generation complete!');
}

// Get user ID from command line
const userId = process.argv[2];
if (!userId) {
  console.error('Usage: npx tsx scripts/generate-test-data.ts <user_id>');
  process.exit(1);
}

generateTestData(userId, 90);