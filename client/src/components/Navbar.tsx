import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useWeb3 } from "@/hooks/useWeb3";
import { Wallet, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/file_00000000851061f48f85c204c1e60aa9_1761600862005.png";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [location] = useLocation();
  const { isConnected, formattedAddress, connect, disconnect, isConnecting } = useWeb3();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2" data-testid="link-home">
              <img src={logoImage} alt="BNBall Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-primary">BNBALL</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/markets" 
                className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/markets') ? 'text-primary' : 'text-foreground'}`}
                data-testid="link-markets"
              >
                Markets
              </Link>
              <Link 
                href="/create" 
                className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/create') ? 'text-primary' : 'text-foreground'}`}
                data-testid="link-create"
              >
                Create Market
              </Link>
              <Link 
                href="/how-it-works" 
                className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/how-it-works') ? 'text-primary' : 'text-foreground'}`}
                data-testid="link-how-it-works"
              >
                How It Works
              </Link>
              <a 
                href="#whitepaper" 
                className="text-sm font-medium hover:text-primary transition-colors text-foreground"
                data-testid="link-whitepaper"
              >
                Whitepaper
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {mounted && (
              <>
                {isConnected ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => disconnect()}
                      data-testid="button-disconnect-wallet"
                      title="Disconnect Wallet"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-connect-wallet"
                    onClick={() => connect()}
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                )}
              </>
            )}
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
            <Link 
              href="/markets" 
              className={`block text-sm font-medium hover:text-primary transition-colors py-2 ${isActive('/markets') ? 'text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Markets
            </Link>
            <Link 
              href="/create" 
              className={`block text-sm font-medium hover:text-primary transition-colors py-2 ${isActive('/create') ? 'text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Market
            </Link>
            <Link 
              href="/how-it-works" 
              className={`block text-sm font-medium hover:text-primary transition-colors py-2 ${isActive('/how-it-works') ? 'text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <a 
              href="#whitepaper" 
              className="block text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Whitepaper
            </a>
            <div className="sm:hidden py-2 flex justify-center">
              <ThemeToggle />
            </div>
            {mounted && (
              <>
                {isConnected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnect()}
                    data-testid="button-disconnect-wallet-mobile"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => connect()}
                    disabled={isConnecting}
                    data-testid="button-connect-wallet-mobile"
                  >
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
