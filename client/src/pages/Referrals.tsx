import { useAuth } from "@/_core/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Copy, Gift, Users, TrendingUp, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Referrals() {
  const { user, isAuthenticated } = useAuth();

  const { data: stats, isLoading } = trpc.referrals.getMyStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: referrals } = trpc.referrals.getMyReferrals.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-gradient-soft flex items-center justify-center">
        <Navigation />
        <Card className="p-8 max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <p className="text-muted-foreground">
            Connect your wallet to access your referral dashboard and start earning rewards.
          </p>
          <Button asChild className="w-full bg-base-gradient btn-primary-hover">
            <a href={getLoginUrl()}>Connect Wallet</a>
          </Button>
        </Card>
      </div>
    );
  }

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}?ref=${stats?.referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied to clipboard!");
  };

  const shareOnTwitter = () => {
    const shareText = `Join me on @PetsOfBase! 🐾✨\n\nTurn your pet into a Based NFT PFP with AI.\n\nMint for just $0.25 USDC on @base.\n\n#PetsOfBase #Based`;
    const referralUrl = `${window.location.origin}?ref=${stats?.referralCode}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="min-h-screen bg-base-gradient-soft">
      <Navigation />
      {/* Header */}
      <div className="bg-card border-b border-primary/20">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Referral Dashboard</h1>
              <p className="text-primary mt-1">
                Invite friends and earn free PFP generations
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/my-pets">My Pets</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-600">Total</Badge>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {stats?.totalReferrals || 0}
            </div>
            <p className="text-sm text-blue-700 mt-1">Successful Referrals</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-600">Pending</Badge>
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {stats?.pendingReferrals || 0}
            </div>
            <p className="text-sm text-purple-700 mt-1">Clicks (Not Signed Up)</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Gift className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-600">Rewards</Badge>
            </div>
            <div className="text-3xl font-bold text-green-900">
              {stats?.freeGenerationsEarned || 0}
            </div>
            <p className="text-sm text-green-700 mt-1">Free Generations Earned</p>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Referral Link</h2>
          <p className="mb-4 opacity-90">
            Share this link to earn 1 free PFP generation for each friend who signs up!
          </p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
            <code className="text-sm break-all">
              {window.location.origin}?ref={stats?.referralCode}
            </code>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={copyReferralLink}
              className="flex-1 bg-white text-blue-600 hover:bg-gray-100"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={shareOnTwitter}
              className="flex-1 bg-white text-purple-600 hover:bg-gray-100"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share on 𝕏
            </Button>
          </div>
        </Card>

        {/* Referral Code Display */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-3">Your Referral Code</h3>
          <div className="flex items-center gap-3">
            <div className="bg-base-gradient-soft px-6 py-3 rounded-lg flex-1">
              <code className="text-2xl font-bold text-primary">
                {stats?.referralCode}
              </code>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(stats?.referralCode || '');
                toast.success("Referral code copied!");
              }}
              variant="outline"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Referral History */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Referral History</h3>
          
          {referrals && referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-base-gradient-soft rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {referral.status === 'completed' || referral.status === 'rewarded'
                        ? `User #${referral.referredUserId} signed up`
                        : 'Link clicked'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(referral.createdAt).toLocaleDateString()} at{' '}
                      {new Date(referral.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge
                    className={
                      referral.status === 'rewarded'
                        ? 'bg-green-500'
                        : referral.status === 'completed'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }
                  >
                    {referral.status === 'rewarded'
                      ? '✓ Rewarded'
                      : referral.status === 'completed'
                      ? 'Completed'
                      : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No referrals yet. Start sharing your link to earn rewards!</p>
            </div>
          )}
        </Card>

        {/* How It Works */}
        <Card className="p-6 mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <h3 className="font-bold text-lg mb-4 text-yellow-900">How Referrals Work</h3>
          <div className="space-y-3 text-yellow-900">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                1
              </div>
              <p>Share your unique referral link with friends</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                2
              </div>
              <p>When they sign up and connect their wallet, you both get rewarded</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                3
              </div>
              <p>Earn 1 free PFP generation for each successful referral</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                4
              </div>
              <p>Use your free generations to create more PFPs without paying!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
