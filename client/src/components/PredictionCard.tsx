import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PredictionCardProps {
  id: string;
  title: string;
  category: string;
  status: "live" | "upcoming" | "completed";
  deadline: Date;
  yesOdds: number;
  noOdds: number;
  totalPool: string;
  participants: number;
  resolutionMethod?: string;
  result?: string;
}

export function PredictionCard({
  title,
  category,
  status,
  deadline,
  yesOdds,
  noOdds,
  totalPool,
  participants,
  resolutionMethod,
  result,
}: PredictionCardProps) {
  const statusColors = {
    live: "bg-green-500/10 text-green-500 border-green-500/20",
    upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <Card className={`p-6 hover-elevate transition-all ${status === "completed" ? "opacity-75" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs" data-testid={`badge-category-${category.toLowerCase()}`}>
            {category}
          </Badge>
          <Badge className={statusColors[status]} data-testid={`badge-status-${status}`}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-4" data-testid="text-market-title">
        {title}
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-md bg-green-500/5 border border-green-500/20">
          <div className="text-xs text-muted-foreground mb-1">YES</div>
          <div className="text-2xl font-mono font-bold text-green-500" data-testid="text-yes-odds">
            {yesOdds.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">+{(100 / yesOdds * 100 - 100).toFixed(0)}%</div>
        </div>
        <div className="p-4 rounded-md bg-red-500/5 border border-red-500/20">
          <div className="text-xs text-muted-foreground mb-1">NO</div>
          <div className="text-2xl font-mono font-bold text-red-500" data-testid="text-no-odds">
            {noOdds.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">+{(100 / noOdds * 100 - 100).toFixed(0)}%</div>
        </div>
      </div>
      
      {status === "completed" && result && (
        <div className="mb-4 p-3 rounded-md bg-muted/50 border">
          <div className="text-xs font-semibold text-muted-foreground mb-1">RESULT</div>
          <div className="text-sm" data-testid="text-result">{result}</div>
          {resolutionMethod && (
            <div className="text-xs text-muted-foreground mt-1">
              Source: {resolutionMethod}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span data-testid="text-deadline">
            {status === "completed" ? "Ended" : formatDistanceToNow(deadline, { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span data-testid="text-participants">{participants}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono font-semibold" data-testid="text-pool-size">
            {totalPool} BNB
          </span>
        </div>
        {status === "live" ? (
          <Button 
            size="sm" 
            data-testid="button-place-bet"
            onClick={() => console.log('Place bet clicked')}
          >
            Place Bet
          </Button>
        ) : status === "upcoming" ? (
          <Button 
            size="sm" 
            variant="secondary"
            data-testid="button-notify-me"
            onClick={() => console.log('Notify me clicked')}
          >
            Notify Me
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            data-testid="button-view-results"
            onClick={() => console.log('View results clicked')}
          >
            View Results
          </Button>
        )}
      </div>
    </Card>
  );
}
