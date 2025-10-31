import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp, Users, Flame, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { PredictionMarket } from "@shared/schema";
import { formatEther } from "viem";

// Helper function to calculate countdown from deadline
function useCountdown(deadline: Date) {
  const [countdown, setCountdown] = useState("");
  
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown("ENDED");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else {
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [deadline]);
  
  return countdown;
}

// Helper function to calculate pool size from wei values
function calculatePoolSize(yesPool?: string | null, noPool?: string | null): string {
  try {
    const yesValue = yesPool ? BigInt(yesPool) : BigInt(0);
    const noValue = noPool ? BigInt(noPool) : BigInt(0);
    const total = yesValue + noValue;
    
    if (total === BigInt(0)) return "0.00";
    
    const etherValue = formatEther(total);
    return parseFloat(etherValue).toFixed(2);
  } catch (error) {
    console.error("Error calculating pool size:", error);
    return "0.00";
  }
}

// Simplified visualization based on odds distribution
function OddsVisualization({ yesOdds, noOdds }: { yesOdds: number; noOdds: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-black/20 dark:bg-white/5 overflow-hidden flex">
      <div 
        className="h-full bg-gradient-to-r from-secondary to-secondary/80 transition-all duration-500"
        style={{ width: `${yesOdds}%` }}
      />
      <div 
        className="h-full bg-gradient-to-r from-accent/80 to-accent transition-all duration-500"
        style={{ width: `${noOdds}%` }}
      />
    </div>
  );
}

function MarketCard({ market, index }: { market: PredictionMarket; index: number }) {
  const [selectedPrediction, setSelectedPrediction] = useState<"YES" | "NO" | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const countdown = useCountdown(new Date(market.deadline));
  const poolSize = calculatePoolSize(market.yesPoolOnChain, market.noPoolOnChain);
  const yesOdds = parseFloat(market.yesOdds || "50");
  const noOdds = parseFloat(market.noOdds || "50");
  
  const isLive = market.status === 'live';
  const isUpcoming = market.status === 'upcoming';
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 border-border/30 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group backdrop-blur-sm hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]">
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <Badge 
              variant="secondary" 
              className="text-xs font-bold bg-primary/10 text-primary border-primary/20 uppercase tracking-wider"
            >
              {market.league || market.category}
            </Badge>
            {isLive && (
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-xs font-medium text-accent uppercase tracking-wide">Live</span>
              </div>
            )}
            {isUpcoming && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wide">Upcoming</span>
              </div>
            )}
          </div>
          
          {/* Match Title */}
          <h3 className="text-xl font-bold leading-tight min-h-[3rem]">{market.title}</h3>
          
          {/* Question Label */}
          <p className="text-sm text-muted-foreground font-medium line-clamp-2">{market.description}</p>
          
          {/* Odds Display */}
          <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-black/20 dark:bg-white/5">
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground mb-1">YES</div>
              <div className="text-2xl font-mono font-bold text-secondary">{yesOdds.toFixed(0)}%</div>
            </div>
            <div className="h-12 w-px bg-border/50" />
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground mb-1">NO</div>
              <div className="text-2xl font-mono font-bold text-accent">{noOdds.toFixed(0)}%</div>
            </div>
          </div>
          
          {/* Odds Visualization */}
          <div className="flex flex-col gap-2">
            <OddsVisualization yesOdds={yesOdds} noOdds={noOdds} />
          </div>
          
          {/* Countdown and Metrics */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{countdown}</span>
            </div>
            <div className="flex items-center gap-3">
              {market.participants > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">{market.participants.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-secondary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">{poolSize} BNB</span>
              </div>
            </div>
          </div>
          
          {/* Prediction Selector */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setSelectedPrediction("YES")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold text-sm transition-all duration-300 ${
                selectedPrediction === "YES"
                  ? "border-secondary bg-secondary/20 text-secondary shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "border-border/50 hover:border-secondary/50 hover:bg-secondary/5"
              }`}
              data-testid={`button-yes-${market.id}`}
            >
              YES
            </button>
            <button
              onClick={() => setSelectedPrediction("NO")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold text-sm transition-all duration-300 ${
                selectedPrediction === "NO"
                  ? "border-accent bg-accent/20 text-accent shadow-[0_0_20px_rgba(255,107,53,0.3)]"
                  : "border-border/50 hover:border-accent/50 hover:bg-accent/5"
              }`}
              data-testid={`button-no-${market.id}`}
            >
              NO
            </button>
          </div>
          
          {/* Predict Button */}
          <Link href="/markets">
            <Button
              className={`w-full h-12 font-bold text-base transition-all duration-300 ${
                selectedPrediction 
                  ? 'bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]' 
                  : 'opacity-50'
              }`}
              disabled={!selectedPrediction}
              data-testid={`button-predict-${market.id}`}
            >
              {selectedPrediction ? `Place Bet - ${selectedPrediction}` : 'Select Prediction'}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

// Loading skeleton component
function MarketCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </motion.div>
  );
}

export function LiveMarketsPreview() {
  const [selectedCategory, setSelectedCategory] = useState("All Sports");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch markets from API
  const { data: allMarkets = [], isLoading, refetch } = useQuery<PredictionMarket[]>({
    queryKey: ['/api/markets'],
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  // Filter and sort markets
  const displayMarkets = useMemo(() => {
    let filtered = allMarkets.filter(
      market => market.status === 'live' || market.status === 'upcoming'
    );

    // Filter by category if not "All Sports"
    if (selectedCategory !== "All Sports") {
      filtered = filtered.filter(
        market => market.category === selectedCategory || 
                  market.sport === selectedCategory ||
                  market.league === selectedCategory
      );
    }

    // Sort by deadline (soonest first)
    filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    // Take first 6 markets for preview
    return filtered.slice(0, 6);
  }, [allMarkets, selectedCategory]);

  // Extract unique categories from markets
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>(["All Sports"]);
    
    allMarkets.forEach(market => {
      if (market.category) uniqueCategories.add(market.category);
      if (market.sport) uniqueCategories.add(market.sport);
    });

    return Array.from(uniqueCategories);
  }, [allMarkets]);

  const handleSyncMarkets = async () => {
    await refetch();
  };

  return (
    <div className="py-20 bg-background relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 
            className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
            data-testid="heading-live-markets"
          >
            Live Prediction Markets
          </h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands betting on live sports events with transparent odds and instant payouts
          </p>
        </motion.div>
        
        {/* Category Pills Carousel */}
        {!isLoading && categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div 
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,215,0,0.4)] scale-105'
                      : 'bg-card/50 border-2 border-border/50 hover:border-primary/50 hover:bg-card/80'
                  }`}
                  data-testid={`category-${category.toLowerCase().replace(' ', '-')}`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <MarketCardSkeleton key={index} index={index} />
            ))
          ) : displayMarkets.length > 0 ? (
            // Display markets
            displayMarkets.map((market, index) => (
              <MarketCard key={market.id} market={market} index={index} />
            ))
          ) : (
            // Empty state
            <div className="col-span-full">
              <Card className="p-12 text-center bg-gradient-to-br from-card/50 to-card/30">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flame className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">No Live Markets Available</h3>
                    <p className="text-muted-foreground mb-6">
                      Check back soon for exciting prediction markets, or sync to fetch the latest live events.
                    </p>
                    <Button
                      onClick={handleSyncMarkets}
                      className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                      data-testid="button-sync-markets"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Markets
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* View All Button */}
        {!isLoading && displayMarkets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/markets">
              <Button
                size="lg"
                variant="outline"
                className="px-10 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold"
                data-testid="button-view-all-markets"
              >
                View All {allMarkets.filter(m => m.status === 'live' || m.status === 'upcoming').length}+ Markets
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
