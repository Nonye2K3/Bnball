import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, TrendingUp, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import type { PredictionMarket } from "@shared/schema";

interface MarketCardProps {
  market: PredictionMarket;
  onPlaceBet?: () => void;
}

export function MarketCard({ market, onPlaceBet }: MarketCardProps) {
  const yesOdds = parseFloat(market.yesOdds);
  const noOdds = parseFloat(market.noOdds);
  const totalPool = parseFloat(market.totalPool);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'upcoming':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const isActive = market.status === 'live' && new Date(market.deadline) > new Date();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className={`p-6 h-full flex flex-col hover-elevate ${market.status === 'completed' ? 'opacity-75' : ''}`}
        data-testid={`card-market-${market.id}`}
      >
        {/* Header: Sport/League Badge and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {market.league && (
              <Badge variant="outline" className="text-xs font-bold uppercase" data-testid={`badge-league-${market.id}`}>
                <Trophy className="w-3 h-3 mr-1" />
                {market.league}
              </Badge>
            )}
            {market.category && (
              <Badge variant="outline" className="text-xs" data-testid={`badge-category-${market.id}`}>
                {market.category}
              </Badge>
            )}
          </div>
          <Badge className={getStatusColor(market.status)} data-testid={`badge-status-${market.id}`}>
            {market.status.toUpperCase()}
          </Badge>
        </div>

        {/* Match Title */}
        <h3 className="text-lg font-semibold mb-4 line-clamp-2" data-testid={`text-title-${market.id}`}>
          {market.homeTeam && market.awayTeam 
            ? `${market.homeTeam} vs ${market.awayTeam}`
            : market.title
          }
        </h3>

        {/* Odds Display */}
        <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
          {/* YES Option (Home Team) */}
          <div className="p-4 rounded-md bg-green-500/5 border border-green-500/20 flex flex-col">
            <div className="text-xs text-muted-foreground mb-1">
              {market.homeTeam ? market.homeTeam.slice(0, 15) : 'YES'}
            </div>
            <div 
              className="text-2xl font-mono font-bold text-green-500 mb-1" 
              data-testid={`text-yes-odds-${market.id}`}
            >
              {yesOdds.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-auto">
              +{(100 / yesOdds * 100 - 100).toFixed(0)}% return
            </div>
          </div>

          {/* NO Option (Away Team) */}
          <div className="p-4 rounded-md bg-red-500/5 border border-red-500/20 flex flex-col">
            <div className="text-xs text-muted-foreground mb-1">
              {market.awayTeam ? market.awayTeam.slice(0, 15) : 'NO'}
            </div>
            <div 
              className="text-2xl font-mono font-bold text-red-500 mb-1" 
              data-testid={`text-no-odds-${market.id}`}
            >
              {noOdds.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-auto">
              +{(100 / noOdds * 100 - 100).toFixed(0)}% return
            </div>
          </div>
        </div>

        {/* Result Display (if completed) */}
        {market.status === 'completed' && market.result && (
          <div className="mb-4 p-3 rounded-md bg-muted/50 border">
            <div className="text-xs font-semibold text-muted-foreground mb-1">RESULT</div>
            <div className="text-sm" data-testid={`text-result-${market.id}`}>{market.result}</div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span data-testid={`text-deadline-${market.id}`}>
              {market.status === 'completed' 
                ? 'Ended' 
                : formatDistanceToNow(new Date(market.deadline), { addSuffix: true })
              }
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span data-testid={`text-participants-${market.id}`}>{market.participants}</span>
          </div>
        </div>

        {/* Pool Size and CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-mono font-semibold" data-testid={`text-pool-${market.id}`}>
              {totalPool.toFixed(2)} BNB
            </span>
          </div>
          
          {isActive ? (
            <Button 
              size="sm"
              onClick={onPlaceBet}
              data-testid={`button-place-bet-${market.id}`}
            >
              Place Bet
            </Button>
          ) : market.status === 'upcoming' ? (
            <Button 
              size="sm" 
              variant="secondary"
              disabled
              data-testid={`button-notify-${market.id}`}
            >
              Upcoming
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              disabled
              data-testid={`button-view-results-${market.id}`}
            >
              View Results
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
