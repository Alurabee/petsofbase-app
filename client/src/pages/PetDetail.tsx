import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { Heart, ExternalLink, Loader2, ArrowLeft, Sparkles, History, Check, Share2 } from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const petId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("pixar");
  const [regenerating, setRegenerating] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const { data: pet, isLoading, refetch } = trpc.pets.getById.useQuery(
    { id: petId },
    { enabled: petId > 0 }
  );
  const { data: styles } = trpc.pets.getStyles.useQuery();

  const { data: hasVoted } = trpc.votes.hasVoted.useQuery(
    { petId },
    { enabled: isAuthenticated && petId > 0 }
  );

  const { data: versions, refetch: refetchVersions } = trpc.pfpVersions.getByPetId.useQuery(
    { petId },
    { enabled: petId > 0 }
  );

  const { data: referralStats } = trpc.referrals.getMyStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
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

  const selectVersionMutation = trpc.pfpVersions.selectVersion.useMutation({
    onSuccess: () => {
      toast.success("Version selected!");
      refetch();
      refetchVersions();
      setShowVersionHistory(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to select version");
    },
  });

  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to vote");
      return;
    }
    voteMutation.mutate({ petId });
  };

  const handleRegenerate = async () => {
    if (!pet) return;

    const generationCount = pet.generationCount || 0;
    const FREE_LIMIT = 2;

    setRegenerating(true);
    toast.loading("Regenerating your PFP... This may take 10-20 seconds.");

    try {
      const response = await fetch("/api/regenerate-pfp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: pet.id,
          style: selectedStyle,
        }),
      });

      if (response.status === 402 && generationCount >= FREE_LIMIT) {
        toast.error("Payment required. Please complete the $0.10 USDC payment.");
        setRegenerating(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to regenerate PFP");
      }

      const result = await response.json();
      const remaining = result.remainingFreeGenerations;
      
      if (remaining > 0) {
        toast.success(`PFP regenerated! ${remaining} free generation${remaining > 1 ? 's' : ''} remaining.`);
      } else {
        toast.success("PFP regenerated! Future regenerations will cost $0.10 USDC.");
      }
      
      setShowStylePicker(false);
      refetch();
    } catch (err: any) {
      console.error("Regeneration error:", err);
      toast.error(err.message || "Failed to regenerate PFP");
    } finally {
      setRegenerating(false);
    }
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

            {/* Social Sharing */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Button
                onClick={() => {
                  const shareText = pet.nftTokenId
                    ? `Check out my Based NFT PFP "${pet.name}" on @PetsOfBase! 🐾\n\nMinted on @base for just $0.25 USDC.\n\n#PetsOfBase #Based #BaseNFT`
                    : `Just created an AI-generated PFP for ${pet.name} on @PetsOfBase! 🐾✨\n\nJoin the most wholesome community on @base.\n\n#PetsOfBase #Based`;
                  
                  // Add referral code to URL if user is authenticated
                  const baseUrl = window.location.origin + window.location.pathname;
                  const sharePageUrl = referralStats?.referralCode 
                    ? `${baseUrl}?ref=${referralStats.referralCode}`
                    : baseUrl;
                  
                  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(sharePageUrl)}`;
                  window.open(shareUrl, '_blank', 'width=550,height=420');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on 𝕏 (Twitter)
                {referralStats && (
                  <span className="ml-2 text-xs opacity-80">(+1 free gen per signup)</span>
                )}
              </Button>
            </Card>

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
                  <>
                    {/* Regeneration Info */}
                    {pet.generationCount !== undefined && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-800">
                            <strong>{pet.generationCount}/2 free generations used</strong>
                          </span>
                          {pet.generationCount >= 2 && (
                            <span className="text-blue-600 text-xs">
                              Additional: $0.10 USDC each
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Try Different Style Button */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => setShowStylePicker(true)}
                        disabled={regenerating}
                        variant="outline"
                        className="w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Try Style
                        {pet.generationCount !== undefined && pet.generationCount >= 2 && (
                          <span className="ml-2 text-xs">($0.10)</span>
                        )}
                      </Button>
                      
                      {versions && versions.length > 0 && (
                        <Button
                          onClick={() => setShowVersionHistory(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <History className="w-4 h-4 mr-2" />
                          History ({versions.length})
                        </Button>
                      )}
                    </div>

                    <Button
                      asChild
                      className="w-full bg-base-gradient hover:opacity-90"
                    >
                      <Link href={`/mint/${pet.id}`}>Mint as NFT ($0.25 USDC)</Link>
                    </Button>
                  </>
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

      {/* Style Picker Dialog */}
      <Dialog open={showStylePicker} onOpenChange={setShowStylePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Different Style</DialogTitle>
            <DialogDescription>
              Regenerate your pet's PFP with a different artistic style.
            </DialogDescription>
            {pet && (() => {
              const count = pet.generationCount || 0;
              const remaining = Math.max(0, 2 - count);
              return (
                <div className="mt-2 text-sm">
                  <strong className="text-primary">
                    {count}/2 free generations used
                  </strong>
                  {remaining === 0 && (
                    <span className="text-yellow-600 block mt-1">
                      ⚠️ This regeneration will cost $0.10 USDC
                    </span>
                  )}
                </div>
              );
            })()}
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Label>Select Style</Label>
            <RadioGroup value={selectedStyle} onValueChange={setSelectedStyle}>
              {styles?.map((style) => (
                <div key={style.value} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={style.value} id={`detail-${style.value}`} />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={`detail-${style.value}`} className="font-medium cursor-pointer">
                      {style.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStylePicker(false)}
              className="flex-1"
              disabled={regenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              className="flex-1 bg-base-gradient hover:opacity-90"
              disabled={regenerating}
            >
              {regenerating ? "Regenerating..." : "Regenerate PFP"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>PFP Version History</DialogTitle>
            <DialogDescription>
              View all generated versions and select which one to use for your NFT.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {versions?.map((version) => (
              <div
                key={version.id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  version.isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => {
                  if (!version.isSelected) {
                    selectVersionMutation.mutate({
                      versionId: version.id,
                      petId: petId,
                    });
                  }
                }}
              >
                <img
                  src={version.imageUrl}
                  alt={`Version ${version.generationNumber}`}
                  className="w-full aspect-square object-cover"
                />
                
                {/* Selected Badge */}
                {version.isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Selected
                  </div>
                )}
                
                {/* Version Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                  <div className="font-bold">Version #{version.generationNumber}</div>
                  {version.prompt && (
                    <div className="text-white/80 truncate">{version.prompt}</div>
                  )}
                  <div className="text-white/60 text-[10px] mt-1">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Hover Overlay */}
                {!version.isSelected && (
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold transition-opacity">
                      Select This Version
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(!versions || versions.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No version history yet. Generate your first PFP!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
