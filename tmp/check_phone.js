import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function checkPhone() {
  const { data, error } = await supabase.from('system_settings').select('default_phone').eq('id', 1).single();
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Master Phone:', data.default_phone);
}

checkPhone();
