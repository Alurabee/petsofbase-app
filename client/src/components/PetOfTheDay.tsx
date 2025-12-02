import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useSocialSharing } from "@/hooks/useSocialSharing";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function PetOfTheDay() {
  const { isAuthenticated } = useAuth();
  const { shareTop10 } = useSocialSharing();
  
  const { data: todaysPet, isLoading } = trpc.petOfTheDay.getToday.useQuery();
  const { data: hasVoted } = trpc.petOfTheDay.hasVoted.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: weekEntries } = trpc.weeklyDraw.getCurrentWeekEntries.useQuery();
  const { data: currentDraw } = trpc.weeklyDraw.getCurrentDraw.useQuery();
  
  const utils = trpc.useUtils();
  const voteMutation = trpc.petOfTheDay.vote.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Vote recorded! 🎉");
        utils.petOfTheDay.getToday.invalidate();
        utils.petOfTheDay.hasVoted.invalidate();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to vote");
    },
  });

  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to vote");
      window.location.href = getLoginUrl();
      return;
    }
    voteMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-64 bg-muted rounded-lg"></div>
      </Card>
    );
  }

  if (!todaysPet) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No Pet of the Day yet. Check back soon!</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-white">
          <Trophy className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Pet of the Day</h2>
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-white/90 text-sm mt-1">
          Vote for today's featured pet to win 2 USDC! 💰
        </p>
      </div>

      {/* Pet Image */}
      <div className="p-6">
        <div className="relative group">
          <img
            src={todaysPet.petImageUrl || "/placeholder-pet.png"}
            alt={todaysPet.petName}
            className="w-full aspect-square object-cover rounded-xl shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <div className="text-white">
              <h3 className="text-2xl font-bold">{todaysPet.petName}</h3>
              <p className="text-sm">
                {todaysPet.petBreed ? `${todaysPet.petBreed} ` : ""}{todaysPet.petSpecies}
              </p>
            </div>
          </div>
        </div>

        {/* Vote Stats */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="text-2xl font-bold">{todaysPet.voteCount}</span>
            <span className="text-muted-foreground">votes</span>
          </div>
          
          {hasVoted ? (
            <div className="flex items-center gap-2 text-green-600">
              <Heart className="w-5 h-5 fill-green-600" />
              <span className="font-semibold">You voted!</span>
            </div>
          ) : (
            <Button
              onClick={handleVote}
              disabled={voteMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
              size="lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              {voteMutation.isPending ? "Voting..." : "Vote Now"}
            </Button>
          )}
        </div>

        {/* Share Button */}
        <Button
          onClick={() => shareTop10(todaysPet.petName, 1, todaysPet.petId.toString())}
          variant="outline"
          className="w-full mt-4"
        >
          🎉 Share Pet of the Day
        </Button>

        {/* Weekly Draw Info */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-center text-sm">
          <p className="font-bold text-purple-900 text-lg mb-2">
            🎰 Weekly Draw: $5 USDC Prize!
          </p>
          <p className="text-purple-700">
            Every Pet of the Day enters the weekly draw
          </p>
          <p className="text-purple-600 mt-1">
            Winner announced Monday at 12pm ET
          </p>
          {weekEntries && weekEntries.length > 0 && (
            <p className="text-sm text-purple-800 mt-2 font-semibold">
              📅 {weekEntries.length}/7 entries this week
            </p>
          )}
        </div>

        {/* Current Week Winner */}
        {currentDraw && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg border-2 border-green-400">
            <p className="font-bold text-green-900 text-center mb-2">
              🎉 This Week's Winner!
            </p>
            <div className="flex items-center gap-3 justify-center">
              {currentDraw.petImageUrl && (
                <img
                  src={currentDraw.petImageUrl}
                  alt={currentDraw.petName || "Winner"}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-green-900">{currentDraw.petName}</p>
                <p className="text-sm text-green-700">Won $5 USDC!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
