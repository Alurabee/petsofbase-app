import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Heart, Menu, Sparkles, Trophy, Upload, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: leaderboard, isLoading } = trpc.pets.leaderboard.useQuery({ limit: 3 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const styles = [
    { name: "Pixar Style", description: "3D animated with vibrant colors", emoji: "🎬" },
    { name: "Cartoon", description: "Cute illustration with bold outlines", emoji: "🎨" },
    { name: "Realistic", description: "Photorealistic portrait with detailed textures", emoji: "📸" },
    { name: "Anime", description: "Stylized with large expressive eyes", emoji: "✨" },
    { name: "Watercolor", description: "Soft artistic painting with gentle colors", emoji: "🖌️" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-white-bg.png" alt="PetsOfBase" className="w-10 h-10" />
            <span className="text-xl md:text-2xl font-bold text-base-gradient">PetsOfBase</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
              Leaderboard
            </Link>
            <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
              Gallery
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/my-pets" className="text-sm font-medium hover:text-primary transition-colors">
                  My Pets
                </Link>
                <Button asChild className="bg-base-gradient hover:opacity-90">
                  <Link href="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Pet
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild className="bg-base-gradient hover:opacity-90">
                <a href={getLoginUrl()}>Connect Wallet</a>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
            <div className="container py-4 flex flex-col gap-4">
              <Link 
                href="/leaderboard" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <Link 
                href="/gallery" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/my-pets" 
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Pets
                  </Link>
                  <Button asChild className="bg-base-gradient hover:opacity-90 w-full">
                    <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Pet
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="bg-base-gradient hover:opacity-90 w-full">
                  <a href={getLoginUrl()}>Connect Wallet</a>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Before/After */}
      <section className="relative overflow-hidden bg-base-gradient-soft">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container py-20 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-12">
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
            </div>

            {/* Before/After Showcase */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <Card className="p-6 space-y-4">
                <div className="text-center">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Before</span>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src="/examples/dog-before.jpg" 
                    alt="Original pet photo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">Your adorable pet photo</p>
              </Card>

              <Card className="p-6 space-y-4 border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-base-gradient text-white text-xs font-bold rounded-full">
                  ✨ AI MAGIC
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-primary uppercase tracking-wide">After</span>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden ring-4 ring-primary/20">
                  <img 
                    src="/examples/dog-after-pixar.jpg" 
                    alt="Pixar-style PFP" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm font-medium text-primary">Your Based NFT PFP 🎬</p>
              </Card>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/upload">
                  <Button size="lg" className="bg-base-gradient hover:opacity-90 text-lg px-8 py-6">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Your Pet
                  </Button>
                </Link>
              ) : (
                <Button asChild size="lg" className="bg-base-gradient hover:opacity-90 text-lg px-8 py-6">
                  <a href={getLoginUrl()}>
                    Get Started
                  </a>
                </Button>
              )}
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Trophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Style Showcase Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold">Choose Your Style</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your pet into 5 different artistic styles. Each generation preserves your pet's unique features and personality.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {styles.map((style) => (
              <Card key={style.name} className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
                <div className="text-4xl">{style.emoji}</div>
                <h3 className="font-bold text-lg">{style.name}</h3>
                <p className="text-sm text-muted-foreground">{style.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">
              <strong className="text-primary">2 free generations</strong> per pet, then $0.10 USDC per additional style
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-gradient-soft">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-base-gradient mx-auto flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">AI-Powered</h3>
              <p className="text-muted-foreground">
                Advanced AI transforms your pet while preserving their unique features, colors, and personality.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-base-gradient mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Compete & Win</h3>
              <p className="text-muted-foreground">
                Vote on the cutest pets and climb the leaderboard. Build your reputation in the Based pet community.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-base-gradient mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-bold">Own Your PFP</h3>
              <p className="text-muted-foreground">
                Mint your favorite PFP as an NFT on Base for just $0.25 USDC. True ownership, forever.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {leaderboard && leaderboard.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">Cuteness Leaderboard</h2>
                <p className="text-xl text-muted-foreground">
                  The most loved pets in the Based community
                </p>
              </div>
              <Link href="/leaderboard">
                <Button variant="outline" size="lg">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {leaderboard.map((pet, index) => (
                <Link key={pet.id} href={`/pet/${pet.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="aspect-square relative">
                      <img
                        src={pet.pfpImageUrl || pet.originalImageUrl}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-base-gradient flex items-center justify-center text-white font-bold text-xl">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{pet.name}</h3>
                      <p className="text-muted-foreground mb-4">
                        {pet.species} • {pet.breed}
                      </p>
                      <div className="flex items-center gap-2 text-primary">
                        <Heart className="w-5 h-5 fill-primary" />
                        <span className="font-bold">{pet.voteCount} votes</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-base-gradient text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-5xl font-bold">Ready to Join the Based Pet Community?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Upload your pet, generate an adorable AI PFP, and compete for the #1 spot on the leaderboard.
          </p>
          {isAuthenticated ? (
            <Link href="/upload">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Upload className="w-5 h-5 mr-2" />
                Upload Your Pet Now
              </Button>
            </Link>
          ) : (
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <a href={getLoginUrl()}>
                Get Started
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built with ❤️ on Base • PetsOfBase © 2025</p>
        </div>
      </footer>
    </div>
  );
}
