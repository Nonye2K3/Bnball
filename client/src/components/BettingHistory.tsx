import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeb3 } from "@/hooks/useWeb3";
import { useClaimWinnings } from "@/hooks/usePredictionMarket";
import { TrendingUp, Trophy, XCircle, Clock, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "viem";
import { useQuery } from "@tanstack/react-query";
import type { Bet } from "@shared/schema";

type BetStatus = "All" | "Active" | "Won" | "Lost" | "Unclaimed";

interface BetInfo {
  id: string;
  marketId: number;
  marketTitle: string;
  prediction: boolean;
  amount: string;
  odds: number;
  status: "Active" | "Won" | "Lost" | "Unclaimed";
  potentialWinnings?: string;
  actualWinnings?: string;
  timestamp: Date;
  deadline: Date;
}

export function BettingHistory() {
  const { address, isConnected } = useWeb3();
  const [filter, setFilter] = useState<BetStatus>("All");
  const { claimWinnings, isLoading: isClaiming } = useClaimWinnings();

  // Fetch bets from database
  const { data: bets, isLoading } = useQuery<Bet[]>({
    queryKey: [`/api/bets/${address}`],
    enabled: !!address && isConnected,
    refetchInterval: 15000,
  });

  if (!isConnected || !address) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" data-testid="heading-betting-history">
          Betting History
        </h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Connect your wallet to view betting history</p>
        </div>
      </Card>
    );
  }

  // Convert database bets to UI format
  const betHistory: BetInfo[] = (bets && Array.isArray(bets))
    ? bets.map((bet: Bet, index: number) => {
        // Format amount from wei string to ether (convert string to bigint first)
        const amount = formatEther(BigInt(bet.amount));
        
        // Determine status from database data
        // For now, all bets are "Active" unless claimed
        // TODO: Add market resolution status to determine Won/Lost
        let status: "Active" | "Won" | "Lost" | "Unclaimed" = "Active";
        if (bet.claimed) {
          status = "Won";
        }
        
        return {
          id: bet.id,
          marketId: parseInt(bet.marketId),
          marketTitle: `Market #${bet.marketId}`,
          prediction: bet.prediction === 'yes',
          amount,
          odds: 0,
          status,
          potentialWinnings: undefined,
          actualWinnings: undefined,
          timestamp: new Date(bet.timestamp),
          deadline: new Date(),
        };
      })
    : [];

  const filteredBets = betHistory.filter((bet) => {
    if (filter === "All") return true;
    return bet.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <Clock className="w-4 h-4" />;
      case "Won": return <Trophy className="w-4 h-4" />;
      case "Unclaimed": return <Coins className="w-4 h-4" />;
      case "Lost": return <XCircle className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Won": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Unclaimed": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Lost": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleClaim = (marketId: number) => {
    claimWinnings(marketId);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Betting History</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="grid grid-cols-2 gap-4 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" data-testid="heading-betting-history">
          Betting History
        </h3>
        <div className="flex gap-2 flex-wrap">
          {(["All", "Active", "Won", "Lost", "Unclaimed"] as BetStatus[]).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              data-testid={`button-filter-${status.toLowerCase()}`}
              className="text-xs"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {filteredBets.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No bets found</p>
          <p className="text-sm text-muted-foreground">
            {filter !== "All" 
              ? `No ${filter.toLowerCase()} bets yet`
              : "Start betting on markets to see your history"}
          </p>
        </div>
      ) : (
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.06
              }
            }
          }}
        >
          {filteredBets.map((bet, index) => (
            <motion.div
              key={bet.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              transition={{ duration: 0.4 }}
              className="p-5 rounded-lg border hover-elevate"
              data-testid={`bet-item-${index}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold" data-testid="text-market-title">
                      {bet.marketTitle}
                    </h4>
                    <Badge 
                      className={bet.prediction 
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                      data-testid="badge-prediction"
                    >
                      {bet.prediction ? "YES" : "NO"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(bet.status)} data-testid="badge-status">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(bet.status)}
                        {bet.status}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Market #{bet.marketId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bet Amount</p>
                  <p className="font-mono font-semibold" data-testid="text-bet-amount">
                    {parseFloat(bet.amount).toFixed(4)} BNB
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Odds</p>
                  <p className="font-mono font-semibold text-muted-foreground" data-testid="text-odds">
                    N/A
                  </p>
                  <p className="text-xs text-muted-foreground">Requires market data</p>
                </div>
                {bet.status === "Active" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Potential Winnings</p>
                    <p className="font-mono font-semibold text-muted-foreground" data-testid="text-potential-winnings">
                      N/A
                    </p>
                    <p className="text-xs text-muted-foreground">Requires market data</p>
                  </div>
                )}
                {bet.actualWinnings && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {bet.status === "Won" ? "Claimed" : "Winnings"}
                    </p>
                    <p className="font-mono font-semibold text-green-500" data-testid="text-actual-winnings">
                      {bet.actualWinnings} BNB
                    </p>
                  </div>
                )}
              </div>

              {bet.status === "Unclaimed" && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full"
                    onClick={() => handleClaim(bet.marketId)}
                    disabled={isClaiming}
                    data-testid={`button-claim-${index}`}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    {isClaiming ? "Claiming..." : "Claim Winnings"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </Card>
  );
}
