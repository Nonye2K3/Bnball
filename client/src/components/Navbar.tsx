import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Wallet, Menu, X } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/generated_images/BNBall_logo_design_5d68f7d3.png";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="BNBall" className="h-8 w-8" />
              <span className="text-xl font-bold">BNBall</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a 
                href="#markets" 
                className="text-sm font-medium hover:text-primary transition-colors"
                data-testid="link-markets"
              >
                Active Markets
              </a>
              <a 
                href="#how-it-works" 
                className="text-sm font-medium hover:text-primary transition-colors"
                data-testid="link-how-it-works"
              >
                How It Works
              </a>
              <a 
                href="#tokenomics" 
                className="text-sm font-medium hover:text-primary transition-colors"
                data-testid="link-tokenomics"
              >
                Tokenomics
              </a>
              <a 
                href="#docs" 
                className="text-sm font-medium hover:text-primary transition-colors"
                data-testid="link-docs"
              >
                Docs
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              className="hidden sm:flex items-center gap-2"
              data-testid="button-connect-wallet"
              onClick={() => console.log('Connect wallet clicked')}
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-4 space-y-3">
            <a 
              href="#markets" 
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Active Markets
            </a>
            <a 
              href="#how-it-works" 
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#tokenomics" 
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tokenomics
            </a>
            <a 
              href="#docs" 
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </a>
            <Button 
              className="w-full flex items-center justify-center gap-2 sm:hidden"
              onClick={() => console.log('Connect wallet clicked')}
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
