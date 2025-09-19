// Quick Supabase Connection Test
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Supabase Connection Test\n');

// Check environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Environment Variables:');
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   USE_SUPABASE: ${process.env.USE_SUPABASE || 'false'}\n`);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing required environment variables!');
  console.log('📝 Please create a .env file with your Supabase credentials.\n');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!\n');
    
    // Test table existence
    console.log('📊 Checking tables...');
    const tables = ['users', 'tutors', 'students', 'bookings', 'reviews', 'notifications', 'messages', 'payments', 'payouts', 'disputes', 'learning_progress'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': OK`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
    console.log('\n🎉 Supabase is ready to use!');
    console.log('💡 Set USE_SUPABASE=true in your .env file to enable Supabase mode.');
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
