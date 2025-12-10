import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Leaderboard from "./pages/Leaderboard";
import MyPets from "./pages/MyPets";
import Mint from "./pages/Mint";
import PetDetail from "./pages/PetDetail";
import Gallery from "./pages/Gallery";
import Referrals from "./pages/Referrals";
import HowItWorks from "./pages/HowItWorks";
import Badges from "./pages/Badges";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

// Referral tracking component
function ReferralTracker() {
  const trackClickMutation = trpc.referrals.trackClick.useMutation();

  useEffect(() => {
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      // Store in localStorage for later (when user signs up)
      localStorage.setItem('referralCode', refCode);
      
      // Track the click
      trackClickMutation.mutate({ referralCode: refCode });
      
      // Clean URL (remove ref param)
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/my-pets"} component={MyPets} />
      <Route path={"/mint/:id"} component={Mint} />
      <Route path={"/pet/:id"} component={PetDetail} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/referrals"} component={Referrals} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/badges"} component={Badges} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ReferralTracker />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
