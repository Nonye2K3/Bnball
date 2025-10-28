import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SoccerBall3D } from "./SoccerBall3D";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.6 + (i * 0.1),
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Sports predictions,<br />
              <span className="text-foreground">on-chain and</span><br />
              <span className="text-foreground">transparent.</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl"
            >
              Predict real matches on BNB Chain with decentralized and non-custodial markets.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 mb-12"
            >
              <Link href="/markets">
                <Button 
                  size="lg" 
                  className="text-base px-8 h-12 bg-primary hover:bg-primary/90"
                  data-testid="button-start-predicting"
                >
                  Start predicting
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 h-12"
                  data-testid="button-how-it-works"
                >
                  How it works
                </Button>
              </Link>
            </motion.div>
            
            {/* Feature Icons */}
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                custom={0}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary icon-3d" />
                </div>
                <span className="text-sm font-medium text-center">Non-custodial</span>
              </motion.div>
              
              <motion.div
                custom={1}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <Download className="w-6 h-6 text-primary icon-3d" />
                </div>
                <span className="text-sm font-medium text-center">Low fees</span>
              </motion.div>
              
              <motion.div
                custom={2}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary icon-3d" />
                </div>
                <span className="text-sm font-medium text-center">Real-time prices</span>
              </motion.div>
              
              <motion.div
                custom={3}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <CheckCircle className="w-6 h-6 text-primary icon-3d" />
                </div>
                <span className="text-sm font-medium text-center">On-chain payouts</span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Right Column - 3D Soccer Balls */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <SoccerBall3D />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
