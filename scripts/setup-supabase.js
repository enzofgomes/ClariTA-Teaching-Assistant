#!/usr/bin/env node

/**
 * Supabase Setup Script for ClariTA Teaching Assistant
 * 
 * This script helps verify your Supabase configuration and set up the database.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('🚀 ClariTA Supabase Setup Script\n');

// Check environment variables
console.log('📋 Checking environment variables...');
const requiredVars = {
  'SUPABASE_URL': SUPABASE_URL,
  'SUPABASE_ANON_KEY': SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': SUPABASE_SERVICE_KEY,
  'DATABASE_URL': DATABASE_URL,
  'SESSION_SECRET': process.env.SESSION_SECRET,
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
};

let allVarsPresent = true;
for (const [varName, varValue] of Object.entries(requiredVars)) {
  if (varValue) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allVarsPresent = false;
  }
}

if (!allVarsPresent) {
  console.log('\n❌ Some required environment variables are missing.');
  console.log('Please check your .env file and ensure all variables are set.');
  console.log('Refer to the MIGRATION_GUIDE.md for detailed instructions.');
  process.exit(1);
}

// Test Supabase connection
console.log('\n🔌 Testing Supabase connection...');
try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log('✅ Supabase client created successfully');
  
  // Test basic connection
  supabase.from('users').select('count').limit(1)
    .then(() => {
      console.log('✅ Database connection successful');
      console.log('✅ Tables are accessible');
    })
    .catch((error) => {
      console.log('⚠️  Database connection test failed:', error.message);
      console.log('This might be normal if tables haven\'t been created yet.');
    });
    
} catch (error) {
  console.log('❌ Failed to create Supabase client:', error.message);
  process.exit(1);
}

// Check if .env file exists and is properly formatted
console.log('\n📁 Checking .env file...');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_supabase_project_url')) {
    console.log('⚠️  .env file contains placeholder values. Please update with real values.');
  } else {
    console.log('✅ .env file appears to be configured');
  }
} else {
  console.log('❌ .env file not found. Please create one from env.example');
  process.exit(1);
}

// Provide next steps
console.log('\n🎯 Next Steps:');
console.log('1. Run database migrations: npm run db:push');
console.log('2. Start the development server: npm run dev');
console.log('3. Test authentication by visiting http://localhost:5000');
console.log('4. Try creating an account and uploading a PDF');

console.log('\n📚 For detailed instructions, see MIGRATION_GUIDE.md');
console.log('✨ Happy coding with Supabase!');
