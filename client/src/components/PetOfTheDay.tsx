import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useSocialSharing } from "@/hooks/useSocialSharing";
import { useBaseContext } from "@/_core/hooks/useBaseContext";

export default function PetOfTheDay() {
  const { farcasterUser } = useBaseContext();
  const isAuthenticated = !!farcasterUser;
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
      toast.error("Please open in Base App to vote");
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
    <Card className="overflow-hidden !border-0">
      {/* Header */}
      <div className="bg-gradient-blue-purple p-4 text-center">
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
        <div className="mt-4 p-4 bg-pastel-pink rounded-lg text-center text-sm">
          <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">
            🎖️ Earn Exclusive Badges!
          </p>
          <p className="text-gray-700 dark:text-gray-200">
            Every Pet of the Day earns a special badge
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Collect badges and show off your achievements
          </p>
        </div>
      </div>
    </Card>
  );
}
