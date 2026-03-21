import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key missing. Check .env');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export async function uploadImage(file: File, bucket: string = 'images') {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: true
    });

  if (error) {
    console.error('Supabase Storage Error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}
