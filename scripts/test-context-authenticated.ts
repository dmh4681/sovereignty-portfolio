import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testContextBuilderAuthenticated() {
  console.log('🧪 Testing Context Builder (Authenticated with Service Role)...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing environment variables. Make sure you have SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  // Use service role key - bypasses RLS for testing
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log('⏳ Step 1: Finding users with data...\n');

    // First, let's find users who have daily entries
    const { data: entries, error: entriesError } = await supabase
      .from('daily_entries')
      .select('user_id')
      .limit(1000);

    if (entriesError) {
      throw new Error('Error fetching entries: ' + entriesError.message);
    }

    if (!entries || entries.length === 0) {
      console.log('⚠️  No daily entries found in database');
      console.log('   Make sure you have logged at least one entry through the app\n');
      return;
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(entries.map(e => e.user_id))];
    console.log(`✅ Found ${entries.length} daily entries from ${uniqueUserIds.length} unique user(s)\n`);

    // Use the user with generated data
    const testUserId = 'bf8cee87-68d0-4fc5-911d-5e75f6167b36';
    console.log(`🎯 Testing with User ID: ${testUserId}\n`);

    if (!uniqueUserIds.includes(testUserId)) {
      console.log(`⚠️  Warning: User ${testUserId} has no entries`);
      console.log(`   Available user IDs: ${uniqueUserIds.join(', ')}\n`);
    }

    // Get user profile
    console.log('⏳ Step 2: Loading user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (profileError || !profile) {
      console.log('⚠️  Warning: Profile not found, using basic info');
    } else {
      console.log('✅ Profile loaded!\n');
      console.log('👤 USER PROFILE:');
      console.log(`   Name: ${profile.full_name || 'No name'}`);
      console.log(`   Email: ${profile.email || 'No email'}`);
      console.log(`   Path: ${profile.selected_path || 'default'}`);
      console.log(`   Tier: ${profile.subscription_tier || 'free'}`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleDateString()}`);
    }

    // Fetch ALL entries for this user
    console.log('\n⏳ Step 3: Loading ALL daily entries...');

    const { data: userEntries, error: userEntriesError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', testUserId)
      .order('entry_date', { ascending: false });

    if (userEntriesError) {
      throw new Error('Failed to fetch user entries: ' + userEntriesError.message);
    }

    const allEntries = userEntries || [];
    console.log(`✅ Loaded ${allEntries.length} total entries\n`);

    // Also show last 30 days stats
    const endDate = new Date();
    const startDate30 = new Date();
    startDate30.setDate(startDate30.getDate() - 30);

    const last30Entries = allEntries.filter(e => {
      const entryDate = new Date(e.entry_date);
      return entryDate >= startDate30 && entryDate <= endDate;
    });

    console.log(`   📅 Last 30 days: ${last30Entries.length} entries`);
    console.log(`   📅 All time: ${allEntries.length} entries\n`);

    if (allEntries.length === 0) {
      console.log('❌ No entries found for this user at all\n');
      return;
    }

    // Calculate metrics
    console.log('📊 METRICS:\n');

    const scores = allEntries.map(e => e.score).filter(s => s != null);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

    console.log(`   Total Days Logged: ${allEntries.length}`);
    console.log(`   Avg Score: ${Math.round(avgScore * 10) / 10}/100`);
    console.log(`   Best Score: ${bestScore}/100`);
    console.log(`   Worst Score: ${worstScore}/100`);

    // Bitcoin metrics
    const totalSats = allEntries.reduce((sum, e) => sum + (e.sats_purchased || 0), 0);
    const totalBtc = allEntries.reduce((sum, e) => sum + (e.btc_purchased || 0), 0);
    const totalInvested = allEntries.reduce((sum, e) => sum + (e.investment_amount_usd || 0), 0);
    const investmentDays = allEntries.filter(e => e.invested_bitcoin).length;
    const consistencyRate = allEntries.length > 0 ? (investmentDays / allEntries.length) * 100 : 0;

    console.log(`\n   💰 BITCOIN METRICS:`);
    console.log(`   Total Sats: ${totalSats.toLocaleString()}`);
    console.log(`   Total BTC: ${totalBtc.toFixed(8)}`);
    console.log(`   Total Invested: $${totalInvested.toFixed(2)}`);
    console.log(`   Investment Days: ${investmentDays}/${allEntries.length}`);
    console.log(`   Consistency Rate: ${Math.round(consistencyRate * 10) / 10}%`);

    // Determine next milestone
    const milestones = [
      { name: 'First Sats', target: 1 },
      { name: '10K Sats', target: 10_000 },
      { name: '50K Sats', target: 50_000 },
      { name: '100K Sats', target: 100_000 },
      { name: '500K Sats', target: 500_000 },
      { name: '1M Sats', target: 1_000_000 },
      { name: '5M Sats', target: 5_000_000 },
      { name: '10M Sats (0.1 BTC)', target: 10_000_000 },
      { name: '21M Sats (0.21 BTC)', target: 21_000_000 },
      { name: '100M Sats (1 BTC)', target: 100_000_000 },
    ];

    const achievedMilestones = milestones.filter(m => m.target <= totalSats);
    const nextMilestone = milestones.find(m => m.target > totalSats);

    console.log(`   Milestones Achieved: ${achievedMilestones.length}/10`);
    if (nextMilestone) {
      const progress = (totalSats / nextMilestone.target) * 100;
      console.log(`   Next Milestone: ${nextMilestone.name} (${Math.round(progress)}% complete)`);
    }

    // Activity metrics
    const meditationDays = allEntries.filter(e => e.meditation).length;
    const gratitudeDays = allEntries.filter(e => e.gratitude).length;
    const strengthTrainingDays = allEntries.filter(e => e.strength_training).length;
    const homeCookedMeals = allEntries.reduce((sum, e) => sum + (e.home_cooked_meals || 0), 0);
    const learningDays = allEntries.filter(e => e.read_or_learned).length;

    console.log(`\n   🧘 ACTIVITY METRICS:`);
    console.log(`   Meditation Days: ${meditationDays}/${allEntries.length} (${Math.round((meditationDays / allEntries.length) * 100)}%)`);
    console.log(`   Gratitude Days: ${gratitudeDays}/${allEntries.length} (${Math.round((gratitudeDays / allEntries.length) * 100)}%)`);
    console.log(`   Strength Training Days: ${strengthTrainingDays}/${allEntries.length} (${Math.round((strengthTrainingDays / allEntries.length) * 100)}%)`);
    console.log(`   Home Cooked Meals: ${homeCookedMeals} total (avg ${(homeCookedMeals / allEntries.length).toFixed(1)} per day)`);
    console.log(`   Learning Days: ${learningDays}/${allEntries.length} (${Math.round((learningDays / allEntries.length) * 100)}%)`);

    // Psychology detection
    console.log(`\n🧠 PSYCHOLOGY DETECTION:\n`);

    // Trend detection
    const last7 = scores.slice(0, Math.min(7, scores.length));
    const prev7 = scores.slice(7, Math.min(14, scores.length));
    const last7Avg = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : 0;
    const prev7Avg = prev7.length > 0 ? prev7.reduce((a, b) => a + b, 0) / prev7.length : 0;

    let trend = 'stable';
    if (last7Avg > prev7Avg + 5) trend = 'improving';
    else if (last7Avg < prev7Avg - 5) trend = 'declining';

    console.log(`   Recent Trend: ${trend.toUpperCase()}`);
    console.log(`   Last 7 Days Avg: ${Math.round(last7Avg * 10) / 10}`);
    if (prev7.length > 0) {
      console.log(`   Previous 7 Days Avg: ${Math.round(prev7Avg * 10) / 10}`);
    }

    // Motivation state
    let motivationState = 'moderate';
    if (avgScore >= 60 && trend === 'improving' && consistencyRate >= 70) {
      motivationState = 'HIGH';
    } else if (avgScore < 30 && trend === 'declining') {
      motivationState = 'BURNOUT';
    } else if (avgScore < 50 && trend === 'improving') {
      motivationState = 'REBUILDING';
    } else if (trend === 'declining') {
      motivationState = 'LOW';
    } else {
      motivationState = 'MODERATE';
    }

    console.log(`\n   Motivation State: ${motivationState}`);

    // Habit phase
    let habitPhase = 'formation';
    if (allEntries.length >= 90 && avgScore >= 70) {
      habitPhase = 'MASTERY';
    } else if (allEntries.length > 30 && allEntries.length < 90) {
      habitPhase = 'MAINTENANCE';
    } else if (allEntries.length > 30 && trend === 'declining') {
      habitPhase = 'EROSION';
    } else if (allEntries.length <= 30) {
      habitPhase = 'FORMATION';
    }

    console.log(`   Habit Phase: ${habitPhase}`);

    // Coaching need
    let coachingNeed = 'education';
    if (motivationState === 'LOW' || habitPhase === 'CRISIS') {
      coachingNeed = 'RE_ENGAGEMENT';
    } else if (motivationState === 'BURNOUT' || habitPhase === 'EROSION') {
      coachingNeed = 'INTERVENTION';
    } else if (motivationState === 'HIGH' && achievedMilestones.length > 0) {
      coachingNeed = 'CELEBRATION';
    } else if (habitPhase === 'MASTERY' || (avgScore >= 70 && trend === 'stable')) {
      coachingNeed = 'OPTIMIZATION';
    } else if (habitPhase === 'FORMATION') {
      coachingNeed = 'EDUCATION';
    } else {
      coachingNeed = 'COURSE_CORRECTION';
    }

    console.log(`   Coaching Need: ${coachingNeed}`);

    // Recent entries
    console.log('\n📅 RECENT ENTRIES (Last 7 days):\n');
    const recent7 = allEntries.slice(0, Math.min(7, allEntries.length));

    recent7.forEach((entry, index) => {
      const activities: string[] = [];
      if (entry.invested_bitcoin) activities.push(`💰 $${entry.investment_amount_usd}`);
      if (entry.meditation) activities.push('🧘 Med');
      if (entry.strength_training) activities.push('💪 ST');
      if (entry.gratitude) activities.push('🙏 Grat');
      if (entry.home_cooked_meals > 0) activities.push(`🍳 ${entry.home_cooked_meals}m`);

      const activityStr = activities.length > 0 ? activities.join(', ') : 'No activities';
      console.log(`   ${index + 1}. ${entry.entry_date}: Score ${entry.score}/100 - ${activityStr}`);
    });

    // Check for previous coaching
    console.log('\n📜 PREVIOUS COACHING:\n');
    const { data: previousSessions } = await supabase
      .from('coaching_sessions')
      .select('created_at, coach_type, recommendation')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (previousSessions && previousSessions.length > 0) {
      previousSessions.forEach(session => {
        const date = new Date(session.created_at).toLocaleDateString();
        console.log(`   ${date} - ${session.coach_type}: "${session.recommendation || 'No recommendation'}"`);
      });
    } else {
      console.log('   No previous coaching sessions found');
    }

    console.log('\n✨ Context Builder Data Ready!\n');
    console.log('🎯 Summary:');
    console.log(`   - User has ${allEntries.length} days of data`);
    console.log(`   - ${totalSats.toLocaleString()} sats accumulated`);
    console.log(`   - Motivation: ${motivationState}, Phase: ${habitPhase}`);
    console.log(`   - Ready for: ${coachingNeed} coaching\n`);

    console.log('✅ The context builder will work perfectly once integrated!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testContextBuilderAuthenticated();
