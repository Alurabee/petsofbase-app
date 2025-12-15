import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

export interface ImageValidationResult {
  isValid: boolean;
  reason?:
    | "human_face"
    | "no_animal"
    | "low_quality"
    | "inappropriate"
    | "service_error"
    | "valid";
  confidence: number;
  detectedSubject?: string;
  message?: string;
}

type ImageBytes = { bytes: Buffer; mimeType: string };

async function validatePetImageBytes(bytes: Buffer, mimeType: string): Promise<ImageValidationResult> {
  if (!ENV.geminiApiKey) {
    return {
      isValid: false,
      reason: "service_error",
      confidence: 0,
      detectedSubject: "validation_not_configured",
      message: "Image validation is not configured. Please set GEMINI_API_KEY.",
    };
  }

  const imageBase64 = bytes.toString("base64");

  const genAI = new GoogleGenerativeAI(ENV.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an image validation system for a pet photo app.
Return ONLY valid JSON with this exact schema:
{
  "isValid": true/false,
  "reason": "human_face" | "no_animal" | "low_quality" | "inappropriate" | "valid",
  "confidence": 0.0-1.0,
  "detectedSubject": "short description of what you see",
  "message": "brief explanation"
}

Rules:
- ACCEPT if: clear photo of a domestic pet (dog, cat, rabbit, bird, hamster, guinea pig, ferret, etc.), pet is the main subject, wholesome content.
- REJECT if: human faces (even with pets), no animal visible, inappropriate/offensive, too blurry/low quality, wild animals.`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
      },
    ],
  });

  const text = result.response.text();
  const parsed = safeParseJsonObject(text);
  const normalized = normalizeResult(parsed);

  if (typeof normalized.isValid !== "boolean" || typeof normalized.confidence !== "number") {
    return {
      isValid: false,
      reason: "service_error",
      confidence: 0,
      detectedSubject: "validation_parse_error",
      message: "Validation returned an unexpected response. Please try again.",
    };
  }

  return normalized;
}

function safeParseJsonObject(text: string): any {
  // Gemini sometimes returns code-fenced JSON or extra text. Extract the first JSON object.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object");
  }
  const json = text.slice(start, end + 1);
  return JSON.parse(json);
}

function tryParseSupabaseStoragePath(url: string): { bucket: string; path: string } | null {
  // Typical public URL:
  // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  // Signed URL:
  // https://<project>.supabase.co/storage/v1/object/sign/<bucket>/<path>?token=...
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex(p => p === "storage");
    if (idx === -1) return null;
    // Expect: storage/v1/object/{public|sign}/bucket/path...
    const objectIdx = parts.findIndex((p, i) => i > idx && p === "object");
    if (objectIdx === -1) return null;
    const visibility = parts[objectIdx + 1];
    const bucket = parts[objectIdx + 2];
    if (!bucket || (visibility !== "public" && visibility !== "sign")) return null;
    const pathParts = parts.slice(objectIdx + 3);
    if (pathParts.length === 0) return null;
    return { bucket, path: pathParts.join("/") };
  } catch {
    return null;
  }
}

async function getImageBytes(imageUrl: string): Promise<ImageBytes> {
  // First attempt: plain fetch (works for public URLs).
  const res = await fetch(imageUrl);
  if (res.ok) {
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const bytes = Buffer.from(await res.arrayBuffer());
    return { bytes, mimeType };
  }

  // Fallback: if this is a Supabase Storage URL, download via service role.
  const supabaseUrl = process.env.STORAGE_SUPABASE_URL;
  const supabaseKey = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;
  const parsed = tryParseSupabaseStoragePath(imageUrl);
  if (!supabaseUrl || !supabaseKey || !parsed) {
    throw new Error(`Failed to fetch image (${res.status} ${res.statusText})`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.storage.from(parsed.bucket).download(parsed.path);
  if (error || !data) {
    throw new Error(`Supabase storage download failed: ${error?.message || "unknown error"}`);
  }

  // supabase-js returns a Blob
  const mimeType = (data as any).type || "image/jpeg";
  const bytes = Buffer.from(await (data as any).arrayBuffer());
  return { bytes, mimeType };
}

function normalizeResult(input: any): ImageValidationResult {
  const isValid = Boolean(input?.isValid);
  const confidence =
    typeof input?.confidence === "number" && Number.isFinite(input.confidence)
      ? Math.max(0, Math.min(1, input.confidence))
      : 0.5;

  const allowedReasons = new Set([
    "human_face",
    "no_animal",
    "low_quality",
    "inappropriate",
    "service_error",
    "valid",
  ]);
  const reason = typeof input?.reason === "string" && allowedReasons.has(input.reason) ? input.reason : undefined;

  const detectedSubject = typeof input?.detectedSubject === "string" ? input.detectedSubject : undefined;
  const message = typeof input?.message === "string" ? input.message : undefined;

  return {
    isValid,
    reason,
    confidence,
    detectedSubject,
    message,
  };
}

/**
 * Validate that an image contains a pet (domestic animal) and not a human face or inappropriate content
 */
export async function validatePetImage(imageUrl: string): Promise<ImageValidationResult> {
  try {
    const { bytes, mimeType } = await getImageBytes(imageUrl);
    return await validatePetImageBytes(bytes, mimeType);
  } catch (error) {
    console.error("[Image Validation] Error:", error);
    // Fail closed: block uploads if the validation service is down/misconfigured.
    return {
      isValid: false,
      reason: "service_error",
      confidence: 0,
      detectedSubject: "validation_error",
      message: "Validation service unavailable. Please try again in a moment.",
    };
  }
}

export async function validatePetImageBase64(input: {
  imageBase64: string;
  mimeType: string;
}): Promise<ImageValidationResult> {
  try {
    const bytes = Buffer.from(input.imageBase64, "base64");
    return await validatePetImageBytes(bytes, input.mimeType || "image/jpeg");
  } catch (error) {
    console.error("[Image Validation] Base64 error:", error);
    return {
      isValid: false,
      reason: "service_error",
      confidence: 0,
      detectedSubject: "validation_error",
      message: "Validation service unavailable. Please try again in a moment.",
    };
  }
}

/**
 * Get user-friendly error message based on validation reason
 */
export function getValidationErrorMessage(reason: string): { title: string; message: string; icon: string } {
  switch (reason) {
    case "human_face":
      return {
        icon: "🚫",
        title: "Human Face Detected",
        message: "We detected a human face in this image. PetsOfBase is designed for pet photos only. Please upload a clear photo of your pet (dog, cat, rabbit, bird, etc.)."
      };
    case "no_animal":
      return {
        icon: "🔍",
        title: "No Pet Detected",
        message: "We couldn't detect a pet in this image. Please upload a clear, well-lit photo showing your pet's face. Make sure your pet is the main subject of the photo."
      };
    case "low_quality":
      return {
        icon: "📸",
        title: "Image Quality Too Low",
        message: "This image is too blurry or low-resolution. Please upload a clearer photo (minimum 512x512 pixels) for best results."
      };
    case "inappropriate":
      return {
        icon: "⚠️",
        title: "Image Not Allowed",
        message: "This image violates our content policy. Please upload a wholesome photo of your pet."
      };
    case "service_error":
      return {
        icon: "🛠️",
        title: "Validation Temporarily Unavailable",
        message:
          "We couldn't validate this image right now. Please try again. If this keeps happening, the app may be missing GEMINI_API_KEY or the validation service is down.",
      };
    default:
      return {
        icon: "❌",
        title: "Validation Failed",
        message: "We couldn't validate this image. Please try a different photo."
      };
  }
}
