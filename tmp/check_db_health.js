import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const logFile = path.join(__dirname, 'health_log.txt');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
};

if (!supabaseUrl || !supabaseKey) {
  log('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHealth() {
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  log('--- Database Health Check ---');
  
  const { count: profileCount, error: err1 } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  const { count: productCount, error: err2 } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: settingsCount, error: err3 } = await supabase
    .from('system_settings')
    .select('*', { count: 'exact', head: true });

  if (err1) log(`Error profiles: ${err1.message}`);
  if (err2) log(`Error products: ${err2.message}`);
  if (err3) log(`Error settings: ${err3.message}`);

  log(`Profiles: ${profileCount || 0} rows`);
  log(`Products: ${productCount || 0} rows`);
  log(`System Settings: ${settingsCount || 0} rows`);

  const { data: largeProducts } = await supabase
    .from('products')
    .select('id, name, image')
    .limit(100);

  let hasLargeImages = false;
  largeProducts?.forEach(p => {
    if (p.image && p.image.length > 5000) {
      log(`Product ID ${p.id} (${p.name}) has a very large image string (Base64 likely). Length: ${p.image.length}`);
      hasLargeImages = true;
    }
  });

  if (!hasLargeImages) {
    log('No Base64 images detected in products table (first 100 rows).');
  }

  log('--- End of Check ---');
}

checkHealth();
