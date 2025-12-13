import { useBaseContext } from "@/_core/hooks/useBaseContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
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
import { AlertCircle, CheckCircle2, Loader2, ExternalLink, Sparkles, History } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useSocialSharing } from "@/hooks/useSocialSharing";
import confetti from "canvas-confetti";
import { useQuickAuth } from "@/_core/hooks/useQuickAuth";

export default function Mint() {
  const { id } = useParams<{ id: string }>();
  const petId = parseInt(id || "0");
  const { farcasterUser } = useBaseContext();
  const isAuthenticated = !!farcasterUser;
  const { shareMint } = useSocialSharing();
  const { authenticate } = useQuickAuth();
  const [, setLocation] = useLocation();
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("pixar");
  const [regenerating, setRegenerating] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Check if demo mode is active
  useEffect(() => {
    fetch("/api/demo-status")
      .then(res => res.json())
      .then(data => setDemoMode(data.demoMode))
      .catch(() => setDemoMode(false));
  }, []);

  const { data: pet, isLoading, refetch } = trpc.pets.getById.useQuery(
    { id: petId },
    { enabled: petId > 0 }
  );
  const { data: styles } = trpc.pets.getStyles.useQuery();
  const { data: versions } = trpc.pfpVersions.getByPetId.useQuery(
    { petId },
    { enabled: petId > 0 }
  );
  const selectVersionMutation = trpc.pfpVersions.selectVersion.useMutation({
    onSuccess: () => {
      refetch();
      setShowVersionHistory(false);
      toast.success("PFP version selected!");
    },
  });

  useEffect(() => {
    if (!petId || petId === 0) {
      setLocation("/my-pets");
    }
  }, [petId, setLocation]);

  const handleRegenerate = async () => {
    if (!pet) return;

    const generationCount = pet.generationCount || 0;
    const FREE_LIMIT = 1;

    setRegenerating(true);
    toast.loading("Regenerating your PFP... This may take 10-20 seconds.");

    try {
      const token = await authenticate();
      // Call the regeneration endpoint (free for first 2, paid for 3+)
      const response = await fetch("/api/regenerate-pfp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: pet.id,
          style: selectedStyle,
        }),
      });

      if (response.status === 402 && generationCount >= FREE_LIMIT) {
        // Payment required for 3rd+ generation
        toast.error("Payment required. Please complete the $0.10 USDC payment.");
        setError("Payment required. You've used your free generation. Additional generations cost $0.10 USDC.");
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
      refetch(); // Refresh pet data to show new PFP
    } catch (err: any) {
      console.error("Regeneration error:", err);
      toast.error(err.message || "Failed to regenerate PFP");
    } finally {
      setRegenerating(false);
    }
  };

  const handleMint = async () => {
    if (!pet) return;
    if (!walletAddress || !walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      toast.error("Please enter a valid wallet address (0x...)");
      return;
    }

    setMinting(true);
    setError(null);
    toast.loading("Preparing to mint your NFT...");

    try {
      const token = await authenticate();

      // Call the X402-protected minting endpoint
      const response = await fetch("/api/mint-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          petId: pet.id,
          walletAddress,
        }),
      });

      if (response.status === 402) {
        // Payment required - X402 will handle this
        const paymentData = await response.json();
        toast.error("Payment required. Please complete the $0.50 USDC payment.");
        setError("Payment required. The Base app will prompt you to pay $0.50 USDC.");
        setMinting(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mint NFT");
      }

      const result = await response.json();
      setMintResult(result);
      toast.success("NFT minted successfully!");
      
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error("Minting error:", err);
      setError(err.message || "Failed to mint NFT");
      toast.error(err.message || "Failed to mint NFT");
    } finally {
      setMinting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Open in Base App</h2>
          <p className="text-muted-foreground">
            Please open this app in the Base app to mint an NFT.
          </p>
          <Button asChild className="bg-base-gradient btn-primary-hover w-full">
            <span className="text-muted-foreground">Open in Base App</span>
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Pet Not Found</h2>
          <p className="text-muted-foreground">
            The pet you're trying to mint doesn't exist.
          </p>
          <Button onClick={() => setLocation("/my-pets")} variant="outline">
            Back to My Pets
          </Button>
        </Card>
      </div>
    );
  }

  if (!pet.pfpImageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold">PFP Not Generated</h2>
          <p className="text-muted-foreground">
            You need to generate a PFP before minting an NFT.
          </p>
          <Button onClick={() => setLocation("/my-pets")} className="bg-base-gradient btn-primary-hover">
            Generate PFP
          </Button>
        </Card>
      </div>
    );
  }

  if (pet.nftTokenId && !mintResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Already Minted</h2>
          <p className="text-muted-foreground">
            This pet has already been minted as NFT #{pet.nftTokenId}.
          </p>
          <Button onClick={() => setLocation(`/pet/${pet.id}`)} className="bg-base-gradient btn-primary-hover">
            View Pet Profile
          </Button>
        </Card>
      </div>
    );
  }

  if (mintResult) {
    return (
      <div className="min-h-screen bg-base-gradient-soft">
        <Navigation />
        <div className="flex items-center justify-center py-12 pt-24">
        <Card className="p-8 max-w-2xl space-y-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold">NFT Minted Successfully! 🎉</h2>
            <p className="text-muted-foreground">
              Your pet has been immortalized on the Base blockchain.
            </p>
          </div>

          <div className="space-y-4">
            <img
              src={pet.pfpImageUrl}
              alt={pet.name}
              className="w-full aspect-square object-cover rounded-lg pet-card-border"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Token ID:</span>
                <p className="font-bold">#{mintResult.tokenId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contract:</span>
                <p className="font-mono text-xs truncate">{mintResult.contractAddress}</p>
              </div>
            </div>

            {mintResult.transactionHash && (
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">Transaction Hash:</span>
                  <a
                    href={`https://basescan.org/tx/${mintResult.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View on BaseScan
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => shareMint(pet.name, pet.id.toString(), pet.pfpImageUrl!)}
              className="w-full bg-base-gradient btn-primary-hover text-lg py-6"
              size="lg"
            >
              🎉 Share to Feed
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={() => setLocation(`/pet/${pet.id}`)}
                className="flex-1"
                variant="outline"
              >
                View Pet Profile
              </Button>
              <Button
                onClick={() => setLocation("/my-pets")}
                variant="outline"
                className="flex-1"
              >
                Back to My Pets
              </Button>
            </div>
          </div>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-gradient-soft py-12">
      <Navigation />
      <div className="container max-w-2xl">
        <Card className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Mint Your Pet NFT</h1>
            <p className="text-muted-foreground">
              Turn {pet.name} into a permanent NFT on the Base blockchain
            </p>
          </div>

          <div className="space-y-4">
            <img
              src={pet.pfpImageUrl}
              alt={pet.name}
              className="w-full aspect-square object-cover rounded-lg pet-card-border"
            />

            <div className="space-y-2">
              <h3 className="text-xl font-bold">{pet.name}</h3>
              <p className="text-muted-foreground">
                {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
              </p>
              {pet.personality && (
                <p className="text-sm text-muted-foreground">{pet.personality}</p>
              )}
            </div>
          </div>

          {demoMode && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="text-sm text-yellow-800 font-medium">
                🧪 <strong>Demo Mode Active</strong> - Minting is simulated for testing. No payment required.
              </div>
            </div>
          )}

          <div className="bg-base-gradient-soft p-4 rounded-lg space-y-3">
            <h4 className="font-bold">Minting Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">Base</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Standard:</span>
                <span className="font-medium">ERC-721</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minting Fee:</span>
                <span className="font-bold text-primary">
                  {demoMode ? "FREE (Demo)" : "$0.50 USDC"}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet address to receive the NFT</Label>
              <Input
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                This should be your Base/Ethereum wallet address. It will own the minted NFT.
              </p>
            </div>

            {/* Regeneration Info */}
            {pet.generationCount !== undefined && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                          <span className="text-blue-800">
                            <strong>{pet.generationCount}/1 free generation used</strong>
                          </span>
                          {pet.generationCount >= 1 && (
                    <span className="text-blue-600 text-xs">
                      Additional: $0.10 USDC each
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Version History Button */}
            {versions && versions.length > 1 && (
              <Button
                onClick={() => setShowVersionHistory(true)}
                disabled={regenerating || minting}
                variant="outline"
                className="w-full"
              >
                <History className="w-4 h-4 mr-2" />
                View All Versions ({versions.length})
              </Button>
            )}

            {/* Try Different Style Button */}
            <Button
              onClick={() => setShowStylePicker(true)}
              disabled={regenerating || minting}
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
              onClick={handleMint}
              disabled={minting || regenerating}
              className="w-full bg-base-gradient btn-primary-hover h-12 text-lg"
            >
              {minting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Minting...
                </>
              ) : demoMode ? (
                "Mint NFT (Demo - Free)"
              ) : (
                "Mint NFT for $0.50 USDC"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {demoMode ? (
                "Demo mode: Minting is simulated for testing. No actual blockchain transaction or payment will occur."
              ) : (
                "By minting, you agree that this NFT will be permanently stored on the Base blockchain. The X402 payment protocol will securely process your $0.50 USDC payment."
              )}
            </p>
          </div>

          <Button
            onClick={() => setLocation("/my-pets")}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </Card>
      </div>

      {/* Style Picker Dialog */}
      <Dialog open={showStylePicker} onOpenChange={setShowStylePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Different Style</DialogTitle>
            <DialogDescription>
              Regenerate your pet's PFP with a different artistic style.
              {pet && (() => {
                const count = pet.generationCount || 0;
                const remaining = Math.max(0, 1 - count);
                return (
                  <div className="mt-2">
                    <strong className="text-primary">
                      {count}/1 free generation used
                    </strong>
                    {remaining === 0 && (
                      <span className="text-yellow-600 block mt-1">
                        ⚠️ This regeneration will cost $0.10 USDC
                      </span>
                    )}
                  </div>
                );
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Label>Select Style</Label>
            <RadioGroup value={selectedStyle} onValueChange={setSelectedStyle}>
              {styles?.map((style) => (
                <div key={style.value} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={style.value} id={`mint-${style.value}`} />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={`mint-${style.value}`} className="font-medium cursor-pointer">
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
              className="flex-1 bg-base-gradient btn-primary-hover"
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
              View all generated versions and select which one to mint as an NFT.
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
                    selectVersionMutation.mutate({ versionId: version.id, petId });
                  }
                }}
              >
                <img
                  src={version.imageUrl}
                  alt={`Version ${version.generationNumber}`}
                  className="w-full aspect-square object-cover"
                />
                
                {version.isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold">
                    Selected
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-medium">
                    Version {version.generationNumber}
                  </p>
                  <p className="text-white/80 text-xs truncate">
                    {version.prompt}
                  </p>
                </div>
                
                {!version.isSelected && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm">
                      Select This Version
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowVersionHistory(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
