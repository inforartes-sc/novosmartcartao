import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('ENV MISSING:', { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY });
  process.exit(1);
}

const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('system_settings').select('*');
  console.log('ALL SETTINGS:', data);
  if (error) console.error('ERROR:', error);
}
check();
