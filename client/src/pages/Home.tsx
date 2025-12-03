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
        
        {/* Pet Silhouettes - Floating Background (6 total) - Proper cat/dog shapes */}
        {/* Sitting Cat */}
        <svg className="pet-silhouette pet-silhouette-1" viewBox="0 0 200 200" fill="white" opacity="0.08">
          <path d="M100 40 L85 25 L80 35 L75 25 L70 40 L65 45 Q60 50 60 60 L60 120 Q60 140 70 150 L70 180 L90 180 L90 150 Q95 145 100 145 Q105 145 110 150 L110 180 L130 180 L130 150 Q140 140 140 120 L140 60 Q140 50 135 45 L130 40 L125 25 L120 35 L115 25 Z M80 70 Q82 68 85 70 Q87 72 85 75 Q83 77 80 75 Q78 73 80 70 Z M120 70 Q122 68 125 70 Q127 72 125 75 Q123 77 120 75 Q118 73 120 70 Z"/>
        </svg>
        {/* Playful Dog */}
        <svg className="pet-silhouette pet-silhouette-2" viewBox="0 0 200 200" fill="white" opacity="0.08">
          <path d="M60 50 Q50 45 45 55 L40 70 Q35 75 40 80 L50 85 Q55 90 60 95 L65 100 Q70 110 75 115 L80 130 L75 160 L85 160 L90 135 L100 140 L110 135 L115 160 L125 160 L120 130 L125 115 Q130 110 135 100 L140 95 Q145 90 150 85 L160 80 Q165 75 160 70 L155 55 Q150 45 140 50 L130 60 Q120 65 110 65 L90 65 Q80 65 70 60 Z"/>
        </svg>
        {/* Fluffy Cat Lying Down */}
        <svg className="pet-silhouette pet-silhouette-3" viewBox="0 0 200 200" fill="white" opacity="0.08">
          <path d="M40 100 Q35 95 35 90 L38 80 L45 75 Q50 70 55 70 L60 65 Q65 60 70 60 L75 55 Q80 50 85 52 L90 55 Q95 58 100 58 Q105 58 110 55 L115 52 Q120 50 125 55 L130 60 Q135 60 140 65 L145 70 Q150 70 155 75 L162 80 L165 90 Q165 95 160 100 L155 110 Q150 120 145 125 L140 130 Q130 135 120 135 L80 135 Q70 135 60 130 L55 125 Q50 120 45 110 Z M180 110 Q185 105 185 100 Q185 95 180 95 L170 100 Q165 105 165 110 L170 115 Q175 115 180 110 Z"/>
        </svg>
        {/* Peeking Cat */}
        <svg className="pet-silhouette pet-silhouette-4" viewBox="0 0 200 200" fill="white" opacity="0.08">
          <path d="M120 60 L110 45 L105 50 L100 45 L95 60 L90 70 Q85 80 85 90 L85 130 Q85 145 95 155 L95 180 L105 180 L105 155 Q115 145 115 130 L115 90 Q115 80 110 70 Z M95 95 Q93 93 95 90 Q97 88 100 90 Q102 92 100 95 Q98 97 95 95 Z M105 95 Q103 93 105 90 Q107 88 110 90 Q112 92 110 95 Q108 97 105 95 Z"/>
        </svg>
        {/* Sitting Dog */}
        <svg className="pet-silhouette pet-silhouette-5" viewBox="0 0 200 200" fill="white" opacity="0.08">
          <path d="M70 50 Q60 48 55 55 L50 65 Q48 70 50 75 L55 80 Q60 85 65 90 L70 100 Q72 110 75 120 L75 150 L70 180 L85 180 L90 150 L100 155 L110 150 L115 180 L130 180 L125 150 L125 120 Q128 110 130 100 L135 90 Q140 85 145 80 L150 75 Q152 70 150 65 L145 55 Q140 48 130 50 L120 58 Q110 62 100 62 Q90 62 80 58 Z M85 75 Q87 73 90 75 Q92 77 90 80 Q88 82 85 80 Q83 78 85 75 Z M115 75 Q117 73 120 75 Q122 77 120 80 Q118 82 115 80 Q113 78 115 75 Z"/>
        </svg>
        {/* Cartoon Dog Playing */}
        <svg className="pet-silhouette pet-silhouette-6" viewBox="0 0 200 200" fill="white" opacity="0.08">
          <path d="M65 70 Q55 65 50 72 L45 85 Q42 92 47 98 L55 105 Q62 112 70 118 L80 125 Q85 130 90 135 L95 145 L90 170 L105 170 L110 145 L120 150 L130 145 L135 170 L150 170 L145 145 L150 135 Q155 130 160 125 L170 118 Q178 112 185 105 L193 98 Q198 92 195 85 L190 72 Q185 65 175 70 L165 78 Q155 83 145 85 L120 88 Q110 88 100 85 L75 78 Z"/>
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
                    <Button size="lg" className="bg-base-gradient hover:opacity-90 w-full sm:w-auto text-lg px-8 py-6">
                      <Upload className="w-5 h-5 mr-2" />
                      UPLOAD YOUR PET
                    </Button>
                  </Link>
                ) : (
                  <Button asChild size="lg" className="bg-base-gradient hover:opacity-90 w-full sm:w-auto text-lg px-8 py-6">
                    <a href={getLoginUrl()}>
                      <Zap className="w-5 h-5 mr-2" />
                      Get Based Now
                    </a>
                  </Button>
                )}
                <Link href="/leaderboard">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all">
                    <Trophy className="w-5 h-5 mr-2" />
                    LEADERBOARD
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
