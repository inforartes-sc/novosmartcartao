import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function checkColumns() {
  console.log('--- Checking plans table columns ---');
  const { data, error } = await supabase.from('plans').select('*').limit(1);
  if (error) {
    console.error('Error fetching plans:', error);
  } else {
    console.log('Current columns:', Object.keys(data[0] || {}));
  }
}

checkColumns();
