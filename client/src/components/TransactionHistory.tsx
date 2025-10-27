import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUserBets } from "@/hooks/usePredictionMarket";
import { ExternalLink, Filter, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "viem";

type TransactionType = "All" | "Bets" | "Claims" | "Markets";

interface Transaction {
  id: string;
  type: "Bet" | "Claim" | "Market";
  hash: string;
  amount: string;
  status: "Pending" | "Success" | "Failed";
  timestamp: Date;
  marketId?: number;
  prediction?: boolean;
}

export function TransactionHistory() {
  const { address, isConnected, chain } = useWeb3();
  const [filter, setFilter] = useState<TransactionType>("All");
  const [visibleCount, setVisibleCount] = useState(10);
  const { bets, isLoading, refetch } = useUserBets();

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 15000);

    return () => clearInterval(interval);
  }, [isConnected, refetch]);

  if (!isConnected || !address) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" data-testid="heading-transaction-history">
          Transaction History
        </h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Connect your wallet to view transaction history</p>
        </div>
      </Card>
    );
  }

  // Convert bets data to transaction format
  const transactions: Transaction[] = (bets && Array.isArray(bets))
    ? bets.map((bet: any, index: number) => ({
        id: `bet-${index}`,
        type: "Bet" as const,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock hash - replace with actual tx hash from events
        amount: formatEther(bet.amount),
        status: "Success" as const,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Mock timestamp
        marketId: Number(bet.marketId),
        prediction: bet.prediction,
      }))
    : [];

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "All") return true;
    if (filter === "Bets") return tx.type === "Bet";
    if (filter === "Claims") return tx.type === "Claim";
    if (filter === "Markets") return tx.type === "Market";
    return true;
  });

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTransactions.length;

  const getBSCScanUrl = (hash: string) => {
    if (!chain) return "";
    const baseUrl = chain.id === 56 
      ? "https://bscscan.com" 
      : "https://testnet.bscscan.com";
    return `${baseUrl}/tx/${hash}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Bet": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Claim": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Market": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" data-testid="heading-transaction-history">
          Transaction History
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2">
            {(["All", "Bets", "Claims", "Markets"] as TransactionType[]).map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filter === type ? "default" : "outline"}
                onClick={() => setFilter(type)}
                data-testid={`button-filter-${type.toLowerCase()}`}
                className="text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No transactions found</p>
          <p className="text-sm text-muted-foreground">
            {filter !== "All" 
              ? `No ${filter.toLowerCase()} transactions yet`
              : "Start betting to see your transaction history"}
          </p>
        </div>
      ) : (
        <>
          <motion.div 
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {visibleTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-lg border hover-elevate"
                data-testid={`transaction-item-${index}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(tx.type)} data-testid={`badge-type-${tx.type.toLowerCase()}`}>
                        {tx.type}
                      </Badge>
                      <Badge className={getStatusColor(tx.status)} data-testid={`badge-status-${tx.status.toLowerCase()}`}>
                        {tx.status}
                      </Badge>
                      {tx.marketId !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Market #{tx.marketId}
                        </Badge>
                      )}
                      {tx.prediction !== undefined && (
                        <Badge 
                          className={tx.prediction 
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {tx.prediction ? "YES" : "NO"}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono text-muted-foreground truncate" data-testid="text-tx-hash">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      </code>
                      <a
                        href={getBSCScanUrl(tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-testid={`link-bscscan-${index}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span data-testid="text-timestamp">
                          {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono font-semibold text-lg" data-testid="text-amount">
                      {parseFloat(tx.amount).toFixed(4)} BNB
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                variant="outline"
                onClick={() => setVisibleCount(prev => prev + 10)}
                data-testid="button-load-more"
              >
                Load More
              </Button>
            </motion.div>
          )}
        </>
      )}
    </Card>
  );
}
