import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function checkPlans() {
  const { data, error } = await supabase.from('plans').select('*').order('id');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Plans in DB:', JSON.stringify(data, null, 2));
}

checkPlans();
