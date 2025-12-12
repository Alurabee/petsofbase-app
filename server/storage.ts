// Supabase Storage implementation for file uploads
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.STORAGE_SUPABASE_URL;
  const supabaseKey = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase credentials missing: set STORAGE_SUPABASE_URL and STORAGE_SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

const BUCKET_NAME = 'pet-images'; // Default bucket name for pet uploads

/**
 * Upload a file to Supabase Storage
 * @param relKey - Relative path/key for the file (e.g., "pets/123/avatar.png")
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, ""); // Remove leading slashes

  // Convert data to Buffer if it's a string
  const buffer = typeof data === "string" ? Buffer.from(data) : data;

  // Upload to Supabase Storage
  const { data: uploadData, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(key, buffer, {
      contentType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key);

  return {
    key,
    url: publicUrl,
  };
}

/**
 * Get a public URL for a file in Supabase Storage
 * @param relKey - Relative path/key for the file
 * @returns Object with key and public URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key);

  return {
    key,
    url: publicUrl,
  };
}
