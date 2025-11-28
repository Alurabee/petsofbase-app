import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Heart, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import { toast } from "sonner";

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const petId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: pet, isLoading } = trpc.pets.getById.useQuery(
    { id: petId },
    { enabled: petId > 0 }
  );

  const { data: hasVoted } = trpc.votes.hasVoted.useQuery(
    { petId },
    { enabled: isAuthenticated && petId > 0 }
  );

  const utils = trpc.useUtils();
  const voteMutation = trpc.votes.vote.useMutation({
    onSuccess: () => {
      toast.success("Vote recorded!");
      utils.pets.getById.invalidate({ id: petId });
      utils.votes.hasVoted.invalidate({ petId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to vote");
    },
  });

  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to vote");
      return;
    }
    voteMutation.mutate({ petId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Card className="p-8 max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Pet Not Found</h2>
          <p className="text-muted-foreground">
            The pet you're looking for doesn't exist.
          </p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === pet.userId;
  const displayImage = pet.pfpImageUrl || pet.originalImageUrl;

  return (
    <div className="min-h-screen bg-base-gradient-soft">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/leaderboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Image */}
          <div className="space-y-4">
            <img
              src={displayImage}
              alt={pet.name}
              className="w-full aspect-square object-cover rounded-lg pet-card-border"
            />

            {pet.nftTokenId && (
              <Card className="p-4 bg-base-gradient-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">NFT Information</span>
                  <Badge className="bg-primary">Minted</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token ID:</span>
                    <span className="font-bold">#{pet.nftTokenId}</span>
                  </div>
                  {pet.nftContractAddress && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contract:</span>
                      <a
                        href={`https://basescan.org/address/${pet.nftContractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        {pet.nftContractAddress.slice(0, 6)}...{pet.nftContractAddress.slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {pet.nftTransactionHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Transaction:</span>
                      <a
                        href={`https://basescan.org/tx/${pet.nftTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        View on BaseScan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-bold">{pet.name}</h1>
                {!pet.pfpImageUrl && (
                  <Badge variant="outline">Original Photo</Badge>
                )}
                {pet.pfpImageUrl && !pet.nftTokenId && (
                  <Badge className="bg-green-500">PFP Generated</Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground">
                {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
              </p>
            </div>

            {pet.personality && (
              <Card className="p-4">
                <h3 className="font-bold mb-2">Personality</h3>
                <p className="text-muted-foreground">{pet.personality}</p>
              </Card>
            )}

            {pet.likes && (
              <Card className="p-4">
                <h3 className="font-bold mb-2">Likes</h3>
                <p className="text-muted-foreground">{pet.likes}</p>
              </Card>
            )}

            {pet.dislikes && (
              <Card className="p-4">
                <h3 className="font-bold mb-2">Dislikes</h3>
                <p className="text-muted-foreground">{pet.dislikes}</p>
              </Card>
            )}

            {/* Voting */}
            <Card className="p-6 bg-base-gradient-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Cuteness Score</h3>
                  <p className="text-3xl font-bold text-primary">{pet.voteCount}</p>
                  <p className="text-sm text-muted-foreground">votes</p>
                </div>
                <Heart className="w-12 h-12 text-primary" />
              </div>

              {!isOwner && (
                <Button
                  onClick={handleVote}
                  disabled={hasVoted || voteMutation.isPending}
                  className="w-full bg-base-gradient hover:opacity-90"
                >
                  {hasVoted ? (
                    <>
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      Already Voted
                    </>
                  ) : voteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Voting...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Vote for {pet.name}
                    </>
                  )}
                </Button>
              )}

              {isOwner && (
                <p className="text-sm text-center text-muted-foreground">
                  You can't vote for your own pet
                </p>
              )}
            </Card>

            {/* Actions */}
            {isOwner && (
              <div className="space-y-3">
                {!pet.pfpImageUrl && (
                  <Button
                    asChild
                    className="w-full bg-base-gradient hover:opacity-90"
                  >
                    <Link href="/my-pets">Generate PFP</Link>
                  </Button>
                )}

                {pet.pfpImageUrl && !pet.nftTokenId && (
                  <Button
                    asChild
                    className="w-full bg-base-gradient hover:opacity-90"
                  >
                    <Link href={`/mint/${pet.id}`}>Mint as NFT ($0.25 USDC)</Link>
                  </Button>
                )}

                {pet.nftTokenId && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/my-pets">View My Pets</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
