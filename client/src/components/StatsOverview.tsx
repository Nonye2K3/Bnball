import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Zap, DollarSign } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";

interface PlatformStats {
  totalVolume: string;
  liveMarketsCount: number;
  activeUsersCount: number;
  totalPrizePool: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  index: number;
}

function StatCard({ icon, label, value, change, index }: StatCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  const extractNumber = (val: string): number => {
    const match = val.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const extractUnit = (val: string): string => {
    return val.replace(/[\d.,]/g, '');
  };

  useEffect(() => {
    if (isInView) {
      const targetNumber = extractNumber(value);
      const unit = extractUnit(value);
      let start = 0;
      const duration = 2000;
      const increment = targetNumber / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= targetNumber) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          const formattedNumber = start >= 1000 
            ? start.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : start.toFixed(1);
          setDisplayValue(formattedNumber + unit);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="p-3 rounded-lg bg-primary/10"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.4
              }}
            >
              {icon}
            </motion.div>
          </motion.div>
          {change && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="text-xs font-semibold text-green-500"
            >
              {change}
            </motion.span>
          )}
        </div>
        <div className="text-sm text-muted-foreground mb-1">{label}</div>
        <motion.div 
          className="text-3xl font-bold font-mono" 
          data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {displayValue}
        </motion.div>
      </Card>
    </motion.div>
  );
}

export function StatsOverview() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  
  const { data: platformStats } = useQuery<PlatformStats>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Calculate formatted values from real-time data
  const totalVolumeUSD = platformStats 
    ? (() => {
        const volumeUSD = parseFloat(formatEther(BigInt(platformStats.totalVolume || '0'))) * 350;
        if (volumeUSD >= 1000000) {
          return `$${(volumeUSD / 1000000).toFixed(2)}M`;
        } else if (volumeUSD >= 1000) {
          return `$${(volumeUSD / 1000).toFixed(2)}K`;
        } else {
          return `$${volumeUSD.toFixed(2)}`;
        }
      })()
    : '$0';
  
  const activeUsers = platformStats
    ? platformStats.activeUsersCount.toLocaleString()
    : '0';
  
  const marketsCreated = platformStats
    ? platformStats.liveMarketsCount.toLocaleString()
    : '0';
    
  const totalPrizePoolBNB = platformStats
    ? (() => {
        const poolBNB = parseFloat(formatEther(BigInt(platformStats.totalPrizePool || '0')));
        return `${poolBNB.toFixed(2)} BNB`;
      })()
    : '0 BNB';

  return (
    <div className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Platform Statistics
          </h2>
          <p className="text-muted-foreground text-lg">
            Real-time data from the blockchain
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            index={0}
            icon={<DollarSign className="w-6 h-6 text-primary" />}
            label="Total Volume"
            value={totalVolumeUSD}
          />
          <StatCard
            index={1}
            icon={<Users className="w-6 h-6 text-primary" />}
            label="Active Users"
            value={activeUsers}
          />
          <StatCard
            index={2}
            icon={<Zap className="w-6 h-6 text-primary" />}
            label="Live Markets"
            value={marketsCreated}
          />
          <StatCard
            index={3}
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="Prize Pool"
            value={totalPrizePoolBNB}
          />
        </div>
      </div>
    </div>
  );
}
