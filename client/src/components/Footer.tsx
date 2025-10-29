import { SiX, SiTelegram, SiBinance } from "react-icons/si";
import { Shield, FileText, Mail, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import logoImage from "@assets/file_00000000851061f48f85c204c1e60aa9_1761600862005.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-card/30 to-card/50 backdrop-blur-sm">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" data-testid="footer-logo-link">
              <img src={logoImage} alt="BNBall Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-primary">BNBALL</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Decentralized sports prediction markets on Binance Smart Chain. Transparent, secure, and instant payouts.
            </p>
            <div className="flex items-center gap-2 text-secondary">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold">Audited & Secured</span>
            </div>
          </div>

          {/* Learn Column */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">Learn</h3>
            <div className="space-y-3">
              <a
                href="#whitepaper"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-whitepaper"
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Whitepaper
              </a>
              <Link
                href="/how-it-works"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-how-it-works"
              >
                How It Works
              </Link>
              <a
                href="#faq"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-faq"
              >
                FAQ
              </a>
              <a
                href="https://docs.bnball.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-documentation"
              >
                Documentation
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">Community</h3>
            <div className="space-y-3">
              <a
                href="https://twitter.com/bnball"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-twitter"
              >
                <SiX className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Twitter
              </a>
              <a
                href="https://t.me/bnball"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-telegram"
              >
                <SiTelegram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Telegram
              </a>
              <a
                href="https://discord.gg/bnball"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-discord"
              >
                Discord
              </a>
            </div>
          </div>

          {/* Newsletter/Contact Column */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest updates on new markets and features
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:hello@bnball.app"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-link-contact"
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright & Disclaimer */}
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-1">
                © {currentYear} BNBall. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Play responsibly. Age 18+ only. Gambling can be addictive.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://bscscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition-colors group"
                aria-label="BSCScan"
                title="View on BSCScan"
                data-testid="footer-icon-bscscan"
              >
                <SiBinance className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://twitter.com/bnball"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors group"
                aria-label="Twitter"
                data-testid="footer-icon-twitter"
              >
                <SiX className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://t.me/bnball"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors group"
                aria-label="Telegram"
                data-testid="footer-icon-telegram"
              >
                <SiTelegram className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
