import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
  ALTER TABLE system_settings 
  ADD COLUMN IF NOT EXISTS landing_hero_title TEXT,
  ADD COLUMN IF NOT EXISTS landing_hero_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS landing_hero_cta TEXT,
  ADD COLUMN IF NOT EXISTS landing_stats_text TEXT,
  ADD COLUMN IF NOT EXISTS landing_done_tag TEXT,
  ADD COLUMN IF NOT EXISTS landing_done_title_first TEXT,
  ADD COLUMN IF NOT EXISTS landing_done_title_last TEXT,
  ADD COLUMN IF NOT EXISTS landing_done_text TEXT,
  ADD COLUMN IF NOT EXISTS landing_catalog_tag TEXT,
  ADD COLUMN IF NOT EXISTS landing_catalog_title_first TEXT,
  ADD COLUMN IF NOT EXISTS landing_catalog_title_last TEXT,
  ADD COLUMN IF NOT EXISTS landing_catalog_text TEXT,
  ADD COLUMN IF NOT EXISTS landing_catalog_btn_text TEXT,
  ADD COLUMN IF NOT EXISTS landing_catalog_btn_link TEXT;
`;

async function run() {
  console.log('Attempting to add columns...');
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('exec_sql failed:', error.message);
    const { error: error2 } = await supabase.rpc('run_sql', { sql });
    if (error2) {
      console.error('run_sql also failed:', error2.message);
    } else { console.log('SUCCESS (run_sql)'); }
  } else { console.log('SUCCESS (exec_sql)'); }
}
run();
