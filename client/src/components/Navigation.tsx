import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Menu, Upload, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { Link } from "wouter";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="PetsOfBase" className="w-10 h-10 rounded-lg" />
          <span className="text-xl md:text-2xl font-bold text-base-gradient">PetsOfBase</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <ThemeToggle />
          <Link href="/leaderboard" className="text-xs xl:text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
            Leaderboard
          </Link>
          <Link href="/gallery" className="text-xs xl:text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
            Gallery
          </Link>
          <Link href="/how-it-works" className="text-xs xl:text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
            How It Works
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/my-pets" className="text-xs xl:text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
                My Pets
              </Link>
              <Link href="/referrals" className="text-xs xl:text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
                Referrals
              </Link>
              <Button asChild className="bg-base-gradient btn-primary-hover">
                <Link href="/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Pet
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild className="bg-base-gradient btn-primary-hover">
              <a href={getLoginUrl()}>Connect Wallet</a>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-card/95 backdrop-blur-sm">
          <div className="container py-4 flex flex-col gap-4">
            <Link 
              href="/leaderboard" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link 
              href="/gallery" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link 
              href="/how-it-works" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/my-pets" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Pets
                </Link>
                <Link 
                  href="/referrals" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Referrals
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
  );
}
