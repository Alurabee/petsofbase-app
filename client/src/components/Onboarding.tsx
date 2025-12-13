import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingScreens = [
  {
    title: "Welcome to PetsOfBase!",
    description: "Turn your pet into a unique AI-generated PFP and mint it as an NFT on Base.",
    icon: "logo",
    features: [
      "Upload your pet's photo",
      "Choose from 5 AI art styles",
      "Mint as an NFT on Base",
    ],
  },
  {
    title: "How It Works ✨",
    description: "Get your pet's PFP in three simple steps:",
    icon: "🚀",
    features: [
      "Upload a photo of your pet",
      "AI generates your unique PFP",
      "Mint it as an NFT",
    ],
  },
  {
    title: "Compete & Collect! 🏆",
    description: "Join the community, vote for your favorites, and earn exclusive badges!",
    icon: "🎖️",
    features: [
      "Vote and earn achievement badges",
      "Climb the leaderboard rankings",
      "Collect exclusive milestone badges",
    ],
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const screen = onboardingScreens[currentScreen];

  const gradients = [
    "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400",
    "bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-500",
    "bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500",
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
      // Allow dismissing by tapping the dark backdrop.
      onClick={(e) => {
        if (e.target === e.currentTarget) onComplete();
      }}
    >
      <div className="min-h-[100svh] flex items-start justify-center p-3 pt-[calc(env(safe-area-inset-top)+56px)] pb-[calc(env(safe-area-inset-bottom)+20px)]">
        <div
          className={`w-full max-w-[22rem] sm:max-w-md overflow-y-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-500 border-2 border-white shadow-2xl rounded-xl ${gradients[currentScreen]}`}
          style={{
            // Keep the card fully visible inside embedded webviews with safe areas.
            maxHeight:
              "calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px)",
          }}
        >
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleSkip}
              onPointerUp={handleSkip}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white z-10 pointer-events-auto"
              aria-label="Close onboarding"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center space-y-4">
          {/* Fixed-height icon area so all screens have consistent layout */}
          <div className="h-20 sm:h-24 flex items-center justify-center">
            {screen.icon === "logo" ? (
              <img
                src="/logo.png"
                alt="PetsOfBase Logo"
                className="w-14 h-14 sm:w-18 sm:h-18 animate-bounce"
                style={{ animationDuration: "2s" }}
              />
            ) : (
              <div className="text-4xl sm:text-6xl animate-pulse">{screen.icon}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{screen.title}</h2>
            <p className="text-white/90 text-sm sm:text-base">{screen.description}</p>
          </div>

          <ul className="space-y-2.5 text-left bg-white/20 backdrop-blur-sm rounded-lg p-3">
            {screen.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-white text-xl">✓</span>
                <span className="flex-1 text-white font-medium text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {onboardingScreens.map((_, index) => (
                <div
                  key={index}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentScreen ? "bg-white scale-125" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentScreen > 0 && (
                <Button
                  onClick={() => setCurrentScreen(currentScreen - 1)}
                  className="bg-white/30 hover:bg-white/40 text-white border-2 border-white/50 backdrop-blur-sm"
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                className="bg-white hover:bg-white/90 text-gray-900 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {currentScreen < onboardingScreens.length - 1 ? "Next →" : "Get Started 🚀"}
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
