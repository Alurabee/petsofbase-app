import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Heart, Sparkles, Trophy, Upload, Zap } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import PetOfTheDay from "@/components/PetOfTheDay";
import LiveActivityFeed from "@/components/LiveActivityFeed";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: leaderboard, isLoading } = trpc.pets.leaderboard.useQuery({ limit: 3 });

  const styles = [
    { name: "Pixar Style", description: "3D animated with vibrant colors", emoji: "🎬" },
    { name: "Cartoon", description: "Cute illustration with bold outlines", emoji: "🎨" },
    { name: "Realistic", description: "Photorealistic portrait with detailed textures", emoji: "📸" },
    { name: "Anime", description: "Stylized with large expressive eyes", emoji: "✨" },
    { name: "Watercolor", description: "Soft artistic painting with gentle colors", emoji: "🖌️" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section with Before/After */}
      <section className="relative overflow-hidden bg-vibrant-mesh min-h-[85vh] flex items-center">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 dot-pattern" />
        
        {/* Pet Silhouettes - Floating Background (6 total) */}
        <svg className="pet-silhouette pet-silhouette-1" viewBox="0 0 100 100" fill="white">
          <path d="M50 20c-8 0-15 5-18 12-5-3-11-2-14 3s-2 11 3 14c-3 8 0 17 8 21 8 4 17 2 23-4 6 6 15 8 23 4 8-4 11-13 8-21 5-3 6-9 3-14s-9-6-14-3c-3-7-10-12-18-12zm0 15c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z"/>
        </svg>
        <svg className="pet-silhouette pet-silhouette-2" viewBox="0 0 100 100" fill="white">
          <path d="M30 25c-5 0-9 4-9 9 0 3 1 5 3 7-6 3-10 9-10 16v20c0 8 6 14 14 14h44c8 0 14-6 14-14V57c0-7-4-13-10-16 2-2 3-4 3-7 0-5-4-9-9-9-3 0-6 2-8 4-3-5-8-8-14-8s-11 3-14 8c-2-2-5-4-8-4zm18 20c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5zm14 0c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z"/>
        </svg>
        <svg className="pet-silhouette pet-silhouette-3" viewBox="0 0 100 100" fill="white">
          <path d="M50 15c-6 0-11 3-14 7-4-2-9-1-12 2s-3 8-1 12c-4 5-4 12 0 17 2 3 5 5 9 5 1 6 6 11 12 11s11-5 12-11c4 0 7-2 9-5 4-5 4-12 0-17 2-4 2-9-1-12s-8-4-12-2c-3-4-8-7-14-7zm0 20c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z"/>
        </svg>
        <svg className="pet-silhouette pet-silhouette-4" viewBox="0 0 100 100" fill="white">
          <path d="M50 20c-8 0-15 5-18 12-5-3-11-2-14 3s-2 11 3 14c-3 8 0 17 8 21 8 4 17 2 23-4 6 6 15 8 23 4 8-4 11-13 8-21 5-3 6-9 3-14s-9-6-14-3c-3-7-10-12-18-12zm0 15c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z"/>
        </svg>
        <svg className="pet-silhouette pet-silhouette-5" viewBox="0 0 100 100" fill="white">
          <path d="M30 25c-5 0-9 4-9 9 0 3 1 5 3 7-6 3-10 9-10 16v20c0 8 6 14 14 14h44c8 0 14-6 14-14V57c0-7-4-13-10-16 2-2 3-4 3-7 0-5-4-9-9-9-3 0-6 2-8 4-3-5-8-8-14-8s-11 3-14 8c-2-2-5-4-8-4zm18 20c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5zm14 0c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z"/>
        </svg>
        <svg className="pet-silhouette pet-silhouette-6" viewBox="0 0 100 100" fill="white">
          <path d="M50 15c-6 0-11 3-14 7-4-2-9-1-12 2s-3 8-1 12c-4 5-4 12 0 17 2 3 5 5 9 5 1 6 6 11 12 11s11-5 12-11c4 0 7-2 9-5 4-5 4-12 0-17 2-4 2-9-1-12s-8-4-12-2c-3-4-8-7-14-7zm0 20c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7z"/>
        </svg>
        
        {/* Waveform at Bottom - Multiple Layers */}
        <div className="waveform-pattern">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z" fill="rgba(255,107,107,0.15)" />
            <path d="M0,70 C200,100 400,40 600,70 C800,100 1000,40 1200,70 L1200,120 L0,120 Z" fill="rgba(255,217,61,0.15)" />
            <path d="M0,90 C250,110 450,70 600,90 C750,110 950,70 1200,90 L1200,120 L0,120 Z" fill="rgba(167,139,250,0.15)" />
          </svg>
        </div>
        
        <div className="container py-16 pb-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white shadow-lg mb-4">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="font-bold text-sm text-gray-900">🔥 Most Based Pet App on Base</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white drop-shadow-lg">
                Turn Your Pet Into a{" "}
                <span className="inline-block bg-white text-primary px-4 py-2 rounded-xl animate-pulse-glow">Based NFT PFP</span>
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium drop-shadow">
                Join the most wholesome community on Base. Upload your pet, mint a unique AI-generated PFP, 
                and compete on the Cuteness Leaderboard. <span className="font-bold text-white bg-black/20 px-2 py-1 rounded">All for just 0.25 USDC.</span>
              </p>
              
              {/* Primary CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                {isAuthenticated ? (
                  <Link href="/upload">
                    <Button size="lg" className="cta-based bg-base-gradient hover:opacity-90 w-full sm:w-auto animate-bounce-gentle">
                      <Upload className="w-5 h-5 mr-2" />
                      LFG! Upload Pet
                    </Button>
                  </Link>
                ) : (
                  <Button asChild size="lg" className="cta-based bg-base-gradient hover:opacity-90 w-full sm:w-auto animate-bounce-gentle">
                    <a href={getLoginUrl()}>
                      <Zap className="w-5 h-5 mr-2" />
                      Get Based Now
                    </a>
                  </Button>
                )}
                <Link href="/leaderboard">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto border-2 hover:bg-pet-purple/10 hover:border-pet-purple transition-all">
                    <Trophy className="w-5 h-5 mr-2" />
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Before/After Showcase */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <div className="glass-card p-6 space-y-4 rounded-2xl">
                <div className="text-center">
                  <span className="text-sm font-medium text-white/60 uppercase tracking-wide">Before</span>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src="/examples/dog-before.jpg" 
                    alt="Original pet photo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm text-white/60">Your adorable pet photo</p>
              </div>

              <div className="glass-strong p-6 space-y-4 rounded-2xl border-2 border-pet-yellow relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-sticker badge-yellow">
                  ✨ AI MAGIC
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-pet-yellow uppercase tracking-wide">After</span>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden ring-4 ring-pet-yellow/30">
                  <img 
                    src="/examples/dog-after-pixar.jpg" 
                    alt="Pixar-style PFP" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm font-medium text-white">Your Based NFT PFP 🎬</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pet of the Day Section */}
      <section className="py-16 bg-vibrant-radial relative">
        <div className="absolute inset-0 dot-pattern" />
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto">
            <PetOfTheDay />
          </div>
        </div>
      </section>

      {/* Style Showcase Section */}
      <section className="py-16 bg-vibrant-gradient relative">
        <div className="absolute inset-0 dot-pattern" />
        <div className="waveform-top">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,0 L0,0 Z" fill="rgba(0,26,77,1)" />
          </svg>
        </div>
        <div className="container relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-white">Choose Your Style</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Transform your pet into 5 different artistic styles. Each generation preserves your pet's unique features and personality.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {styles.map((style, index) => (
              <div key={style.name} className="glass-card p-6 text-center space-y-3 rounded-2xl hover:glass-strong transition-all hover:scale-105 hover:-rotate-2" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-5xl animate-float">{style.emoji}</div>
                <h3 className="font-bold text-lg text-white">{style.name}</h3>
                <p className="text-sm text-white/60">{style.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-white/70 mb-4">
              <strong className="text-pet-yellow">2 free generations</strong> per pet, then $0.10 USDC per additional style
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-vibrant-mesh relative">
        <div className="absolute inset-0 dot-pattern" />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-8 text-center space-y-4 rounded-2xl hover:glass-strong transition-all hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-base-gradient mx-auto flex items-center justify-center animate-pulse-glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="badge-sticker badge-yellow mx-auto">✨ AI Magic</div>
              <h3 className="text-2xl font-bold text-white">AI-Powered</h3>
              <p className="text-white/70">
                Advanced AI transforms your pet while preserving their unique features, colors, and personality.
              </p>
            </div>

            <div className="glass-card p-8 text-center space-y-4 rounded-2xl hover:glass-strong transition-all hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-base-gradient mx-auto flex items-center justify-center animate-pulse-glow">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="badge-sticker badge-coral mx-auto">🏆 Compete</div>
              <h3 className="text-2xl font-bold text-white">Compete & Win</h3>
              <p className="text-white/70">
                Vote on the cutest pets and climb the leaderboard. Build your reputation in the Based pet community.
              </p>
            </div>

            <div className="glass-card p-8 text-center space-y-4 rounded-2xl hover:glass-strong transition-all hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-base-gradient mx-auto flex items-center justify-center animate-pulse-glow">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <div className="badge-sticker badge-purple mx-auto">💎 Own It</div>
              <h3 className="text-2xl font-bold text-white">Own Your PFP</h3>
              <p className="text-white/70">
                Mint your favorite PFP as an NFT on Base for just $0.25 USDC. True ownership, forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <LiveActivityFeed />
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {leaderboard && leaderboard.length > 0 && (
        <section className="py-20 bg-base-gradient-soft">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">Cuteness Leaderboard</h2>
                <p className="text-xl text-muted-foreground">
                  The most loved pets in the Based community
                </p>
                {leaderboard && leaderboard.length < 10 && (
                  <p className="text-sm text-orange-600 font-semibold mt-2">
                    🔥 Only {10 - leaderboard.length} spots left in today's Top 10!
                  </p>
                )}
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
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              Built with <Heart className="w-4 h-4 fill-primary text-primary" /> on Base • PetsOfBase © 2025
            </p>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/leaderboard" className="hover:text-primary transition-colors">
                Leaderboard
              </Link>
              <Link href="/gallery" className="hover:text-primary transition-colors">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
