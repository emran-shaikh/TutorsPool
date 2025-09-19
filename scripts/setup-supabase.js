// Setup script for Supabase migration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🚀 TutorsPool Supabase Setup Script\n');

// Check environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing Supabase configuration!');
  console.log('\n📋 Please set the following environment variables:');
  console.log('   SUPABASE_URL=your_supabase_project_url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('\n🔗 Get these from your Supabase project dashboard:');
  console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('\n💡 Make sure:');
      console.log('   1. Your Supabase project is active');
      console.log('   2. You have run the SQL schema (supabase-schema.sql)');
      console.log('   3. Your service role key is correct');
      return false;
    }
    
    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n📊 Checking database tables...');
  
  const tables = [
    'users', 'tutors', 'students', 'bookings', 'reviews', 
    'notifications', 'messages', 'payments', 'payouts', 'disputes', 'learning_progress'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' not found or inaccessible`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}':`, err.message);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

async function checkData() {
  console.log('\n📈 Checking existing data...');
  
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const { data: tutors, error: tutorsError } = await supabase
      .from('tutors')
      .select('count')
      .limit(1);
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);

    if (usersError || tutorsError || bookingsError) {
      console.log('⚠️  Some tables may be empty or inaccessible');
    } else {
      console.log('✅ Database tables are accessible');
    }
  } catch (error) {
    console.log('⚠️  Error checking data:', error.message);
  }
}

async function setupEnvironmentFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('\n📝 Creating .env file from template...');
    
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Replace placeholder values
    envContent = envContent.replace('your_supabase_project_url_here', SUPABASE_URL);
    envContent = envContent.replace('your_supabase_anon_key_here', 'your_anon_key_here');
    envContent = envContent.replace('your_supabase_service_role_key_here', SUPABASE_SERVICE_ROLE_KEY);
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
    console.log('⚠️  Please update SUPABASE_ANON_KEY in .env file');
  }
}

async function main() {
  console.log('🎯 Running Supabase setup checks...\n');
  
  // Check connection
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }
  
  // Check tables
  const tablesExist = await checkTables();
  if (!tablesExist) {
    console.log('\n💡 Please run the SQL schema first:');
    console.log('   1. Open your Supabase SQL Editor');
    console.log('   2. Copy and paste the contents of supabase-schema.sql');
    console.log('   3. Run the SQL commands');
    process.exit(1);
  }
  
  // Check data
  await checkData();
  
  // Setup environment file
  await setupEnvironmentFile();
  
  console.log('\n🎉 Supabase setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Update your .env file with the correct SUPABASE_ANON_KEY');
  console.log('   2. Run: npm run migrate-to-supabase');
  console.log('   3. Set USE_SUPABASE=true in your .env file');
  console.log('   4. Restart your server');
  console.log('\n🔗 Useful links:');
  console.log('   - Supabase Dashboard: https://supabase.com/dashboard');
  console.log('   - SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
  console.log('   - API Docs: https://supabase.com/dashboard/project/YOUR_PROJECT/api');
}

// Run setup
main().catch(console.error);
