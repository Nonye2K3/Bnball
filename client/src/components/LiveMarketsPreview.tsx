import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface Market {
  id: string;
  league: string;
  match: string;
  startTime: Date;
  deadline: Date;
}

// Sample markets for preview
const sampleMarkets: Market[] = [
  {
    id: "1",
    league: "Premier League",
    match: "Home FC",
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000 + 35 * 60 * 1000), // 3h 35m from now
    deadline: new Date(Date.now() + 3 * 60 * 60 * 1000 + 35 * 60 * 1000)
  },
  {
    id: "2",
    league: "NBA",
    match: "Lakers vs Heat",
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000 + 24 * 60 * 1000), // 3h 24m from now
    deadline: new Date(Date.now() + 3 * 60 * 60 * 1000 + 24 * 60 * 1000)
  },
  {
    id: "3",
    league: "Home FC vs",
    match: "Away FC",
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000 + 1 * 60 * 1000), // 6h 1m from now
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000 + 1 * 60 * 1000)
  },
  {
    id: "4",
    league: "UCL Live FC",
    match: "Home FC vs BC",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 27 * 60 * 1000), // 2h 27m from now
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000 + 27 * 60 * 1000)
  }
];

function MarketCard({ market }: { market: Market }) {
  const [selectedPrediction, setSelectedPrediction] = useState<"YES" | "NO" | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = market.deadline.getTime() - now;
      
      if (distance < 0) {
        setTimeLeft("Closed");
        return;
      }
      
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [market.deadline]);

  return (
    <Card className="p-5 bg-card/80 border border-border/50 hover:border-primary/30 transition-all">
      <div className="space-y-4">
        {/* League Badge */}
        <Badge variant="secondary" className="text-xs font-medium bg-muted/50">
          {market.league}
        </Badge>
        
        {/* Match Name */}
        <h3 className="text-lg font-semibold">{market.match}</h3>
        
        {/* Start Time */}
        <p className="text-sm text-muted-foreground">Start time</p>
        
        {/* YES/NO Toggle Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedPrediction("YES")}
            className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all border ${
              selectedPrediction === "YES"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/50 hover:border-primary/50"
            }`}
            data-testid={`button-yes-${market.id}`}
          >
            YES
          </button>
          <button
            onClick={() => setSelectedPrediction("NO")}
            className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all border ${
              selectedPrediction === "NO"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/50 hover:border-primary/50"
            }`}
            data-testid={`button-no-${market.id}`}
          >
            NO
          </button>
        </div>
        
        {/* Predict Button */}
        <Button 
          className="w-full" 
          size="default"
          disabled={!selectedPrediction}
          data-testid={`button-predict-${market.id}`}
        >
          Predict
        </Button>
        
        {/* Countdown Timer */}
        <p className="text-xs text-muted-foreground text-center">
          Closes in {timeLeft}
        </p>
      </div>
    </Card>
  );
}

export function LiveMarketsPreview() {
  return (
    <div className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold">Live Markets</h2>
          <Link href="/markets">
            <Button variant="outline" data-testid="button-view-all-markets">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </div>
    </div>
  );
}
