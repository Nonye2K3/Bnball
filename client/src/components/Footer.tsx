import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Github, Twitter, MessageCircle, FileText } from "lucide-react";
import logoImage from "@assets/generated_images/BNBall_logo_design_5d68f7d3.png";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImage} alt="BNBall" className="h-8 w-8" />
              <span className="text-xl font-bold">BNBall</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The first decentralized sports prediction market on Binance Smart Chain.
            </p>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" data-testid="link-twitter">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-telegram">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-github">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Markets</Link></li>
              <li><Link href="/create" className="text-muted-foreground hover:text-foreground transition-colors">Create Market</Link></li>
              <li><Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Smart Contracts</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Audit Reports</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Get the latest market updates and news.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter email" 
                className="h-9"
                data-testid="input-newsletter-email"
              />
              <Button size="sm" data-testid="button-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 BNBall. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Smart Contracts Verified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
