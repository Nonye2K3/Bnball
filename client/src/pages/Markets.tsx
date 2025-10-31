import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsOverview } from "@/components/StatsOverview";
import { CategoryFilter } from "@/components/CategoryFilter";
import { MarketCard } from "@/components/MarketCard";
import { PlaceBetModal } from "@/components/PlaceBetModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWeb3 } from "@/hooks/useWeb3";
import { RefreshCw, Wallet, AlertCircle, TrendingUp } from "lucide-react";
import type { PredictionMarket } from "@shared/schema";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

function MarketCardSkeleton() {
  return (
    <Card className="p-6 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-full mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </Card>
  );
}

export default function Markets() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const { isConnected, connect, formattedAddress, formattedBalance } = useWeb3();

  // Fetch all markets
  const { 
    data: markets = [], 
    isLoading: isLoadingMarkets, 
    error: marketsError,
    refetch: refetchMarkets 
  } = useQuery<PredictionMarket[]>({
    queryKey: ['/api/markets'],
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  // Sync sports data mutation
  const syncSportsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/markets/sync-football', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
    },
  });

  // Auto-sync on mount
  useEffect(() => {
    syncSportsMutation.mutate();
  }, []);

  // Filter markets by category
  const filteredMarkets = selectedCategory === "all" 
    ? markets 
    : markets.filter(m => {
        const category = m.category?.toLowerCase() || '';
        const league = m.league?.toLowerCase() || '';
        const sport = m.sport?.toLowerCase() || '';
        const searchTerm = selectedCategory.toLowerCase();
        return category.includes(searchTerm) || league.includes(searchTerm) || sport.includes(searchTerm);
      });

  // Sort markets: live first, then upcoming, then completed
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    const statusOrder = { live: 0, upcoming: 1, completed: 2 };
    const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
    
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    // Within same status, sort by deadline (upcoming first)
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const handleSyncSports = () => {
    syncSportsMutation.mutate();
  };

  const liveMarketsCount = markets.filter(m => m.status === 'live').length;
  const upcomingMarketsCount = markets.filter(m => m.status === 'upcoming').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="page-markets"
    >
      <Navbar />
      <StatsOverview />
      
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 mb-8"
          >
            {/* Title and Actions Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2" data-testid="heading-active-markets">
                  Live Prediction Markets
                </h1>
                <div className="text-muted-foreground" data-testid="text-market-count">
                  {isLoadingMarkets ? (
                    <Skeleton className="h-5 w-64" />
                  ) : (
                    <>
                      {liveMarketsCount} live • {upcomingMarketsCount} upcoming • {filteredMarkets.length} total markets
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncSports}
                  disabled={syncSportsMutation.isPending}
                  data-testid="button-sync-sports"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncSportsMutation.isPending ? 'animate-spin' : ''}`} />
                  {syncSportsMutation.isPending ? 'Syncing...' : 'Sync Markets'}
                </Button>
                
                {isConnected ? (
                  <Button variant="secondary" size="sm" data-testid="button-wallet-info">
                    <Wallet className="w-4 h-4 mr-2" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-mono">{formattedAddress}</span>
                      <span className="text-xs text-muted-foreground">{formattedBalance}</span>
                    </div>
                  </Button>
                ) : (
                  <Button onClick={connect} size="sm" data-testid="button-connect-wallet">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <CategoryFilter onCategoryChange={setSelectedCategory} />

            {/* Sync Success Alert */}
            {syncSportsMutation.isSuccess && syncSportsMutation.data && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm text-green-600 dark:text-green-400">
                  Successfully synced {syncSportsMutation.data.total} live football matches from API-Football 
                  ({syncSportsMutation.data.created} new markets created)
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {marketsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load markets. Please try again later.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
          
          {/* Markets Grid */}
          {isLoadingMarkets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <MarketCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedMarkets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Markets Available</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedCategory === 'all' 
                    ? 'There are currently no prediction markets available.'
                    : `No markets found in the ${selectedCategory} category.`
                  }
                </p>
                <div className="flex justify-center gap-3">
                  {selectedCategory !== 'all' && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCategory('all')}
                      data-testid="button-view-all"
                    >
                      View All Markets
                    </Button>
                  )}
                  <Button 
                    onClick={handleSyncSports}
                    disabled={syncSportsMutation.isPending}
                    data-testid="button-refresh-markets"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncSportsMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh Markets
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {sortedMarkets.map((market) => (
                  <motion.div 
                    key={market.id}
                    variants={cardVariants}
                    layout
                    data-testid={`market-container-${market.id}`}
                  >
                    <MarketCard
                      market={market}
                      onPlaceBet={() => setSelectedMarket(market)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          
          {/* Place Bet Modal */}
          {selectedMarket && (
            <PlaceBetModal
              open={!!selectedMarket}
              onOpenChange={(open) => !open && setSelectedMarket(null)}
              market={selectedMarket}
            />
          )}
        </div>
      </div>
      
      <Footer />
    </motion.div>
  );
}
