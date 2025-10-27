import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <Card className={`p-6 transition-all ${status === "completed" ? "opacity-75" : ""}`}>
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
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="p-4 rounded-md bg-green-500/5 border border-green-500/20"
          >
            <div className="text-xs text-muted-foreground mb-1">YES</div>
            <motion.div 
              className="text-2xl font-mono font-bold text-green-500" 
              data-testid="text-yes-odds"
              initial={{ scale: 1 }}
              whileHover={{ 
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              {yesOdds.toFixed(1)}%
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">+{(100 / yesOdds * 100 - 100).toFixed(0)}%</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="p-4 rounded-md bg-red-500/5 border border-red-500/20"
          >
            <div className="text-xs text-muted-foreground mb-1">NO</div>
            <motion.div 
              className="text-2xl font-mono font-bold text-red-500" 
              data-testid="text-no-odds"
              initial={{ scale: 1 }}
              whileHover={{ 
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              {noOdds.toFixed(1)}%
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">+{(100 / noOdds * 100 - 100).toFixed(0)}%</div>
          </motion.div>
        </div>
        
        {status === "completed" && result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 rounded-md bg-muted/50 border"
          >
            <div className="text-xs font-semibold text-muted-foreground mb-1">RESULT</div>
            <div className="text-sm" data-testid="text-result">{result}</div>
            {resolutionMethod && (
              <div className="text-xs text-muted-foreground mt-1">
                Source: {resolutionMethod}
              </div>
            )}
          </motion.div>
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
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono font-semibold" data-testid="text-pool-size">
              {totalPool} BNB
            </span>
          </motion.div>
          {status === "live" ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                data-testid="button-place-bet"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Place bet clicked');
                }}
              >
                Place Bet
              </Button>
            </motion.div>
          ) : status === "upcoming" ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                variant="secondary"
                data-testid="button-notify-me"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Notify me clicked');
                }}
              >
                Notify Me
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                variant="outline"
                data-testid="button-view-results"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('View results clicked');
                }}
              >
                View Results
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
