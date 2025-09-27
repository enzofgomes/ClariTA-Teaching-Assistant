#!/usr/bin/env node

/**
 * Script to manually confirm existing users in Supabase
 * This fixes the "Email not confirmed" issue for existing users
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmUserEmail(email) {
  try {
    console.log(`🔍 Looking for user: ${email}`);
    
    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`📧 Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    
    if (user.email_confirmed_at) {
      console.log('✅ Email is already confirmed');
      return;
    }
    
    // Update user to confirm email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });
    
    if (error) {
      console.error('❌ Error confirming email:', error);
      return;
    }
    
    console.log('✅ Email confirmed successfully!');
    console.log('🎉 User can now sign in without email confirmation');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/fix-user-confirmation.js <email>');
  console.log('Example: node scripts/fix-user-confirmation.js enzoogo07@gmail.com');
  process.exit(1);
}

confirmUserEmail(email);
