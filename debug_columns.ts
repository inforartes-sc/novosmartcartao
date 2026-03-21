import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'system_settings' });
  console.log('COLUMNS:', data);
  if (error) {
     // If no get_table_columns RPC, try a dummy query
     const { data: qData, error: qError } = await supabase.from('system_settings').select('*').limit(1);
     if (qData && qData.length > 0) {
       console.log('KEYS FOUND:', Object.keys(qData[0]));
     }
  }
}
checkColumns();
