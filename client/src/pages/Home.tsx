import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsOverview } from "@/components/StatsOverview";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { TrendingUp, Brain, Shield, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="page-home"
    >
      <Navbar />
      <Hero />
      <StatsOverview />
      
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore BNBall
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover everything you need to start predicting and winning
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link href="/markets">
              <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <TrendingUp className="w-6 h-6 text-primary icon-3d" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="heading-explore-markets">Explore Markets</h3>
                <p className="text-sm text-muted-foreground">
                  Browse active prediction markets across NBA, FIFA, eSports, and more
                </p>
              </Card>
            </Link>
            
            <Link href="/how-it-works">
              <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Brain className="w-6 h-6 text-primary icon-3d" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="heading-how-it-works">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Learn the simple 4-step process to start predicting and earning
                </p>
              </Card>
            </Link>
            
            <Link href="/oracle">
              <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Shield className="w-6 h-6 text-primary icon-3d" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="heading-oracle-system">Oracle System</h3>
                <p className="text-sm text-muted-foreground">
                  Understand our multi-layer verification and dispute resolution
                </p>
              </Card>
            </Link>
            
            <Link href="/tokenomics">
              <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Coins className="w-6 h-6 text-primary icon-3d" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="heading-tokenomics">Tokenomics</h3>
                <p className="text-sm text-muted-foreground">
                  Explore our dual-token model with BNB and BNBALL tokens
                </p>
              </Card>
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/markets">
              <Button size="lg" className="text-lg px-8" data-testid="button-get-started">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </motion.div>
  );
}
