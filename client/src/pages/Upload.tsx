import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Upload as UploadIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useBaseContext } from "@/_core/hooks/useBaseContext";
import { useQuickAuth } from "@/_core/hooks/useQuickAuth";

export default function Upload() {
  const { farcasterUser } = useBaseContext();
  const { authenticate } = useQuickAuth();
  const isAuthenticated = !!farcasterUser;
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validatedImageUrl, setValidatedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<{
    icon: string;
    title: string;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    personality: "",
    likes: "",
    dislikes: "",
  });

  const uploadImage = trpc.pets.uploadImage.useMutation();
  const createPet = trpc.pets.create.useMutation();
  const validateImageBase64 = trpc.imageValidation.validatePetImageBase64.useMutation();
  const validateImageUrl = trpc.imageValidation.validatePetImage.useMutation();

  async function downscaleToJpeg(
    dataUrl: string,
    opts: { maxDim: number; quality: number }
  ): Promise<{ imageBase64: string; mimeType: string }> {
    // Keep payloads small to avoid serverless request limits.
    // Converts to JPEG and downscales to maxDim on the long edge.
    const MAX_DIM = opts.maxDim;
    const QUALITY = opts.quality;

    // Some environments may not support canvas/image decode; fall back to original.
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to decode image"));
      });

      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) throw new Error("Invalid image dimensions");

      const scale = Math.min(1, MAX_DIM / Math.max(w, h));
      const tw = Math.max(1, Math.round(w * scale));
      const th = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      ctx.drawImage(img, 0, 0, tw, th);

      const jpegDataUrl = canvas.toDataURL("image/jpeg", QUALITY);
      const base64 = jpegDataUrl.split(",")[1] || "";
      if (!base64) throw new Error("Failed to encode jpeg");
      return { imageBase64: base64, mimeType: "image/jpeg" };
    } catch {
      // Fall back to original payload (still as jpeg mime type hint).
      const base64 = dataUrl.split(",")[1] || "";
      return { imageBase64: base64, mimeType: "image/jpeg" };
    }
  }

  async function fetchDeployStatus(): Promise<null | {
    vercelEnv?: string | null;
    commitSha?: string | null;
    hasGeminiApiKey?: boolean;
  }> {
    try {
      const res = await fetch("/api/demo-status", { credentials: "include" });
      if (!res.ok) return null;
      const json = (await res.json()) as any;
      return {
        vercelEnv: json?.vercelEnv ?? null,
        commitSha: json?.commitSha ?? null,
        hasGeminiApiKey: Boolean(json?.hasGeminiApiKey),
      };
    } catch {
      return null;
    }
  }

  function isLikelyProcedureMissing(err: any): boolean {
    const msg = String(err?.message || err || "");
    return (
      msg.includes("validatePetImageBase64") ||
      msg.includes("NOT_FOUND") ||
      msg.includes("404") ||
      msg.includes("No \"validatePetImageBase64\"") ||
      msg.includes("No such procedure")
    );
  }

  function isLikelyTrpcJsonParseFailure(err: any): boolean {
    const msg = String(err?.message || err || "");
    return (
      msg.includes("Unexpected end of JSON input") ||
      msg.includes("Failed to execute 'json'") ||
      msg.includes("Invalid JSON") ||
      msg.includes("SyntaxError")
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Always reset state when a new file is selected.
    setValidationError(null);
    setValidating(false);
    setImageFile(null);
    setImagePreview(null);
    setValidatedImageUrl(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const preview = reader.result as string;

      // Validate image with AI
      setValidating(true);
      toast.loading("Analyzing image...", { id: "validation" });
      
      try {
        const base64Data = preview.split(",")[1];
        // Validation thumbnail: very small payload.
        const validationPayload = await downscaleToJpeg(preview, { maxDim: 512, quality: 0.75 });
        // Upload payload: keep within Vercel body limits by downscaling.
        const uploadPayload = await downscaleToJpeg(preview, { maxDim: 1024, quality: 0.88 });
        const uploadFileName = file.name.replace(/\.[^.]+$/, "") + ".jpg";

        // Validate the image payload first (no upload, no auth prompt).
        // If the server hasn't deployed this new procedure yet, fall back to URL validation.
        let validationResult: any;
        try {
          validationResult = await validateImageBase64.mutateAsync({
            imageBase64: validationPayload.imageBase64,
            mimeType: validationPayload.mimeType,
          });
        } catch (err: any) {
          // If the procedure isn't available yet OR the response isn't JSON (serverless limit/crash),
          // fall back to URL validation (upload + validate by URL).
          if (!isLikelyProcedureMissing(err) && !isLikelyTrpcJsonParseFailure(err)) throw err;

          // Fallback path: validate via URL (requires upload + auth).
          await authenticate();
          const uploadResult = await uploadImage.mutateAsync({
            fileName: uploadFileName,
            fileType: uploadPayload.mimeType,
            fileData: uploadPayload.imageBase64,
          });
          validationResult = await validateImageUrl.mutateAsync({ imageUrl: uploadResult.url });
        }
        
        if (!validationResult.isValid) {
          // Show validation error
          const errorDetails = (validationResult as any).errorDetails || {
            icon: "❌",
            title: "Validation Failed",
            message: validationResult.message || "Please try a different image"
          };
          setValidationError(errorDetails);
          setImageFile(null);
          setImagePreview(null);
          setValidatedImageUrl(null);
          toast.error(errorDetails.title || "Validation failed", { id: "validation" });
          
          // Track validation failure for analytics
          console.log("[Analytics] Image validation failed:", {
            reason: validationResult.reason,
            confidence: validationResult.confidence,
            detectedSubject: validationResult.detectedSubject
          });
        } else {
          // Ensure Quick Auth token exists before hitting protected tRPC routes (uploadImage).
          // This also stores the token so the tRPC client can attach it automatically.
          await authenticate();

          // Upload only after validation passes (keeps invalid photos out of storage when base64
          // validation is available; if we fell back to URL validation above, this will upsert).
          const uploadResult = await uploadImage.mutateAsync({
            fileName: uploadFileName,
            fileType: uploadPayload.mimeType,
            fileData: uploadPayload.imageBase64,
          });

          // Success
          setImageFile(file);
          setImagePreview(preview);
          setValidatedImageUrl(uploadResult.url);
          toast.success("Pet detected! ✓", { id: "validation" });
        }
      } catch (error: any) {
        console.error("Validation error:", error);
        setImageFile(null);
        setImagePreview(null);
        setValidatedImageUrl(null);

        const status = await fetchDeployStatus();
        const deployHint =
          status?.commitSha
            ? ` (env: ${status.vercelEnv ?? "unknown"}, commit: ${String(status.commitSha).slice(0, 7)}, GEMINI key: ${
                status.hasGeminiApiKey ? "yes" : "no"
              })`
            : "";
        const rawError = String(error?.message || error || "");
        setValidationError({
          icon: "🛠️",
          title: "Validation temporarily unavailable",
          message:
            `We couldn't validate this image right now. Please try again. If this keeps happening, check that GEMINI_API_KEY is set (for the same Vercel env you're testing). Error: ${rawError}${deployHint}`,
        });
        toast.error("Validation failed. Please try again.", { id: "validation" });
      } finally {
        setValidating(false);

        // Allow re-selecting the same file by clearing the input value.
        try {
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch {
          // ignore
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValidationError(null);
    setValidatedImageUrl(null);
    try {
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !validatedImageUrl) {
      toast.error("Please upload a photo of your pet");
      return;
    }

    if (!formData.name || !formData.species) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);

    try {
      // Authenticate with Quick Auth before creating pet
      toast.loading("Authenticating...");
      await authenticate();
      
      // Create pet record with Farcaster profile data
      toast.loading("Creating pet profile...");
      await createPet.mutateAsync({
        ...formData,
        originalImageUrl: validatedImageUrl,
        // Include Farcaster profile data from Context API
        ownerFid: farcasterUser?.fid,
        ownerUsername: farcasterUser?.username,
        ownerDisplayName: farcasterUser?.displayName,
        ownerPfpUrl: farcasterUser?.pfpUrl,
      } as any); // Type assertion needed until tRPC types regenerate

      toast.success("Pet uploaded successfully! Now let's generate your PFP.");
      setLocation("/my-pets");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred");
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center bg-base-gradient-soft">
          <Card className="p-8 max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold">Open in Base App</h2>
            <p className="text-muted-foreground">
              Please open this app in the Base App to upload your pet.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const canEditDetails = !!validatedImageUrl && !validating && !uploading && !validationError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 py-12 relative overflow-hidden">
      <Navigation />
      {/* Decorative floating emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce" style={{animationDuration: '3s'}}>🐶</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 animate-bounce" style={{animationDuration: '4s', animationDelay: '0.5s'}}>🐱</div>
        <div className="absolute bottom-32 left-1/4 text-5xl opacity-20 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '1s'}}>🐰</div>
        <div className="absolute bottom-20 right-1/3 text-4xl opacity-20 animate-bounce" style={{animationDuration: '4.5s', animationDelay: '1.5s'}}>🦜</div>
        <div className="absolute top-1/2 right-10 text-5xl opacity-20 animate-bounce" style={{animationDuration: '3.8s', animationDelay: '0.8s'}}>🐾</div>
      </div>
      <div className="container max-w-3xl relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 bg-gradient-blue-purple bg-clip-text text-transparent">Upload Your Pet ✨</h1>
          <p className="text-lg text-muted-foreground">
            Your pet is about to become a star! Fill in the details below to get started. 🌟
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Pet Photo *</Label>
              {!imagePreview ? (
                <label
                  htmlFor="image"
                  className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="mb-4 p-3 rounded-full bg-gradient-blue-purple group-hover:scale-110 transition-transform duration-300">
                      <UploadIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="mb-2 text-sm font-medium">
                      Click to upload or drag and drop 📸
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, or WEBP (max 5MB)
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground text-center max-w-xs space-y-1">
                      <p className="font-medium text-foreground/80">For best results, use:</p>
                      <p>- Clear pet face, centered</p>
                      <p>- Good lighting, minimal motion blur</p>
                      <p>- No humans in frame</p>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full aspect-square object-contain rounded-lg pet-card-border bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Keep file input mounted so we can trigger it reliably */}
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Validation Error */}
            {validationError && (
              <Card className="p-6 border-2 border-destructive bg-destructive/5">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{validationError.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{validationError.title}</h3>
                      <p className="text-sm text-muted-foreground">{validationError.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setValidationError(null);
                        fileInputRef.current?.click();
                      }}
                      className="bg-base-gradient btn-primary-hover"
                    >
                      Try Another Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setValidationError(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Validating Indicator */}
            {validating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span>Analyzing image... (we’ll show it after it passes)</span>
              </div>
            )}

            {/* Pet Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Max"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={!canEditDetails}
              />
            </div>

            {/* Species */}
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Input
                id="species"
                placeholder="e.g., Dog, Cat, Bird, Rabbit"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                required
                disabled={!canEditDetails}
              />
            </div>

            {/* Breed */}
            <div className="space-y-2">
              <Label htmlFor="breed">Breed (Optional)</Label>
              <Input
                id="breed"
                placeholder="e.g., Golden Retriever"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                disabled={!canEditDetails}
              />
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <Label htmlFor="personality">Personality (Optional)</Label>
              <Textarea
                id="personality"
                placeholder="e.g., Friendly, playful, loves to cuddle"
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                rows={3}
                disabled={!canEditDetails}
              />
            </div>

            {/* Likes */}
            <div className="space-y-2">
              <Label htmlFor="likes">Likes (Optional)</Label>
              <Textarea
                id="likes"
                placeholder="e.g., Fetch, treats, belly rubs"
                value={formData.likes}
                onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                rows={2}
                disabled={!canEditDetails}
              />
            </div>

            {/* Dislikes */}
            <div className="space-y-2">
              <Label htmlFor="dislikes">Dislikes (Optional)</Label>
              <Textarea
                id="dislikes"
                placeholder="e.g., Baths, loud noises"
                value={formData.dislikes}
                onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })}
                rows={2}
                disabled={!canEditDetails}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-blue-purple hover:opacity-90 transition-all duration-300 text-white font-semibold text-lg py-6 hover:scale-105"
              disabled={uploading || validating || !imageFile || !validatedImageUrl}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue to Generate PFP 🎨✨
                </span>
              )}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
