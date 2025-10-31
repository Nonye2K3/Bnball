import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WalletBalance } from "@/components/WalletBalance";
import { BettingHistory } from "@/components/BettingHistory";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ConfigurationAlert } from "@/components/ConfigurationAlert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/hooks/useWeb3";
import { useUserBets } from "@/hooks/usePredictionMarket";
import { useToast } from "@/hooks/use-toast";
import { Copy, TrendingUp, TrendingDown, Target, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { formatEther, parseEther } from "viem";
import { useQuery } from "@tanstack/react-query";
import type { PredictionMarket, Bet } from "@shared/schema";

export default function Profile() {
  const { address, formattedAddress, isConnected, chain } = useWeb3();
  const { bets } = useUserBets();
  const { toast } = useToast();

  // Fetch all markets to calculate real winnings
  const { data: markets } = useQuery<PredictionMarket[]>({
    queryKey: ['/api/markets'],
  });

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  /**
   * Calculate actual winnings based on pool distribution formula
   * Formula: (userBetInPool / winningPool) * totalPool
   * Where userBetInPool = betAmount * 0.88 (after 12% fees)
   */
  const calculateActualWinnings = (
    bet: Bet,
    market: PredictionMarket
  ): bigint => {
    try {
      const betAmount = BigInt(bet.amount);
      
      // 88% of bet amount goes to pools (12% fees: 10% platform + 2% creator)
      const userBetInPool = (betAmount * BigInt(88)) / BigInt(100);
      
      // Determine which pool the user bet on and which pool won
      const betOnYes = bet.prediction === 'yes';
      const yesWon = market.result === 'yes';
      
      // Check if user's prediction matches the winning outcome
      if (betOnYes !== yesWon) {
        // Bet lost
        return BigInt(0);
      }
      
      // Convert pool amounts from decimal strings to BigInt (wei)
      // Pool amounts are stored in BNB format (like "0.5"), need to convert to wei
      const yesPoolBNB = market.yesPoolOnChain || "0";
      const noPoolBNB = market.noPoolOnChain || "0";
      
      // Use parseEther for accurate decimal to wei conversion
      const yesPool = parseEther(yesPoolBNB);
      const noPool = parseEther(noPoolBNB);
      const totalPool = yesPool + noPool;
      
      // Determine winning pool
      const winningPool = yesWon ? yesPool : noPool;
      
      // Handle zero pool edge case (avoid division by zero)
      if (winningPool === BigInt(0) || totalPool === BigInt(0)) {
        console.warn(`Zero pool detected for market ${market.id}`);
        return BigInt(0);
      }
      
      // Calculate winnings: (userBetInPool * totalPool) / winningPool
      const winnings = (userBetInPool * totalPool) / winningPool;
      
      return winnings;
    } catch (error) {
      console.error(`Error calculating winnings for bet ${bet.id}:`, error);
      return BigInt(0);
    }
  };

  // Calculate user statistics with real blockchain data
  const stats = useMemo(() => {
    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return {
        totalBets: 0,
        winRate: 0,
        totalProfit: "0.0000",
        wonBets: 0,
        lostBets: 0,
        activeBets: 0,
      };
    }

    // Create a map of markets by ID for efficient lookup
    const marketsMap = new Map<string, PredictionMarket>();
    if (markets && Array.isArray(markets)) {
      markets.forEach((market) => {
        marketsMap.set(market.id, market);
      });
    }

    const totalBets = bets.length;
    let wonBets = 0;
    let lostBets = 0;
    let activeBets = 0;
    let totalWagered = BigInt(0);
    let totalWon = BigInt(0);

    bets.forEach((bet) => {
      const betAmount = BigInt(bet.amount);
      totalWagered += betAmount;
      
      // Find the corresponding market
      const market = marketsMap.get(bet.marketId);
      
      if (!market) {
        // Market not found - count as active
        activeBets++;
        return;
      }
      
      // Check if market is resolved
      if (market.status !== 'completed' || !market.result) {
        // Market not yet resolved - count as active
        activeBets++;
        return;
      }
      
      // Check if the bet won
      const betOnYes = bet.prediction === 'yes';
      const yesWon = market.result === 'yes';
      const userWon = betOnYes === yesWon;
      
      if (userWon) {
        wonBets++;
        
        // Calculate actual winnings based on pool distribution
        const winnings = calculateActualWinnings(bet, market);
        totalWon += winnings;
      } else {
        lostBets++;
      }
    });

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const profit = totalWon - totalWagered;
    const totalProfit = formatEther(profit);

    return {
      totalBets,
      winRate,
      totalProfit,
      wonBets,
      lostBets,
      activeBets,
    };
  }, [bets, markets]);

  // Show connect wallet prompt if not connected
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
        data-testid="page-profile"
      >
        <Navbar />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="p-12">
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-3" data-testid="heading-connect-wallet">
                  Connect Your Wallet
                </h1>
                <p className="text-muted-foreground text-lg mb-8">
                  To view your profile, betting history, and statistics, please connect your wallet.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <Badge variant="outline" className="text-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Track Performance
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    <Award className="w-3 h-3 mr-1" />
                    View Statistics
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    <Target className="w-3 h-3 mr-1" />
                    Betting History
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Click the "Connect Wallet" button in the navigation bar to get started
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
        
        <Footer />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="page-profile"
    >
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" data-testid="heading-profile">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            View your wallet balance, betting history, and statistics
          </p>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <ConfigurationAlert variant="default" showTitle={true} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <WalletBalance />
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold mb-4" data-testid="heading-wallet-info">
                Wallet Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Connected Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 truncate" data-testid="text-wallet-address">
                      {formattedAddress}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopyAddress}
                      data-testid="button-copy-address"
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {chain && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Network</p>
                    <Badge variant="outline" data-testid="badge-network">
                      {chain.name}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6" data-testid="heading-statistics">
              Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Bets</p>
                </div>
                <p className="text-2xl font-bold font-mono" data-testid="text-total-bets">
                  {stats.totalBets}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
                <p className="text-2xl font-bold font-mono text-green-500" data-testid="text-win-rate">
                  {stats.winRate.toFixed(1)}%
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {parseFloat(stats.totalProfit) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <p className="text-xs text-muted-foreground">Total Profit/Loss</p>
                </div>
                <p 
                  className={`text-2xl font-bold font-mono ${
                    parseFloat(stats.totalProfit) >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                  data-testid="text-total-profit"
                >
                  {parseFloat(stats.totalProfit) >= 0 ? "+" : ""}
                  {parseFloat(stats.totalProfit).toFixed(4)} BNB
                </p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2">Record</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    {stats.wonBets}W
                  </Badge>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    {stats.lostBets}L
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {stats.activeBets}A
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="betting" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="betting" data-testid="tab-betting-history">
                Betting History
              </TabsTrigger>
              <TabsTrigger value="transactions" data-testid="tab-transaction-history">
                Transaction History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="betting">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BettingHistory />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TransactionHistory />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      
      <Footer />
    </motion.div>
  );
}
