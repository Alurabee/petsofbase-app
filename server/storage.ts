import { createClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

const supabase = ENV.supabaseUrl && ENV.supabaseServiceKey
  ? createClient(ENV.supabaseUrl, ENV.supabaseServiceKey)
  : null;

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (!supabase) throw new Error("Supabase not configured");
  
  const bucket = 'pets';
  const key = relKey.replace(/^\/+/, "");
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, data, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(key);
  return { key, url: publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  if (!supabase) throw new Error("Supabase not configured");
  
  const bucket = 'pets';
  const key = relKey.replace(/^\/+/, "");
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(key);
  return { key, url: publicUrl };
}
