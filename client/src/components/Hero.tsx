import { Button } from "@/components/ui/button";
import { Lock, DollarSign, Activity, Coins } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SoccerBall3D } from "./SoccerBall3D";

export function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight text-primary">
              Sports predictions, on-chain and transparent
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              Predict on your favorite sports with BNBall, a decentralized prediction platform built on BNB Smart Chain.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link href="/markets">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base px-8 h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  data-testid="button-start-predicting"
                >
                  Start Predicting
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-base px-8 h-12 bg-secondary/50 hover:bg-secondary/70"
                  data-testid="button-how-it-works"
                >
                  How It Works
                </Button>
              </Link>
            </div>
            
            {/* Feature Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 bg-card/30"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-center">Non-custodial</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 bg-card/30"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-center">Low fees</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 bg-card/30"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-center">Real-time prices</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 bg-card/30"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-center">On-chain payouts</span>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Right Column - 3D Soccer Ball */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <SoccerBall3D />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
