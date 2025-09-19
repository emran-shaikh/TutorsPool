// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Supabase Connection...\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables:');
  console.log('   SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('🔍 Testing basic connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n💡 The "users" table doesn\'t exist yet.');
        console.log('   Please run the SQL schema in your Supabase SQL Editor:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/wtvfgcotbgkiuxkhnovc/sql');
        console.log('   2. Copy contents of supabase-schema.sql');
        console.log('   3. Paste and run in SQL Editor');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ Connection successful!');
    
    // Test table structure
    console.log('\n📊 Checking database tables...');
    const tables = [
      'users', 'tutors', 'students', 'bookings', 'reviews', 
      'notifications', 'messages', 'payments', 'payouts', 'disputes'
    ];
    
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`✅ Table '${table}': OK`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n💡 Some tables are missing. Please run the SQL schema.');
      return false;
    }
    
    console.log('\n🎉 All tests passed! Your Supabase setup is ready.');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npm run supabase:migrate (to migrate existing data)');
    console.log('   2. Set USE_SUPABASE=true in your .env file');
    console.log('   3. Restart your server');
    
    return true;
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testConnection();
