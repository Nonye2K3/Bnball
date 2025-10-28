import { SiX, SiTelegram } from "react-icons/si";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Learn Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Learn</h3>
            <div className="space-y-2">
              <a 
                href="#whitepaper" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Whitepaper
              </a>
              <a 
                href="#faq" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </a>
            </div>
          </div>
          
          {/* Community Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Community</h3>
            <div className="space-y-2">
              <a 
                href="https://twitter.com/bnball" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Twitter
              </a>
              <a 
                href="https://t.me/bnball" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>
          
          {/* Play Responsibly + Social Icons */}
          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-sm text-muted-foreground">Play responsibly</p>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/bnball" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <SiX className="w-5 h-5" />
              </a>
              <a 
                href="https://t.me/bnball" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Telegram"
              >
                <SiTelegram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
