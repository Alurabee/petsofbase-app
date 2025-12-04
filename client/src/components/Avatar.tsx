import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null | undefined;
  alt?: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

/**
 * Avatar component for displaying user profile pictures
 * Falls back to a default user icon if no image is provided
 */
export function Avatar({ src, alt = "User avatar", size = "md", className = "" }: AvatarProps) {
  const sizeClass = sizeClasses[size];

  if (!src) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-muted flex items-center justify-center ${className}`}
        aria-label={alt || "User avatar"}
      >
        <User className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-10 h-10"} text-muted-foreground`} />
      </div>
    );
  }

  return (
    <img
      src={src || ""}
      alt={alt || "User avatar"}
      className={`${sizeClass} rounded-full object-cover ${className}`}
    />
  );
}
