import { cn } from "@/lib/utils";

export interface BadgeData {
  badgeId: number;
  name: string;
  icon: string;
  description: string;
  tier: "milestone" | "achievement" | "exclusive";
  earnedAt?: Date;
}

interface BadgeProps {
  badge: BadgeData;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function Badge({ badge, size = "md", showTooltip = true, className }: BadgeProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const tierColors = {
    milestone: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    achievement: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    exclusive: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border-2 p-2",
        tierColors[badge.tier],
        sizeClasses[size],
        showTooltip && "group relative cursor-help",
        className
      )}
      title={showTooltip ? badge.description : undefined}
    >
      <span>{badge.icon}</span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]">
            <div className="font-semibold text-sm mb-1 flex items-center gap-2">
              <span className="text-xl">{badge.icon}</span>
              {badge.name}
            </div>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            {badge.earnedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface BadgeListProps {
  badges: BadgeData[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BadgeList({ badges, maxDisplay = 5, size = "sm", className }: BadgeListProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {displayBadges.map((badge) => (
        <Badge key={badge.badgeId} badge={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-muted-foreground ml-1">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
