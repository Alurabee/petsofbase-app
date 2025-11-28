import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function Mint() {
  const { id } = useParams<{ id: string }>();
  const petId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Check if demo mode is active
  useEffect(() => {
    fetch("/api/demo-status")
      .then(res => res.json())
      .then(data => setDemoMode(data.demoMode))
      .catch(() => setDemoMode(false));
  }, []);

  const { data: pet, isLoading } = trpc.pets.getById.useQuery(
    { id: petId },
    { enabled: petId > 0 }
  );

  useEffect(() => {
    if (!petId || petId === 0) {
      setLocation("/my-pets");
    }
  }, [petId, setLocation]);

  const handleMint = async () => {
    if (!user || !pet) return;

    setMinting(true);
    setError(null);
    toast.loading("Preparing to mint your NFT...");

    try {
      // Get user's wallet address from Manus OAuth
      // In a real Base app, this would come from the connected wallet
      const walletAddress = user.email || "0x0000000000000000000000000000000000000000";

      // Call the X402-protected minting endpoint
      const response = await fetch("/api/mint-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId: pet.id,
          walletAddress,
        }),
      });

      if (response.status === 402) {
        // Payment required - X402 will handle this
        const paymentData = await response.json();
        toast.error("Payment required. Please complete the $0.25 USDC payment.");
        setError("Payment required. The Base app will prompt you to pay $0.25 USDC.");
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
        <Card className="p-8 max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            You need to connect your wallet to mint an NFT.
          </p>
          <Button asChild className="bg-base-gradient hover:opacity-90 w-full">
            <a href={getLoginUrl()}>Connect Wallet</a>
          </Button>
        </Card>
      </div>
    );
  }

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
        <Card className="p-8 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold">PFP Not Generated</h2>
          <p className="text-muted-foreground">
            You need to generate a PFP before minting an NFT.
          </p>
          <Button onClick={() => setLocation("/my-pets")} className="bg-base-gradient hover:opacity-90">
            Generate PFP
          </Button>
        </Card>
      </div>
    );
  }

  if (pet.nftTokenId && !mintResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft">
        <Card className="p-8 max-w-md text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Already Minted</h2>
          <p className="text-muted-foreground">
            This pet has already been minted as NFT #{pet.nftTokenId}.
          </p>
          <Button onClick={() => setLocation(`/pet/${pet.id}`)} className="bg-base-gradient hover:opacity-90">
            View Pet Profile
          </Button>
        </Card>
      </div>
    );
  }

  if (mintResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-gradient-soft py-12">
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

          <div className="flex gap-3">
            <Button
              onClick={() => setLocation(`/pet/${pet.id}`)}
              className="flex-1 bg-base-gradient hover:opacity-90"
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
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-gradient-soft py-12">
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
              <p className="text-sm text-yellow-800 font-medium">
                🧪 <strong>Demo Mode Active</strong> - Minting is simulated for testing. No payment required.
              </p>
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
                  {demoMode ? "FREE (Demo)" : "$0.25 USDC"}
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
            <Button
              onClick={handleMint}
              disabled={minting}
              className="w-full bg-base-gradient hover:opacity-90 h-12 text-lg"
            >
              {minting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Minting...
                </>
              ) : demoMode ? (
                "Mint NFT (Demo - Free)"
              ) : (
                "Mint NFT for $0.25 USDC"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {demoMode ? (
                "Demo mode: Minting is simulated for testing. No actual blockchain transaction or payment will occur."
              ) : (
                "By minting, you agree that this NFT will be permanently stored on the Base blockchain. The X402 payment protocol will securely process your $0.25 USDC payment."
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
    </div>
  );
}
