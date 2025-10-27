import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, Shield, Trophy } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function Step({ number, icon, title, description, index }: StepProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: "easeOut"
      }}
    >
      <Card className="p-8 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 0.05 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.8, delay: index * 0.15 + 0.2 }}
          className="absolute top-4 right-4 text-6xl font-bold text-primary"
        >
          {number}
        </motion.div>
        <div className="relative">
          <motion.div 
            initial={{ rotate: -180, scale: 0 }}
            animate={isInView ? { rotate: 0, scale: 1 } : { rotate: -180, scale: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.15 + 0.3,
              type: "spring",
              stiffness: 200
            }}
            className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
}

export default function HowItWorks() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="page-how-it-works"
    >
      <Navbar />
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="heading-how-it-works">
              How It Works
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in minutes. Simple, transparent, and fully decentralized.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Step
              index={0}
              number={1}
              icon={<Wallet className="w-6 h-6 text-primary" />}
              title="Connect Wallet"
              description="Link your Web3 wallet using WalletConnect. Support for MetaMask, Trust Wallet, and more."
            />
            <Step
              index={1}
              number={2}
              icon={<TrendingUp className="w-6 h-6 text-primary" />}
              title="Choose Market"
              description="Browse sports predictions for NBA, FIFA, eSports, and more. Review odds and potential returns."
            />
            <Step
              index={2}
              number={3}
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Place Your Bet"
              description="Stake BNB or BNBALL tokens. All funds secured in smart contract escrow vault."
            />
            <Step
              index={3}
              number={4}
              icon={<Trophy className="w-6 h-6 text-primary" />}
              title="Collect Winnings"
              description="AI-powered oracle verifies results. Winners receive instant payouts to their wallet."
            />
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}
