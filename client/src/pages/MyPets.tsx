import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Heart, Sparkles, Upload as UploadIcon, History } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useSocialSharing } from "@/hooks/useSocialSharing";
import { BadgeList } from "@/components/Badge";

// Component to display badges for a pet
function PetBadges({ petId }: { petId: number }) {
  const { data: badges } = trpc.badges.getPetBadges.useQuery({ petId });
  
  if (!badges || badges.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2">
      <BadgeList badges={badges} maxDisplay={3} size="sm" />
    </div>
  );
}

export default function MyPets() {
  const { user, isAuthenticated } = useAuth();
  const { shareGeneration, challengeFriend } = useSocialSharing();
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("pixar");
  const [generating, setGenerating] = useState(false);
  const [viewingVersions, setViewingVersions] = useState<number | null>(null);

  const { data: pets, isLoading, refetch } = trpc.pets.myPets.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: styles } = trpc.pets.getStyles.useQuery();
  const generatePFP = trpc.pets.generatePFP.useMutation();
  const { data: versions } = trpc.pfpVersions.getByPetId.useQuery(
    { petId: viewingVersions! },
    { enabled: viewingVersions !== null }
  );
  const utils = trpc.useUtils();
  const selectVersionMutation = trpc.pfpVersions.selectVersion.useMutation({
    onSuccess: () => {
      // Invalidate both pets and versions queries to refresh UI
      utils.pets.myPets.invalidate();
      utils.pfpVersions.getByPetId.invalidate();
      toast.success("PFP version selected!");
      // Close dialog after selection
      setViewingVersions(null);
    },
  });

  const handleGeneratePFP = async (petId: number) => {
    setGenerating(true);
    toast.loading("Generating your PFP... This may take 10-20 seconds.");

    try {
      const result = await generatePFP.mutateAsync({
        petId,
        style: selectedStyle as any,
      });

      const remaining = result.remainingFreeGenerations;
      if (remaining > 0) {
        toast.success(`PFP generated! ${remaining} free generation${remaining > 1 ? 's' : ''} remaining.`);
      } else {
        toast.success("PFP generated! Future generations will cost $0.10 USDC.");
      }
      
      // Find the pet to get its details for sharing
      const pet = pets?.find(p => p.id === petId);
      if (pet && result.pfpImageUrl) {
        // Show share prompt
        toast.success(
          <div className="flex flex-col gap-2">
            <p>PFP generated! Share it with your friends?</p>
            <Button
              size="sm"
              onClick={() => shareGeneration(pet.name, pet.id.toString(), result.pfpImageUrl!)}
              className="bg-base-gradient btn-primary-hover"
            >
              Share to Feed 🎉
            </Button>
          </div>,
          { duration: 10000 }
        );
      }
      
      setSelectedPet(null);
      refetch();
    } catch (error: any) {
      if (error.message?.includes("Generation limit reached")) {
        toast.error("You've used your free generation. Additional generations cost $0.10 USDC.");
      } else {
        toast.error(error.message || "Failed to generate PFP");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            You need to connect your wallet to view your pets.
          </p>
          <Button asChild className="bg-base-gradient btn-primary-hover w-full">
            <a href={getLoginUrl()}>Connect Wallet</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-gradient-soft">
      <Navigation />
      {/* Header */}
      <div className="bg-card border-b border-primary/20">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Pets</h1>
              <p className="text-primary">
                Manage your pets and generate AI-powered PFPs
              </p>
            </div>
            <Button asChild className="bg-base-gradient btn-primary-hover">
              <Link href="/upload">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload New Pet
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="container py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : pets && pets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Card key={pet.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={pet.pfpImageUrl || pet.originalImageUrl}
                    alt={pet.name}
                    className="w-full aspect-square object-cover rounded-lg pet-card-border"
                  />
                  {!pet.pfpImageUrl && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium">Original Photo</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
                  </p>
                  {pet.personality && (
                    <p className="text-sm text-muted-foreground mt-1">{pet.personality}</p>
                  )}
                  <PetBadges petId={pet.id} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{pet.voteCount} votes</span>
                  </div>
                  {pet.nftTokenId && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      NFT #{pet.nftTokenId}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {!pet.pfpImageUrl ? (
                    <Button
                      onClick={() => setSelectedPet(pet.id)}
                      className="w-full bg-base-gradient btn-primary-hover"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Choose Style
                    </Button>
                  ) : !pet.nftTokenId ? (
                    <>
                      {/* Generation Counter */}
                      {pet.generationCount !== undefined && (
                        <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-center">
                          <strong className="text-blue-800">
                            {pet.generationCount}/1 free generation used
                          </strong>
                          {pet.generationCount >= 1 && (
                            <span className="text-blue-600 block mt-0.5">
                              Additional: $0.10 USDC each
                            </span>
                          )}
                        </div>
                      )}

                      {/* View All Generations Button */}
                      {pet.generationCount && pet.generationCount > 0 && (
                        <Button
                          onClick={() => setViewingVersions(pet.id)}
                          variant="outline"
                          className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <History className="w-4 h-4 mr-2" />
                          View All Generations ({pet.generationCount})
                        </Button>
                      )}

                      {/* Try Different Style Button */}
                      <Button
                        onClick={() => setSelectedPet(pet.id)}
                        variant="outline"
                        className="w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Try Different Style
                        {pet.generationCount !== undefined && pet.generationCount >= 2 && (
                          <span className="ml-2 text-xs">($0.10 USDC)</span>
                        )}
                      </Button>

                      {/* Mint Button */}
                      <Button
                        asChild
                        className="w-full bg-base-gradient btn-primary-hover"
                      >
                        <Link href={`/mint/${pet.id}`}>Mint as NFT ($0.50 USDC)</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/pet/${pet.id}`}>View Profile</Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <UploadIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Pets Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first pet to get started!
            </p>
            <Button asChild className="bg-base-gradient btn-primary-hover">
              <Link href="/upload">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Your Pet
              </Link>
            </Button>
          </Card>
        )}
      </div>

      {/* Generate PFP Dialog */}
      <Dialog open={selectedPet !== null} onOpenChange={() => setSelectedPet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI PFP</DialogTitle>
            <DialogDescription>
              Choose a style for your pet's AI-generated profile picture. This will take 10-20 seconds.
            </DialogDescription>
            {selectedPet && pets && (() => {
              const pet = pets.find(p => p.id === selectedPet);
              const count = pet?.generationCount || 0;
              const remaining = Math.max(0, 1 - count);
              return (
                <div className="mt-2 text-sm">
                  <strong className="text-primary">
                    {count}/1 free generation used
                  </strong>
                  {remaining === 0 && (
                    <span className="text-yellow-600 block mt-1">
                      ⚠️ Additional generations cost $0.10 USDC each
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
                  <RadioGroupItem value={style.value} id={style.value} />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={style.value} className="font-medium cursor-pointer">
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
              onClick={() => setSelectedPet(null)}
              className="flex-1"
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedPet && handleGeneratePFP(selectedPet)}
              className="flex-1 bg-base-gradient btn-primary-hover"
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate PFP"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View All Generations Dialog */}
      <Dialog open={viewingVersions !== null} onOpenChange={() => setViewingVersions(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Generated PFP Versions</DialogTitle>
            <DialogDescription>
              Select a version to use for minting. The active version is highlighted.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {versions?.map((version) => (
              <div
                key={version.id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  version.isSelected
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => {
                  if (!version.isSelected) {
                    selectVersionMutation.mutate({
                      petId: viewingVersions!,
                      versionId: version.id,
                    });
                  }
                }}
              >
                <img
                  src={version.imageUrl}
                  alt={`Version ${version.generationNumber}`}
                  className="w-full aspect-square object-cover"
                />
                
                {version.isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    ✓ ACTIVE
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-medium">
                    Generation #{version.generationNumber}
                  </p>
                  <p className="text-white/80 text-xs truncate">
                    {version.prompt}
                  </p>
                </div>
                
                {!version.isSelected && (
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-opacity">
                      Select This
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setViewingVersions(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
