import { supabase } from './supabase';

const BUCKET = 'media';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Upload file to Supabase Storage
export async function uploadFile(file: File, folder: string = 'items'): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

// Upload multiple files
export async function uploadFiles(files: File[], folder: string = 'items'): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadFile(file, folder);
    if (url) urls.push(url);
  }
  return urls;
}

// Delete file from storage
export async function deleteFile(url: string): Promise<boolean> {
  try {
    const path = url.split(`/storage/v1/object/public/${BUCKET}/`)[1];
    if (!path) return false;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    return !error;
  } catch {
    return false;
  }
}

// Check if URL is a video
export function isVideo(url: string): boolean {
  const ext = url.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext);
}

// Check if URL is an image
export function isImage(url: string): boolean {
  const ext = url.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ext);
}
