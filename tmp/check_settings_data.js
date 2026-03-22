import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function checkData() {
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Current system_settings:', JSON.stringify(data, null, 2));
}

checkData();
