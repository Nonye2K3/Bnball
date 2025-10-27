import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useWeb3 } from "@/hooks/useWeb3";
import { Wallet, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/generated_images/BNBall_logo_design_5d68f7d3.png";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isConnected, formattedAddress, chain, connect, disconnect, isConnecting } = useWeb3();
  
  const isActive = (path: string) => location === path;

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
              <Link 
                href="/" 
                className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/') ? 'text-primary' : ''}`}
                data-testid="link-markets"
              >
                Markets
              </Link>
              <Link 
                href="/create" 
                className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/create') ? 'text-primary' : ''}`}
                data-testid="link-create"
              >
                Create
              </Link>
              <Link 
                href="/leaderboard" 
                className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/leaderboard') ? 'text-primary' : ''}`}
                data-testid="link-leaderboard"
              >
                Leaderboard
              </Link>
              <Link 
                href="/faq" 
                className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/faq') ? 'text-primary' : ''}`}
                data-testid="link-faq"
              >
                FAQ
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isConnected ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <code className="text-xs font-mono" data-testid="text-connected-address">
                    {formattedAddress}
                  </code>
                  {chain && (
                    <Badge variant="outline" className="text-xs">
                      {chain.name}
                    </Badge>
                  )}
                </div>
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
                className="hidden sm:flex items-center gap-2"
                data-testid="button-connect-wallet"
                onClick={() => connect()}
                disabled={isConnecting}
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
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
              href="/" 
              className={`block text-sm font-medium hover:text-primary transition-colors py-2 ${isActive('/') ? 'text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Markets
            </Link>
            <Link 
              href="/create" 
              className={`block text-sm font-medium hover:text-primary transition-colors py-2 ${isActive('/create') ? 'text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create
            </Link>
            <Link 
              href="/leaderboard" 
              className={`block text-sm font-medium hover:text-primary transition-colors py-2 ${isActive('/leaderboard') ? 'text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link 
              href="/faq" 
              className={`block text-sm font-medium hover:text-primary transition-colors py-2 ${isActive('/faq') ? 'text-primary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            {isConnected ? (
              <div className="flex items-center gap-2 sm:hidden">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <code className="text-xs font-mono" data-testid="text-connected-address-mobile">
                    {formattedAddress}
                  </code>
                  {chain && (
                    <Badge variant="outline" className="text-xs">
                      {chain.name}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnect()}
                  data-testid="button-disconnect-wallet-mobile"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full flex items-center justify-center gap-2 sm:hidden"
                onClick={() => connect()}
                disabled={isConnecting}
                data-testid="button-connect-wallet-mobile"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
