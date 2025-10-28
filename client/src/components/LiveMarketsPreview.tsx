import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Flame } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";

interface Market {
  id: string;
  league: string;
  match: string;
  countdown: string;
  label: string;
  chartData: number[];
  participants: number;
  poolSize: string;
  yesOdds: number;
  noOdds: number;
  category: string;
}

const categories = ["All Sports", "Football", "Basketball", "Tennis", "Esports", "MMA", "Boxing"];

// Enhanced sample markets
const sampleMarkets: Market[] = [
  {
    id: "1",
    league: "Serie A",
    match: "Inter Milan vs AC Milan",
    countdown: "03:20:15",
    label: "Will Inter Milan Win?",
    chartData: [0.3, 0.4, 0.5, 0.6, 0.7, 0.65, 0.7, 0.75, 0.8],
    participants: 1247,
    poolSize: "45.8",
    yesOdds: 65,
    noOdds: 35,
    category: "Football"
  },
  {
    id: "2",
    league: "NBA",
    match: "Lakers vs Celtics",
    countdown: "02:55:30",
    label: "Will Lakers Win by 10+?",
    chartData: [0.5, 0.45, 0.4, 0.5, 0.6, 0.55, 0.6, 0.65, 0.7],
    participants: 2134,
    poolSize: "89.2",
    yesOdds: 48,
    noOdds: 52,
    category: "Basketball"
  },
  {
    id: "3",
    league: "La Liga",
    match: "Real Madrid vs Barcelona",
    countdown: "17:10:45",
    label: "Over 2.5 Goals?",
    chartData: [0.7, 0.65, 0.6, 0.55, 0.5, 0.55, 0.6, 0.65, 0.7],
    participants: 3421,
    poolSize: "127.5",
    yesOdds: 72,
    noOdds: 28,
    category: "Football"
  }
];

function MiniChart({ data }: { data: number[] }) {
  const width = 140;
  const height = 50;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  // Create gradient path for fill
  const fillPoints = `0,${height} ${points} ${width},${height}`;
  
  return (
    <svg width={width} height={height} className="opacity-80">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill="url(#chartGradient)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MarketCard({ market, index }: { market: Market; index: number }) {
  const [selectedPrediction, setSelectedPrediction] = useState<"YES" | "NO" | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
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
              {market.league}
            </Badge>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs font-medium text-accent uppercase tracking-wide">Live</span>
            </div>
          </div>
          
          {/* Match Title */}
          <h3 className="text-xl font-bold leading-tight min-h-[3rem]">{market.match}</h3>
          
          {/* Question Label */}
          <p className="text-sm text-muted-foreground font-medium">{market.label}</p>
          
          {/* Odds Display */}
          <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-black/20 dark:bg-white/5">
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground mb-1">YES</div>
              <div className="text-2xl font-mono font-bold text-secondary">{market.yesOdds}%</div>
            </div>
            <div className="h-12 w-px bg-border/50" />
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground mb-1">NO</div>
              <div className="text-2xl font-mono font-bold text-accent">{market.noOdds}%</div>
            </div>
          </div>
          
          {/* Chart Visualization */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <MiniChart data={market.chartData} />
            </div>
          </div>
          
          {/* Countdown and Metrics */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{market.countdown}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">{market.participants.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-secondary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">{market.poolSize} BNB</span>
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

export function LiveMarketsPreview() {
  const [selectedCategory, setSelectedCategory] = useState("All Sports");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        
        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleMarkets.map((market, index) => (
            <MarketCard key={market.id} market={market} index={index} />
          ))}
        </div>

        {/* View All Button */}
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
              View All {sampleMarkets.length}+ Markets
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
