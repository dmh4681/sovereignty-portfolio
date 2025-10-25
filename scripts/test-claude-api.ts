// Test Claude API Connection
// Run with: npx tsx scripts/test-claude-api.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Verify API key is loaded
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('❌ Error: ANTHROPIC_API_KEY not found in .env.local');
  console.error('\n💡 Fix:');
  console.error('1. Make sure .env.local exists in your project root');
  console.error('2. Add this line to .env.local:');
  console.error('   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here');
  console.error('3. Replace "your-key-here" with your actual API key');
  process.exit(1);
}

console.log('✅ API key found in environment');
console.log(`   Key starts with: ${apiKey.substring(0, 20)}...`);

const anthropic = new Anthropic({
  apiKey: apiKey,
});

async function testClaudeConnection() {
  console.log('\n🧪 Testing Claude API Connection...\n');

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Say hello and confirm you are Claude Sonnet 4. Keep it brief.',
        },
      ],
    });

    console.log('✅ Success! Claude API is working.\n');
    console.log('Response:', message.content[0]);
    console.log('\n📊 Usage Stats:');
    console.log(`   Input tokens: ${message.usage.input_tokens}`);
    console.log(`   Output tokens: ${message.usage.output_tokens}`);
    
    const inputCost = (message.usage.input_tokens / 1_000_000) * 3;
    const outputCost = (message.usage.output_tokens / 1_000_000) * 15;
    const totalCost = inputCost + outputCost;
    
    console.log(`   Estimated cost: $${totalCost.toFixed(6)}`);
    console.log('\n🎉 Ready to build the Bitcoin Coach!');
    
  } catch (error: any) {
    console.error('❌ Error connecting to Claude API:');
    console.error(error.message);
    
    if (error.status === 401) {
      console.error('\n💡 Fix: Your API key is invalid or expired');
      console.error('1. Go to https://console.anthropic.com/');
      console.error('2. Generate a new API key');
      console.error('3. Replace the key in .env.local');
    } else if (error.message.includes('insufficient_quota')) {
      console.error('\n💡 Fix: You need to add credits to your Anthropic account');
      console.error('1. Go to https://console.anthropic.com/settings/billing');
      console.error('2. Add at least $5 in credits');
    }
  }
}

testClaudeConnection();