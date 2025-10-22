import 'dotenv/config';

console.log('✅ Script is running!');
console.log('Args:', process.argv.slice(2));
console.log('ENV vars:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
});