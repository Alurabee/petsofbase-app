import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Heart, Sparkles, Trophy, Upload } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: leaderboard, isLoading } = trpc.pets.leaderboard.useQuery({ limit: 3 });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-base-gradient flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-2xl font-bold text-base-gradient">PetsOfBase</span>
            </a>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/leaderboard">
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Leaderboard
              </a>
            </Link>
            <Link href="/gallery">
              <a className="text-sm font-medium hover:text-primary transition-colors">
                Gallery
              </a>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/my-pets">
                  <a className="text-sm font-medium hover:text-primary transition-colors">
                    My Pets
                  </a>
                </Link>
                <Link href="/upload">
                  <Button className="bg-base-gradient hover:opacity-90">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Pet
                  </Button>
                </Link>
              </>
            ) : (
              <Button asChild className="bg-base-gradient hover:opacity-90">
                <a href={getLoginUrl()}>Connect Wallet</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-base-gradient-soft">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Built on Base</span>
            </div>
            
            <h1 className="text-6xl font-bold leading-tight">
              Turn Your Pet Into a{" "}
              <span className="text-base-gradient">Based NFT PFP</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the most wholesome community on Base. Upload your pet, mint a unique AI-generated PFP, 
              and compete on the Cuteness Leaderboard. All for just 0.25 USDC.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-base-gradient hover:opacity-90 text-lg px-8 py-6">
                  <Link href="/upload">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Your Pet
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-base-gradient hover:opacity-90 text-lg px-8 py-6">
                  <a href={getLoginUrl()}>
                    Get Started
                  </a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                <Link href="/leaderboard">
                  <Trophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">Why PetsOfBase?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-base-gradient-soft flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered PFPs</h3>
              <p className="text-muted-foreground">
                Generate stunning, Pixar-style portraits of your pet with cutting-edge AI. 
                Multiple styles to choose from.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-base-gradient-soft flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Cuteness Leaderboard</h3>
              <p className="text-muted-foreground">
                Vote for your favorite pets and climb the ranks. The cutest pets get featured 
                and earn community recognition.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-base-gradient-soft flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Based Community</h3>
              <p className="text-muted-foreground">
                Connect with fellow pet lovers on Base. Share, vote, and celebrate the pets 
                that make our lives better.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 bg-base-gradient-soft">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold">Top Pets</h2>
            <Button asChild variant="outline">
              <Link href="/leaderboard">View Full Leaderboard</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {leaderboard.map((pet, index) => (
                <Card key={pet.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={pet.pfpImageUrl || pet.originalImageUrl}
                      alt={pet.name}
                      className="w-full aspect-square object-cover rounded-lg pet-card-border"
                    />
                    <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-base-gradient flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">{pet.species} • {pet.breed || "Mixed"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      <span className="font-medium">{pet.voteCount} votes</span>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/pet/${pet.id}`}>View</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pets yet. Be the first to upload!</p>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Get Based?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of pet lovers on Base. Upload your pet, mint your NFT, and start earning votes today.
          </p>
          {isAuthenticated ? (
            <Button asChild size="lg" className="bg-base-gradient hover:opacity-90 text-lg px-8 py-6">
              <Link href="/upload">
                <Upload className="w-5 h-5 mr-2" />
                Upload Your Pet Now
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-base-gradient hover:opacity-90 text-lg px-8 py-6">
              <a href={getLoginUrl()}>
                Connect Wallet to Start
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built with ❤️ on Base • Powered by X402 • © 2024 PetsOfBase</p>
        </div>
      </footer>
    </div>
  );
}
