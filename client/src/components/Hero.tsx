import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Futuristic_sports_stadium_hero_0befccdc.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8 + (i * 0.1),
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          y: backgroundY
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background"></div>
      </motion.div>
      
      <motion.div 
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8"
          >
            <Zap className="w-4 h-4 text-primary icon-3d" />
            <span className="text-sm font-semibold text-primary">First Sports Prediction Market on Binance Chain</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white"
          >
            Predict. Compete. <span className="text-primary">Win.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto"
          >
            The future of sports betting is here. Fully on-chain, AI-powered results, transparent settlements. 
            Built on Binance Smart Chain with dual token economics.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <motion.div variants={floatingVariants} initial="initial" animate="animate">
              <Link href="/markets">
                <Button 
                  size="lg" 
                  className="text-lg px-8 h-12"
                  data-testid="button-start-predicting"
                >
                  Start Predicting
                </Button>
              </Link>
            </motion.div>
            <motion.div 
              variants={floatingVariants} 
              initial="initial" 
              animate="animate"
              style={{ transitionDelay: "0.2s" }}
            >
              <Link href="/how-it-works">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 h-12 bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-background/30"
                  data-testid="button-how-it-works"
                >
                  How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div 
            custom={0}
            variants={featureVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/10 backdrop-blur-sm border border-white/10"
          >
            <Shield className="w-8 h-8 text-primary icon-3d" />
            <h3 className="font-semibold text-lg text-white">100% On-Chain</h3>
            <p className="text-sm text-white/70">Transparent, verifiable, trustless</p>
          </motion.div>
          <motion.div 
            custom={1}
            variants={featureVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/10 backdrop-blur-sm border border-white/10"
          >
            <TrendingUp className="w-8 h-8 text-primary icon-3d" />
            <h3 className="font-semibold text-lg text-white">AI-Powered Results</h3>
            <p className="text-sm text-white/70">Automated, accurate settlements</p>
          </motion.div>
          <motion.div 
            custom={2}
            variants={featureVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/10 backdrop-blur-sm border border-white/10"
          >
            <Zap className="w-8 h-8 text-primary icon-3d" />
            <h3 className="font-semibold text-lg text-white">Instant Payouts</h3>
            <p className="text-sm text-white/70">Get your winnings immediately</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
