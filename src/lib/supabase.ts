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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function optimizeImage(file: File): Promise<Blob | File> {
  // Se não for imagem, retorna o arquivo original
  if (!file.type.startsWith('image/')) return file;
  
  // Se for GIF, não otimizamos para não perder animação (opcional)
  if (file.type === 'image/gif') return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar se for muito grande (max 1200px)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG com qualidade 0.7 para economizar espaço
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export async function uploadImage(file: File, bucket: string = 'images') {
  // 1. Verificar tamanho (5MB)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('O arquivo excede o limite de 5MB');
  }

  // 2. Otimizar imagem
  const processedFile = await optimizeImage(file);

  const fileExt = 'jpg'; // Forçamos JPG após a otimização
  const fileName = `upload-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, processedFile, {
      upsert: true,
      contentType: 'image/jpeg'
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
