import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Environment variables missing!");
  process.exit(1);
}

const supabase = createClient(url, key);

async function testUpdate() {
  try {
    console.log('--- Testing Plan Update (ESM) ---');
    const { data: plans, error: fetchError } = await supabase.from('plans').select('id, name').limit(1);
    
    if (fetchError) {
      console.error('❌ FETCH FAILED:', fetchError);
      return;
    }
    
    if (!plans || plans.length === 0) {
      console.warn('No plans to test.');
      return;
    }
    
    const id = plans[0].id;
    console.log(`Trying to update plan ID ${id} (name: ${plans[0].name}) to is_popular = true...`);
    
    const { data, error } = await supabase.from('plans').update({ is_popular: true }).eq('id', id).select();
    
    if (error) {
      console.error('❌ UPDATE FAILED:', error);
      if (error.code === '42703') {
        console.error('ERRO: A coluna "is_popular" NÃO EXISTE na tabela "plans"!');
      }
    } else {
      console.log('✅ UPDATE SUCCESSFUL!');
      console.log('Result:', data[0]);
    }
  } catch (err) {
    console.error('UNCAUGHT ERROR:', err);
  }
}

testUpdate();
