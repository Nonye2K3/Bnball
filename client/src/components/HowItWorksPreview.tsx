import { Calendar, Wallet, CheckCircle, Shield, FileCheck, TrendingUp, Lock } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    icon: Calendar,
    title: "Pick a Match",
    description: "Browse live sports events across NBA, NFL, FIFA, and more",
    bgClass: "bg-gradient-to-br from-primary/20 to-primary/5",
    borderClass: "border-primary/30",
    iconClass: "text-primary",
    badgeClass: "bg-primary text-primary-foreground"
  },
  {
    icon: TrendingUp,
    title: "Predict YES or NO",
    description: "Place your prediction with transparent, real-time odds",
    bgClass: "bg-gradient-to-br from-secondary/20 to-secondary/5",
    borderClass: "border-secondary/30",
    iconClass: "text-secondary",
    badgeClass: "bg-secondary text-secondary-foreground"
  },
  {
    icon: Wallet,
    title: "Withdraw On-Chain",
    description: "Claim winnings instantly to your wallet after resolution",
    bgClass: "bg-gradient-to-br from-accent/20 to-accent/5",
    borderClass: "border-accent/30",
    iconClass: "text-accent",
    badgeClass: "bg-accent text-accent-foreground"
  }
];

const trustPoints = [
  {
    icon: Shield,
    text: "Prices verified by Chainlink oracles",
    bgClass: "bg-secondary/10",
    bgHoverClass: "group-hover:bg-secondary/20",
    iconClass: "text-secondary"
  },
  {
    icon: FileCheck,
    text: "Audited smart contracts on BSC",
    bgClass: "bg-primary/10",
    bgHoverClass: "group-hover:bg-primary/20",
    iconClass: "text-primary"
  },
  {
    icon: Lock,
    text: "Non-custodial with secure treasury",
    bgClass: "bg-accent/10",
    bgHoverClass: "group-hover:bg-accent/20",
    iconClass: "text-accent"
  }
];

export function HowItWorksPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="py-24 bg-gradient-to-b from-card/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(-45deg, hsl(var(--secondary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Steps with Timeline */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent opacity-30 hidden md:block" />
            
            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="flex items-start gap-6 relative group"
                    data-testid={`step-${index + 1}`}
                  >
                    {/* Step Number & Icon */}
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl ${step.bgClass} border-2 ${step.borderClass} flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]`}>
                        <Icon className={`w-8 h-8 ${step.iconClass}`} />
                      </div>
                      {/* Step Number Badge */}
                      <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full ${step.badgeClass} flex items-center justify-center text-xs font-bold border-2 border-background z-20`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-base leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Right Side - Trust Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold mb-8">Why Trust BNBall?</h3>
            
            {trustPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                  data-testid={`trust-point-${index + 1}`}
                >
                  <div className={`p-3 rounded-lg ${point.bgClass} ${point.bgHoverClass} transition-colors`}>
                    <Icon className={`w-6 h-6 ${point.iconClass}`} />
                  </div>
                  <p className="text-base font-medium pt-2 leading-relaxed">{point.text}</p>
                </motion.div>
              );
            })}

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20"
            >
              <p className="text-sm text-muted-foreground mb-4">
                All transactions are verifiable on BSC. Your funds remain in your control until you win.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>100% Transparent & Decentralized</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
