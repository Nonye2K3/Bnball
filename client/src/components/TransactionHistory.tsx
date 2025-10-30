import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeb3 } from "@/hooks/useWeb3";
import { ExternalLink, Filter, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "viem";
import { useQuery } from "@tanstack/react-query";
import { getExplorerUrl } from "@/lib/contractConfig";
import type { Transaction as DBTransaction } from "@shared/schema";

type TransactionType = "All" | "Bets" | "Claims" | "Markets";

interface Transaction {
  id: string;
  type: "Bet" | "Claim" | "Market";
  hash: string;
  chainId: number;
  amount: string;
  status: "Pending" | "Success" | "Failed";
  timestamp: Date;
  metadata?: string;
}

export function TransactionHistory() {
  const { address, isConnected, chain } = useWeb3();
  const [filter, setFilter] = useState<TransactionType>("All");
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Fetch transactions from database
  const { data: dbTransactions, isLoading } = useQuery<DBTransaction[]>({
    queryKey: [`/api/transactions/${address}`],
    enabled: !!address && isConnected,
    refetchInterval: 15000,
  });

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

  // Convert database transactions to UI format
  const transactions: Transaction[] = (dbTransactions && Array.isArray(dbTransactions))
    ? dbTransactions.map((tx: DBTransaction) => {
        // Map transaction type
        let type: "Bet" | "Claim" | "Market" = "Bet";
        if (tx.type === "place_bet") type = "Bet";
        else if (tx.type === "claim_winnings" || tx.type === "claim") type = "Claim";
        else if (tx.type === "create_market") type = "Market";
        
        // Map status
        let status: "Pending" | "Success" | "Failed" = "Success";
        if (tx.status === "pending") status = "Pending";
        else if (tx.status === "failed") status = "Failed";
        
        return {
          id: tx.id,
          type,
          hash: tx.transactionHash,
          chainId: tx.chainId,
          amount: formatEther(BigInt(tx.value)),
          status,
          timestamp: new Date(tx.timestamp),
          metadata: tx.metadata || undefined,
        };
      })
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
                    </div>
                    
                    <a
                      href={getExplorerUrl(tx.chainId, tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline mb-1"
                      data-testid={`link-txn-${tx.hash.slice(0, 8)}`}
                    >
                      <code className="text-xs font-mono text-muted-foreground">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      </code>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                    
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
