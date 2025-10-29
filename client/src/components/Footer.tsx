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
                href="https://x.com/bn_ball_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-twitter"
              >
                <SiX className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Twitter
              </a>
              <a
                href="https://t.me/BNBALL_Portal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="footer-link-telegram"
              >
                <SiTelegram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Telegram
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

            {/* 3D Social Icons */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://bscscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 text-secondary hover:text-secondary transition-all duration-300 group"
                aria-label="BSCScan"
                title="View on BSCScan"
                data-testid="footer-icon-bscscan"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: 'var(--shadow-3d)',
                }}
              >
                <SiBinance className="w-6 h-6 relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-secondary/0 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
              
              <motion.a
                href="https://x.com/bn_ball_"
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 text-primary hover:text-primary transition-all duration-300 group"
                aria-label="Twitter"
                title="Follow us on X"
                data-testid="footer-icon-twitter"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: 'var(--shadow-3d)',
                }}
              >
                <SiX className="w-6 h-6 relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] transition-all" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
              
              <motion.a
                href="https://t.me/BNBALL_Portal"
                target="_blank"
                rel="noopener noreferrer"
                className="relative p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 text-accent hover:text-accent transition-all duration-300 group"
                aria-label="Telegram"
                title="Join our Telegram"
                data-testid="footer-icon-telegram"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: 'var(--shadow-3d)',
                }}
              >
                <SiTelegram className="w-6 h-6 relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(255,107,53,0.6)] transition-all" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
