import { useBaseContext } from "@/_core/hooks/useBaseContext";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Award, Lock } from "lucide-react";
import { Badge as BadgeComponent } from "@/components/Badge";

export default function Badges() {
  const { farcasterUser } = useBaseContext();
  const isAuthenticated = !!farcasterUser;

  const { data: myBadges, isLoading } = trpc.badges.getMyBadges.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <Award className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            You need to connect your wallet to view your badges.
          </p>
          <Button asChild className="bg-base-gradient btn-primary-hover">
            <span className="text-muted-foreground">Open in Base App</span>
          </Button>
        </Card>
      </div>
    );
  }

  const badgesByTier = {
    milestone: myBadges?.filter(b => b.tier === "milestone") || [],
    achievement: myBadges?.filter(b => b.tier === "achievement") || [],
    exclusive: myBadges?.filter(b => b.tier === "exclusive") || [],
  };

  const totalBadges = myBadges?.length || 0;

  return (
    <div className="min-h-screen bg-base-gradient-soft">
      <Navigation />
      
      {/* Header */}
      <div className="bg-card border-b border-primary/20">
        <div className="container py-8">
          <div className="flex items-center gap-4 mb-4">
            <Award className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">My Badges</h1>
              <p className="text-primary">
                {totalBadges} {totalBadges === 1 ? "badge" : "badges"} earned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Collection */}
      <div className="container py-12 space-y-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : totalBadges === 0 ? (
          <Card className="p-12 text-center">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Badges Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start earning badges by uploading pets, voting, and participating in the community!
            </p>
            <Button asChild className="bg-base-gradient btn-primary-hover">
              <a href="/upload">Upload Your First Pet</a>
            </Button>
          </Card>
        ) : (
          <>
            {/* Milestone Badges */}
            {badgesByTier.milestone.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">🏆</span>
                  Milestone Badges
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {badgesByTier.milestone.map((badge) => (
                    <Card key={badge.badgeId} className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-center">
                        <BadgeComponent badge={badge} size="lg" showTooltip={false} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{badge.description}</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Earned {new Date(badge.earnedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Achievement Badges */}
            {badgesByTier.achievement.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">⭐</span>
                  Achievement Badges
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {badgesByTier.achievement.map((badge) => (
                    <Card key={badge.badgeId} className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-center">
                        <BadgeComponent badge={badge} size="lg" showTooltip={false} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{badge.description}</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Earned {new Date(badge.earnedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Exclusive Badges */}
            {badgesByTier.exclusive.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">💎</span>
                  Exclusive Badges
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {badgesByTier.exclusive.map((badge) => (
                    <Card key={badge.badgeId} className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow border-2 border-amber-300 dark:border-amber-700">
                      <div className="flex justify-center">
                        <BadgeComponent badge={badge} size="lg" showTooltip={false} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{badge.description}</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Earned {new Date(badge.earnedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
