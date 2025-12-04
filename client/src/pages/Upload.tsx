import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Upload as UploadIcon, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useBaseContext } from "@/hooks/useBaseContext";

export default function Upload() {
  const { user, isAuthenticated } = useAuth();
  const { user: farcasterUser } = useBaseContext();
  const [, setLocation] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  const validateImage = trpc.imageValidation.validatePetImage.useMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setImageFile(file);
    setValidationError(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const preview = reader.result as string;
      setImagePreview(preview);
      
      // Validate image with AI
      setValidating(true);
      toast.loading("Analyzing image...", { id: "validation" });
      
      try {
        // First upload to get URL for validation
        const base64Data = preview.split(',')[1];
        const uploadResult = await uploadImage.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data,
        });
        
        // Validate the uploaded image
        const validationResult = await validateImage.mutateAsync({
          imageUrl: uploadResult.url
        });
        
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
          toast.error(errorDetails.title || "Validation failed", { id: "validation" });
          
          // Track validation failure for analytics
          console.log("[Analytics] Image validation failed:", {
            reason: validationResult.reason,
            confidence: validationResult.confidence,
            detectedSubject: validationResult.detectedSubject
          });
        } else {
          // Success
          toast.success("Pet detected! ✓", { id: "validation" });
        }
      } catch (error: any) {
        console.error("Validation error:", error);
        toast.error("Validation failed. Please try again.", { id: "validation" });
      } finally {
        setValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please upload a photo of your pet");
      return;
    }

    if (!formData.name || !formData.species) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
          
          // Upload to S3
          toast.loading("Uploading image...");
          const uploadResult = await uploadImage.mutateAsync({
            fileName: imageFile.name,
            fileType: imageFile.type,
            fileData: base64Data,
          });

          // Create pet record with Farcaster profile data
          toast.loading("Creating pet profile...");
          await createPet.mutateAsync({
            ...formData,
            originalImageUrl: uploadResult.url,
            // Include Farcaster profile data from Context API
            ownerFid: farcasterUser?.fid,
            ownerUsername: farcasterUser?.username,
            ownerDisplayName: farcasterUser?.displayName,
            ownerPfpUrl: farcasterUser?.pfpUrl,
          } as any); // Type assertion needed until tRPC types regenerate

          toast.success("Pet uploaded successfully! Now let's generate your PFP.");
          setLocation("/my-pets");
        } catch (error: any) {
          toast.error(error.message || "Failed to upload pet");
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setUploading(false);
      };
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred");
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            You need to connect your wallet to upload a pet.
          </p>
          <Button asChild className="bg-base-gradient btn-primary-hover w-full">
            <a href={getLoginUrl()}>Connect Wallet</a>
          </Button>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-5xl font-bold mb-3 bg-gradient-blue-purple bg-clip-text text-transparent">Upload Your Pet ✨</h1>
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
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
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
                        document.getElementById('image')?.click();
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
                <span>Analyzing image...</span>
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
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-blue-purple hover:opacity-90 transition-all duration-300 text-white font-semibold text-lg py-6 hover:scale-105"
              disabled={uploading || !imageFile}
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
