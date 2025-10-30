import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Trophy, Zap } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SoccerBall3D } from "./SoccerBall3D";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useBNBPrice } from "@/hooks/useBNBPrice";

interface PlatformStats {
  totalVolume: string;
  liveMarketsCount: number;
  activeUsersCount: number;
  totalPrizePool: string;
}

export function Hero() {
  const [stats, setStats] = useState({
    volume: 0,
    markets: 0,
    users: 0,
    pool: 0
  });
  
  const { data: platformStats } = useQuery<PlatformStats>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  const { data: bnbPrice, isLoading: isPriceLoading, isError: isPriceError } = useBNBPrice();

  useEffect(() => {
    if (!platformStats) return;
    
    const bnbPriceValue = bnbPrice || 350;
    
    const targetStats = {
      volume: parseFloat(formatEther(BigInt(platformStats.totalVolume || '0'))) * bnbPriceValue,
      markets: platformStats.liveMarketsCount,
      users: platformStats.activeUsersCount,
      pool: parseFloat(formatEther(BigInt(platformStats.totalPrizePool || '0')))
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        volume: Math.round(targetStats.volume * progress * 100) / 100,
        markets: Math.round(targetStats.markets * progress),
        users: Math.round(targetStats.users * progress),
        pool: Math.round(targetStats.pool * progress * 100) / 100
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [platformStats, bnbPrice]);

  return (
    <div className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Stadium Background with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="0%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(0,0,0);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(20,20,20);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="1920" height="1080" fill="url(%23grad)" /%3E%3C/svg%3E')`
          }}
        />
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 z-20 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* 3D Soccer Ball - Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 opacity-30 hidden lg:block">
        <div className="scale-150">
          <SoccerBall3D />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
              Sports Predictions,
            </span>
            <br />
            <span className="text-white">
              On-Chain & Transparent
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Predict on your favorite sports with real BNB. Transparent odds, instant payouts, 
            and verified by blockchain oracles. The future of sports betting is here.
          </motion.p>

          {/* CTA Buttons with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link href="/markets">
              <Button
                size="lg"
                className="text-base px-10 h-14 bg-primary text-primary-foreground hover:bg-primary/90 backdrop-blur-xl border-2 border-primary/50 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transition-all duration-300 font-bold"
                data-testid="button-start-predicting"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Predicting
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-10 h-14 bg-black/40 text-white border-2 border-secondary/50 hover:bg-secondary/20 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-300 font-semibold"
                data-testid="button-how-it-works"
              >
                How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Live Stats Ticker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {/* Total Volume */}
            <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-black/40 backdrop-blur-xl border border-secondary/30 hover:border-secondary/60 transition-all duration-300 group" data-testid="stat-total-volume">
              <TrendingUp className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
              <div className="font-mono text-2xl font-bold text-white" data-testid="value-total-volume">
                {stats.volume >= 1000000 
                  ? `$${(stats.volume / 1000000).toFixed(1)}M`
                  : stats.volume >= 1000
                    ? `$${(stats.volume / 1000).toFixed(1)}K`
                    : `$${stats.volume.toFixed(0)}`
                }
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Total Volume</div>
            </div>

            {/* Active Markets */}
            <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-black/40 backdrop-blur-xl border border-primary/30 hover:border-primary/60 transition-all duration-300 group" data-testid="stat-active-markets">
              <Trophy className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="font-mono text-2xl font-bold text-white" data-testid="value-active-markets">
                {stats.markets}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Live Markets</div>
            </div>

            {/* Total Users */}
            <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-black/40 backdrop-blur-xl border border-accent/30 hover:border-accent/60 transition-all duration-300 group" data-testid="stat-active-users">
              <Users className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
              <div className="font-mono text-2xl font-bold text-white" data-testid="value-active-users">
                {stats.users >= 1000
                  ? `${(stats.users / 1000).toFixed(1)}K`
                  : stats.users
                }
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Active Users</div>
            </div>

            {/* Prize Pool */}
            <div className="flex flex-col items-center gap-2 p-6 rounded-xl bg-black/40 backdrop-blur-xl border border-primary/30 hover:border-primary/60 transition-all duration-300 group" data-testid="stat-prize-pool">
              <Zap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="font-mono text-2xl font-bold text-white" data-testid="value-prize-pool">
                {stats.pool.toFixed(2)} BNB
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Prize Pool</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-25" />
    </div>
  );
}
