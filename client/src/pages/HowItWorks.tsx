import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-vibrant-mesh relative">
      <div className="absolute inset-0 dot-pattern" />
      <Navigation />
      <div className="container mx-auto py-12 px-4 max-w-4xl relative z-10">
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        How PetsOfBase Works
      </h1>

      <div className="space-y-8">
        {/* Cuteness Leaderboard */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-white">Cuteness Leaderboard</h2>
              <p className="text-white/70 mb-3">
                The Cuteness Leaderboard is an all-time popularity contest where the community votes for their favorite pets.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="text-white/70">Vote for any pet in the gallery anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="text-white/70">Votes accumulate over time and never reset</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="text-white/70">Top pets get visibility and bragging rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="text-white/70">No prizes - just glory and community recognition!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pet of the Day */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⭐</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-white">Pet of the Day</h2>
              <p className="text-white/70 mb-3">
                Every day at 12pm ET, we feature one special pet on the homepage.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Eligibility:</strong> Pets with 5+ votes on the Cuteness Leaderboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Selection:</strong> Random selection from eligible pets (fair for everyone!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Cooldown:</strong> Each pet can only be featured once per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Bonus:</strong> Featured pets automatically enter the weekly draw!</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900">
                  💡 <strong>Pro Tip:</strong> Get your pet to 5+ votes to become eligible for Pet of the Day!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Draw */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎰</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-white">Weekly Draw - $5 USDC Prize</h2>
              <p className="text-white/70 mb-3">
                Every Monday at 12pm ET, one lucky pet wins $5 USDC!
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Entries:</strong> All 7 daily Pet of the Day winners from Monday-Sunday</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Selection:</strong> Completely random draw - every entry has equal chance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Prize:</strong> Winner receives $5 USDC to their wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong>Announcement:</strong> Posted on homepage, activity feed, and Farcaster</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-900">
                  🎉 <strong>Fair & Transparent:</strong> Random selection means no vote manipulation - everyone has an equal shot at winning!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The Journey */}
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Your Pet's Journey to Glory</h2>
          <div className="space-y-3 text-white/70">
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
              <span>Reach 5+ votes to become eligible for Pet of the Day</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
              <span>Get randomly selected as Pet of the Day</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">5</div>
              <span>Automatically enter the weekly $5 USDC draw</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">6</div>
              <span>Win the weekly draw and celebrate! 🎉</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-1 text-white">Can I vote for my own pet?</h3>
              <p className="text-white/70">Yes! But you can only vote once per pet.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 text-white">How do I increase my chances of winning?</h3>
              <p className="text-white/70">
                Get your pet to 5+ votes to become eligible for Pet of the Day. Once featured, you're automatically entered in the weekly draw with equal chances as everyone else!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 text-white">Is the selection process fair?</h3>
              <p className="text-white/70">
                Absolutely! Pet of the Day uses random selection from eligible pets (5+ votes), and the weekly draw is completely random. No vote manipulation possible!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 text-white">When do I receive my prize if I win?</h3>
              <p className="text-white/70">
                Weekly draw winners are announced every Monday at 12pm ET. The $5 USDC prize is distributed to your connected wallet shortly after.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
