import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function inspectTable() {
  try {
    console.log('--- Inspecting plans table structure ---');
    const { data: sample, error: err2 } = await supabase.from('plans').select('*').limit(1);
    
    if (err2) {
      console.error('Error fetching sample:', err2);
      return;
    }
    
    if (!sample || sample.length === 0) {
      console.warn('No plans to test.');
      return;
    }
    
    console.log('Actual DB Keys:', Object.keys(sample[0]));
    console.log('Sample Data Type Check:');
    for (let key in sample[0]) {
      console.log(`- ${key}: ${typeof sample[0][key]} (Value: ${sample[0][key]})`);
    }
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  }
}

inspectTable();
