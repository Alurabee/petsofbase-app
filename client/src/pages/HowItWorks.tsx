import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-base-gradient-soft">
      <Navigation />
      <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">
        How PetsOfBase Works
      </h1>

      <div className="space-y-8">
        {/* Cuteness Leaderboard */}
        <Card className="p-6 bg-pastel-blue">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Cuteness Leaderboard</h2>
              <p className="text-foreground mb-3">
                The Cuteness Leaderboard is an all-time popularity contest where the community votes for their favorite pets.
              </p>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Vote for any pet in the gallery anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Votes accumulate over time and never reset</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Top pets get visibility and bragging rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Earn badges for reaching vote milestones!</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Pet of the Day */}
        <Card className="p-6 !border-0 bg-gradient-blue-purple text-white">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⭐</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Pet of the Day</h2>
              <p className="text-white/90 mb-3">
                Every day at 12pm ET, we feature one special pet on the homepage.
              </p>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Eligibility:</strong> Pets with 5+ votes on the Cuteness Leaderboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Selection:</strong> Random selection from eligible pets (fair for everyone!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Cooldown:</strong> Each pet can only be featured once per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Reward:</strong> Featured pets earn the exclusive "Pet of the Day" badge!</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
                <p className="text-sm text-white">
                  💡 <strong>Pro Tip:</strong> Get your pet to 5+ votes to become eligible for Pet of the Day!
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Badge System */}
        <Card className="p-6 !border-0 bg-gradient-blue-purple text-white">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎖️</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Earn Exclusive Badges</h2>
              <p className="text-white/90 mb-3">
                Collect badges by participating in the community and reaching milestones!
              </p>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Milestone Badges:</strong> Earn badges for vote milestones (5, 10, 25, 50, 100 votes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Achievement Badges:</strong> Unlock badges for special achievements (first upload, voter, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Exclusive Badges:</strong> Rare badges for Pet of the Day, OG members, and special events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Display:</strong> Badges appear on your pet cards and profile for everyone to see!</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
                <p className="text-sm text-white">
                  🎉 <strong>Collect Them All:</strong> Build your badge collection and show off your achievements!
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* The Journey */}
        <Card className="p-6 bg-cream">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Pet's Journey to Glory</h2>
          <div className="space-y-3 text-foreground">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
              <span>Upload your pet and generate a unique AI PFP</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
              <span>Share with the community and gather votes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
              <span>Earn badges as you reach vote milestones (5, 10, 25+ votes)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
              <span>Become eligible for Pet of the Day at 5+ votes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">5</div>
              <span>Get featured and earn the exclusive "Pet of the Day" badge</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">6</div>
              <span>Climb the leaderboard and collect more badges! 🎉</span>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-6 bg-pastel-green">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Can I vote for my own pet?</h3>
              <p className="text-foreground">Yes! But you can only vote once per pet.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">How do I earn badges?</h3>
              <p className="text-foreground">
                Badges are automatically awarded when you reach milestones! Upload pets, vote, and reach vote thresholds (5, 10, 25, 50, 100 votes) to unlock badges. Special badges are awarded for Pet of the Day and being an OG member.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Is the Pet of the Day selection fair?</h3>
              <p className="text-foreground">
                Absolutely! Pet of the Day uses random selection from all eligible pets (5+ votes). Every eligible pet has an equal chance of being featured!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Where can I see my badges?</h3>
              <p className="text-foreground">
                Your badges appear on your pet cards in the gallery and My Pets page. You can also view your full badge collection by clicking "Badges" in the navigation menu.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">How much does it cost?</h3>
              <p className="text-foreground">
                You get 2 free PFP generations per pet. Additional style regenerations cost $0.10 USDC. Minting your PFP as an NFT costs $0.50 USDC.
              </p>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}
