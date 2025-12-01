import { invokeLLM } from "./_core/llm";

export interface ImageValidationResult {
  isValid: boolean;
  reason?: "human_face" | "no_animal" | "low_quality" | "inappropriate" | "valid";
  confidence: number;
  detectedSubject?: string;
  message?: string;
}

/**
 * Validate that an image contains a pet (domestic animal) and not a human face or inappropriate content
 */
export async function validatePetImage(imageUrl: string): Promise<ImageValidationResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an image validation system for a pet photo app. Analyze images and determine if they contain a domestic pet (dog, cat, rabbit, bird, hamster, guinea pig, ferret, etc.).

REJECT if:
- Contains human faces (even with pets)
- No animal visible
- Inappropriate/offensive content
- Image is too blurry or low quality
- Wild animals (lions, tigers, bears, etc.)

ACCEPT if:
- Clear photo of a domestic pet
- Pet is the main subject
- Good image quality
- Wholesome content

Respond ONLY with valid JSON in this exact format:
{
  "isValid": true/false,
  "reason": "human_face" | "no_animal" | "low_quality" | "inappropriate" | "valid",
  "confidence": 0.0-1.0,
  "detectedSubject": "description of what you see",
  "message": "brief explanation"
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and determine if it's a valid pet photo:"
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low" // Use low detail for faster validation
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "image_validation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isValid: {
                type: "boolean",
                description: "Whether the image is a valid pet photo"
              },
              reason: {
                type: "string",
                enum: ["human_face", "no_animal", "low_quality", "inappropriate", "valid"],
                description: "Reason for validation result"
              },
              confidence: {
                type: "number",
                description: "Confidence score from 0.0 to 1.0"
              },
              detectedSubject: {
                type: "string",
                description: "What was detected in the image"
              },
              message: {
                type: "string",
                description: "Brief explanation of the validation result"
              }
            },
            required: ["isValid", "reason", "confidence", "detectedSubject", "message"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr || "{}");
    return result as ImageValidationResult;
  } catch (error) {
    console.error("[Image Validation] Error:", error);
    // On error, allow the image through but log it
    return {
      isValid: true,
      reason: "valid",
      confidence: 0.5,
      detectedSubject: "validation_error",
      message: "Validation service unavailable, allowing upload"
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
    default:
      return {
        icon: "❌",
        title: "Validation Failed",
        message: "We couldn't validate this image. Please try a different photo."
      };
  }
}
