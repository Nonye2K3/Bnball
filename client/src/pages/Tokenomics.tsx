import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, Users, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface TokenCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  index: number;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

function TokenCard({ icon, title, description, features, index, gradient, iconBg, iconColor }: TokenCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 0, y: 50, rotateY: -15 }}
      transition={{
        duration: 0.7,
        delay: index * 0.2,
        ease: "easeOut"
      }}
    >
      <Card className={`p-8 ${gradient} relative overflow-hidden`}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{
            duration: 0.6,
            delay: index * 0.2 + 0.3,
            type: "spring",
            stiffness: 200
          }}
          className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"
        />
        
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className={`p-3 rounded-lg ${iconBg} relative`}
            animate={{
              boxShadow: [
                `0 0 0px rgba(var(--primary), 0)`,
                `0 0 20px rgba(var(--primary), 0.3)`,
                `0 0 0px rgba(var(--primary), 0)`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.5
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
              }}
            >
              {icon}
            </motion.div>
          </motion.div>
          <h2 className="text-2xl font-bold" data-testid={`heading-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        
        <motion.ul 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: index * 0.2 + 0.5
              }
            }
          }}
          className="space-y-3"
        >
          {features.map((feature, i) => (
            <motion.li
              key={i}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              className="flex items-start gap-2"
            >
              <Zap className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
              <span className="text-sm">{feature}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Card>
    </motion.div>
  );
}

interface DistributionStatProps {
  icon: React.ReactNode;
  percentage: number;
  label: string;
  index: number;
}

function DistributionStat({ icon, percentage, label, index }: DistributionStatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = percentage;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, percentage]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        type: "spring",
        stiffness: 200
      }}
      className="text-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3
        }}
      >
        {icon}
      </motion.div>
      <motion.div 
        className="text-3xl font-bold font-mono mb-2" 
        data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {count}%
      </motion.div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

export default function Tokenomics() {
  const headerRef = useRef(null);
  const distributionRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const isDistributionInView = useInView(distributionRef, { once: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="page-tokenomics"
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="heading-tokenomics">
              Dual Token Economics
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built on a sustainable dual-token model combining BNB liquidity with BNBALL utility
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <TokenCard
              index={0}
              icon={<Coins className="w-6 h-6 text-primary icon-3d" />}
              title="BNB Token"
              description="Primary betting currency with instant liquidity and wide acceptance across BSC ecosystem."
              features={[
                "Place bets on any market",
                "Instant settlements and withdrawals",
                "Lower gas fees on BSC network"
              ]}
              gradient="bg-gradient-to-br from-primary/10 to-primary/5"
              iconBg="bg-primary/20"
              iconColor="text-primary"
            />
            
            <TokenCard
              index={1}
              icon={<TrendingUp className="w-6 h-6 text-secondary" />}
              title="BNBALL Token"
              description="Platform utility token with governance rights, staking rewards, and exclusive benefits."
              features={[
                "Reduced platform fees (0.5% vs 2%)",
                "Governance voting on new features",
                "Stake to earn yield from platform fees"
              ]}
              gradient="bg-gradient-to-br from-secondary/10 to-secondary/5"
              iconBg="bg-secondary/20"
              iconColor="text-secondary"
            />
          </div>
          
          <motion.div
            ref={distributionRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isDistributionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6" data-testid="heading-token-distribution">Token Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DistributionStat
                  index={0}
                  icon={<Users className="w-8 h-8 text-primary mx-auto mb-3" />}
                  percentage={40}
                  label="Community & Rewards"
                />
                <DistributionStat
                  index={1}
                  icon={<TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />}
                  percentage={30}
                  label="Liquidity Pool"
                />
                <DistributionStat
                  index={2}
                  icon={<Zap className="w-8 h-8 text-primary mx-auto mb-3" />}
                  percentage={30}
                  label="Team & Development"
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}
