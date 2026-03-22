import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function addColumns() {
  console.log('Adding missing columns to system_settings...');
  
  const sql = `
    ALTER TABLE system_settings 
    ADD COLUMN IF NOT EXISTS landing_hero_title TEXT,
    ADD COLUMN IF NOT EXISTS landing_hero_subtitle TEXT,
    ADD COLUMN IF NOT EXISTS landing_hero_cta TEXT,
    ADD COLUMN IF NOT EXISTS landing_stats_text TEXT;
  `;

  // We can't run raw SQL directly via the client unless we have an RPC or use a migration tool.
  // But wait, some setups have an 'exec_sql' RPC or similar.
  // Let's try to see if there's a way.
  
  // Since I can't run raw SQL, I'll try to find if there's any existing RPC.
  // Or, I can check if I can just skip those columns in the update if they are the ones causing the error.
  
  // Actually, I should probably check the error message returned by the server first.
  // Let's try to simulate the PUT request and see the error.
}

async function testUpdate() {
  const { error } = await supabase.from('system_settings').update({ 
    landing_hero_title: 'test' 
  }).eq('id', 1);
  
  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Update Successful');
  }
}

testUpdate();
