import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingScreens = [
  {
    title: "Welcome to PetsOfBase! 🐾",
    description: "Create AI-generated PFPs of your pets and mint them as NFTs on Base - completely free!",
    icon: "🎨",
    features: [
      "Upload your pet's photo",
      "Get an AI-generated PFP",
      "Mint as an NFT for free",
    ],
  },
  {
    title: "How It Works ✨",
    description: "Three simple steps to get your pet's PFP:",
    icon: "🚀",
    features: [
      "1. Upload a photo of your pet",
      "2. AI generates a unique PFP",
      "3. Mint it as an NFT (free!)",
    ],
  },
  {
    title: "Join the Community 🌟",
    description: "Vote for your favorite pets, climb the leaderboard, and earn rewards!",
    icon: "🏆",
    features: [
      "Vote for Pet of the Day",
      "Compete on the leaderboard",
      "Earn referral rewards",
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="text-6xl">{screen.icon}</div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{screen.title}</h2>
            <p className="text-muted-foreground">{screen.description}</p>
          </div>

          <ul className="space-y-3 text-left">
            {screen.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary text-xl">✓</span>
                <span className="flex-1">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {onboardingScreens.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentScreen ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentScreen > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen(currentScreen - 1)}
                >
                  Back
                </Button>
              )}
              <Button onClick={handleNext} className="bg-base-gradient btn-primary-hover">
                {currentScreen < onboardingScreens.length - 1 ? "Next" : "Get Started"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
