import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Trophy, Zap } from "lucide-react";
import { useEffect } from "react";

export default function LiveActivityFeed() {
  const { data: activities, refetch } = trpc.activityFeed.getRecent.useQuery({ limit: 10 });
  const { data: stats } = trpc.activityFeed.getStats.useQuery();

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "generation":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case "mint":
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case "vote":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "top10":
        return <Trophy className="w-5 h-5 text-blue-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityText = (activity: any) => {
    const userName = activity.userName || "Someone";
    const petName = activity.petName || "their pet";

    switch (activity.activityType) {
      case "generation":
        return (
          <>
            <span className="font-semibold">{userName}</span> generated a PFP for{" "}
            <span className="font-semibold">{petName}</span>
          </>
        );
      case "mint":
        return (
          <>
            <span className="font-semibold">{userName}</span> minted{" "}
            <span className="font-semibold">{petName}</span> as an NFT! 🎉
          </>
        );
      case "vote":
        return (
          <>
            <span className="font-semibold">{userName}</span> voted for{" "}
            <span className="font-semibold">{petName}</span>
          </>
        );
      case "top10":
        return (
          <>
            <span className="font-semibold">{petName}</span> reached #{activity.metadata?.rank} on the leaderboard! 🏆
          </>
        );
      default:
        return <span>Activity</span>;
    }
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const activityDate = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Live Activity</h3>
        {stats && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>{stats.generations} today</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{stats.mints} minted</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{stats.votes} votes</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5">{getActivityIcon(activity.activityType)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{getActivityText(activity)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getTimeAgo(activity.createdAt)}
                </p>
              </div>
              {activity.petImageUrl && (
                <img
                  src={activity.petImageUrl}
                  alt={activity.petName || "Pet"}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No recent activity. Be the first!
          </p>
        )}
      </div>
    </Card>
  );
}
