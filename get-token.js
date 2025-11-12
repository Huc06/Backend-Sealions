require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getToken() {
  console.log('🔐 Getting access token...\n');
  
  // Try sign in first (user might already exist)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'test123456'
  });

  if (!signInError && signInData.session) {
    console.log('✅ Sign in successful!');
    console.log('\n📋 Access Token:');
    console.log(signInData.session.access_token);
    console.log('\n💡 Export token:');
    console.log('export TOKEN="' + signInData.session.access_token + '"');
    return;
  }

  // If sign in fails, try sign up
  console.log('⚠️  User not found, creating new user...\n');
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'test123456',
    options: {
      data: {
        name: 'Test User'
      }
    }
  });

  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Try:');
    console.log('1. Disable email confirmation in Supabase Dashboard → Authentication → Settings');
    console.log('2. Or create user manually in Supabase Dashboard');
    return;
  }

  if (data.session) {
    console.log('✅ User created and signed in!');
    console.log('\n📋 Access Token:');
    console.log(data.session.access_token);
    console.log('\n💡 Export token:');
    console.log('export TOKEN="' + data.session.access_token + '"');
  } else {
    console.log('⚠️  Email confirmation required.');
    console.log('💡 Disable email confirmation in Supabase Dashboard → Authentication → Settings');
  }
}

getToken();
