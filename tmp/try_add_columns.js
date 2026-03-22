import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function testExecSql() {
  const sql = `
    ALTER TABLE system_settings 
    ADD COLUMN IF NOT EXISTS landing_hero_title TEXT,
    ADD COLUMN IF NOT EXISTS landing_hero_subtitle TEXT,
    ADD COLUMN IF NOT EXISTS landing_hero_cta TEXT,
    ADD COLUMN IF NOT EXISTS landing_stats_text TEXT;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
       console.log('exec_sql RPC not found or failed:', error.message);
       // Try another name if common
       const { error: error2 } = await supabase.rpc('run_sql', { sql });
       if (error2) console.log('run_sql RPC not found or failed:', error2.message);
    } else {
       console.log('SUCCESS: Missing columns added!');
    }
  } catch (err) {
    console.log('RPC execution threw:', err);
  }
}

testExecSql();
