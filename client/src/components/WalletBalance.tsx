import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeb3 } from "@/hooks/useWeb3";
import { useBalance } from "wagmi";
import { Wallet, DollarSign, RefreshCw } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

// Mock BNB to USD exchange rate - in production, fetch from API
const BNB_TO_USD = 612.50;

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30,
    restDelta: 0.001 
  });
  
  const display = useTransform(spring, (latest) => 
    latest.toFixed(4)
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function WalletBalance() {
  const { address, isConnected } = useWeb3();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { data: balance, isLoading, refetch } = useBalance({
    address,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Auto-refresh every 10 seconds
    }
  });

  // Update last refresh timestamp
  useEffect(() => {
    if (balance) {
      setLastUpdate(new Date());
    }
  }, [balance]);

  const handleManualRefresh = () => {
    refetch();
  };

  if (!isConnected || !address) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Wallet Balance</h3>
            <p className="text-sm text-muted-foreground">Connect wallet to view</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please connect your wallet to view your balance</p>
        </div>
      </Card>
    );
  }

  if (isLoading || !balance) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-8 w-3/4" />
      </Card>
    );
  }

  const bnbBalance = parseFloat(balance.formatted);
  const usdValue = bnbBalance * BNB_TO_USD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover-elevate">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-3 rounded-lg bg-primary/10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Wallet className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold" data-testid="heading-wallet-balance">Wallet Balance</h3>
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleManualRefresh}
            className="p-2 rounded-lg hover-elevate active-elevate-2"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            data-testid="button-refresh-balance"
            title="Refresh balance"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <motion.span 
                className="text-4xl font-bold font-mono"
                data-testid="text-bnb-balance"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <AnimatedNumber value={bnbBalance} />
              </motion.span>
              <span className="text-xl font-semibold text-muted-foreground">
                {balance.symbol}
              </span>
            </div>
          </div>
          
          <motion.div 
            className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DollarSign className="w-4 h-4 text-green-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">USD Value</p>
              <motion.p 
                className="text-lg font-mono font-semibold text-green-500"
                data-testid="text-usd-value"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.p>
            </div>
            <div className="text-xs text-muted-foreground">
              @ ${BNB_TO_USD.toFixed(2)}
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
