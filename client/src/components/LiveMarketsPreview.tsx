import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Market {
  id: string;
  league: string;
  match: string;
  countdown: string;
  label: string;
  chartData: number[];
}

// Sample markets matching the reference image
const sampleMarkets: Market[] = [
  {
    id: "1",
    league: "Serie A",
    match: "Team A vs Team B",
    countdown: "03:20",
    label: "H142",
    chartData: [0.3, 0.4, 0.5, 0.6, 0.7, 0.65, 0.7, 0.75, 0.8]
  },
  {
    id: "2",
    league: "NBA",
    match: "Boston vs Miami",
    countdown: "02:55",
    label: "Realtime prices",
    chartData: [0.5, 0.45, 0.4, 0.5, 0.6, 0.55, 0.6, 0.65, 0.7]
  },
  {
    id: "3",
    league: "La Liga",
    match: "Team C vs Team D",
    countdown: "17:10",
    label: "Pook time prices",
    chartData: [0.7, 0.65, 0.6, 0.55, 0.5, 0.55, 0.6, 0.65, 0.7]
  }
];

function MiniChart({ data }: { data: number[] }) {
  const width = 120;
  const height = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
      />
    </svg>
  );
}

function MarketCard({ market }: { market: Market }) {
  const [selectedPrediction, setSelectedPrediction] = useState<"YES" | "NO" | null>(null);
  
  return (
    <Card className="p-5 bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="flex flex-col gap-4">
        {/* League Badge */}
        <Badge variant="secondary" className="text-xs font-medium bg-muted/30 w-fit">
          {market.league}
        </Badge>
        
        {/* Match Name */}
        <h3 className="text-base font-semibold">{market.match}</h3>
        
        {/* Countdown and Chart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{market.countdown}</span>
          </div>
          <MiniChart data={market.chartData} />
        </div>
        
        {/* Label */}
        <p className="text-xs text-muted-foreground">{market.label}</p>
        
        <p className="text-xs text-muted-foreground/70">H / H</p>
        
        {/* YES/NO Toggle Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedPrediction("YES")}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium text-sm transition-all ${
              selectedPrediction === "YES"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 hover:border-primary/50"
            }`}
            data-testid={`button-yes-${market.id}`}
          >
            YES
          </button>
          <button
            onClick={() => setSelectedPrediction("NO")}
            className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium text-sm transition-all ${
              selectedPrediction === "NO"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 hover:border-primary/50"
            }`}
            data-testid={`button-no-${market.id}`}
          >
            NO
          </button>
        </div>
        
        {/* Predict Button */}
        <Button
          className={`w-full ${selectedPrediction ? 'bg-primary hover:bg-primary/90' : 'opacity-50'}`}
          disabled={!selectedPrediction}
          data-testid={`button-predict-${market.id}`}
        >
          Predict
        </Button>
      </div>
    </Card>
  );
}

export function LiveMarketsPreview() {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-10"
          data-testid="heading-live-markets"
        >
          Live Markets
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleMarkets.map((market, index) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MarketCard market={market} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
