import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, Trophy, Crown } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";

export default function Leaderboard() {
  const { data: pets, isLoading } = trpc.pets.leaderboard.useQuery({ limit: 50 });

  return (
    <div className="min-h-screen bg-base-gradient-soft">
      <Navigation />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Trophy className="w-10 h-10 text-primary" />
                Most Popular Pet Leaderboard
              </h1>
              <p className="text-muted-foreground">
                Vote for your favorite pets and help them climb the ranks!
              </p>
              {pets && pets.length < 10 && (
                <p className="text-sm text-orange-600 font-semibold mt-2">
                  🔥 Only {10 - pets.length} spots left in the Top 10!
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                🗓️ Leaderboard resets every Monday at 12pm ET
              </p>
            </div>
            <Button asChild className="bg-base-gradient btn-primary-hover">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="container py-12">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : pets && pets.length > 0 ? (
          <div className="grid gap-4">
            {pets.map((pet, index) => {
              const isTop3 = index < 3;
              const rankColors = [
                "bg-gradient-to-r from-yellow-400 to-yellow-600", // Gold
                "bg-gradient-to-r from-gray-300 to-gray-500", // Silver
                "bg-gradient-to-r from-orange-400 to-orange-600", // Bronze
              ];

              return (
                <Card
                  key={pet.id}
                  className={`p-6 hover:shadow-lg transition-all ${
                    isTop3 ? "border-2 border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank Badge */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
                        isTop3 ? rankColors[index] : "bg-base-gradient"
                      }`}
                    >
                      {isTop3 && index === 0 ? (
                        <Crown className="w-8 h-8" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </div>

                    {/* Pet Image */}
                    <div className="relative">
                      <img
                        src={pet.pfpImageUrl || pet.originalImageUrl}
                        alt={pet.name}
                        className="w-24 h-24 object-cover rounded-lg pet-card-border"
                      />
                    </div>

                    {/* Pet Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">{pet.name}</h3>
                      <p className="text-muted-foreground">
                        {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
                      </p>
                      {pet.ownerName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Owner: <span className="font-semibold text-primary">{pet.ownerName}</span>
                        </p>
                      )}
                      {pet.personality && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {pet.personality}
                        </p>
                      )}
                    </div>

                    {/* Vote Count */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-6 h-6 text-primary fill-primary" />
                        <span className="text-3xl font-bold text-primary">
                          {pet.voteCount}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">votes</span>
                    </div>

                    {/* View Button */}
                    <Button asChild variant="outline">
                      <Link href={`/pet/${pet.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Pets Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to upload your pet and start the leaderboard!
            </p>
            <Button asChild className="bg-base-gradient btn-primary-hover">
              <Link href="/upload">Upload Your Pet</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
