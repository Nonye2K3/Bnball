import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsOverview } from "@/components/StatsOverview";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PredictionCard } from "@/components/PredictionCard";
import { MarketDetailsModal } from "@/components/MarketDetailsModal";
import { useState } from "react";
import { motion } from "framer-motion";

const mockMarkets = [
  {
    id: "1",
    title: "Will Lakers beat Warriors by 10+ points on Nov 15, 2025?",
    category: "NBA",
    status: "live" as const,
    deadline: new Date(Date.now() + 86400000 * 2),
    yesOdds: 45.5,
    noOdds: 54.5,
    totalPool: "12.5",
    participants: 156,
    resolutionMethod: "Chainlink Sports Oracle",
  },
  {
    id: "2",
    title: "Will Real Madrid win Champions League Final 2025?",
    category: "FIFA",
    status: "live" as const,
    deadline: new Date(Date.now() + 86400000 * 45),
    yesOdds: 62.3,
    noOdds: 37.7,
    totalPool: "48.2",
    participants: 432,
    resolutionMethod: "UEFA Official Data + AI Verification",
  },
  {
    id: "3",
    title: "Will T1 beat G2 in LoL Worlds Semifinals?",
    category: "E-Sports",
    status: "upcoming" as const,
    deadline: new Date(Date.now() + 86400000 * 7),
    yesOdds: 58.1,
    noOdds: 41.9,
    totalPool: "23.7",
    participants: 289,
    resolutionMethod: "Riot Games API + AI Verification",
  },
  {
    id: "4",
    title: "Will Chiefs beat Bills by 7+ points in Week 12?",
    category: "NFL",
    status: "live" as const,
    deadline: new Date(Date.now() + 86400000 * 5),
    yesOdds: 51.2,
    noOdds: 48.8,
    totalPool: "18.9",
    participants: 203,
    resolutionMethod: "Chainlink Sports Oracle",
  },
  {
    id: "5",
    title: "Will Stephen Curry score 30+ points vs Celtics?",
    category: "NBA",
    status: "completed" as const,
    deadline: new Date(Date.now() - 86400000 * 1),
    yesOdds: 44.2,
    noOdds: 55.8,
    totalPool: "8.4",
    participants: 127,
    resolutionMethod: "Chainlink Sports Oracle",
    result: "YES - Curry scored 34 points (Source: Chainlink On-Chain Oracle)",
  },
  {
    id: "6",
    title: "Will Canelo Alvarez win by knockout in next fight?",
    category: "Boxing",
    status: "upcoming" as const,
    deadline: new Date(Date.now() + 86400000 * 30),
    yesOdds: 67.5,
    noOdds: 32.5,
    totalPool: "31.2",
    participants: 178,
    resolutionMethod: "Boxing Official Results + AI Verification",
  },
];

export default function Markets() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState<typeof mockMarkets[0] | null>(null);

  const filteredMarkets = selectedCategory === "all" 
    ? mockMarkets 
    : mockMarkets.filter(m => m.category.toLowerCase() === selectedCategory);

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="heading-active-markets">Active Markets</h1>
              <p className="text-muted-foreground" data-testid="text-market-count">
                {filteredMarkets.length} prediction markets available
              </p>
            </div>
            <CategoryFilter onCategoryChange={setSelectedCategory} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <div 
                key={market.id} 
                onClick={() => setSelectedMarket(market)} 
                className="cursor-pointer"
                data-testid={`market-card-${market.id}`}
              >
                <PredictionCard {...market} />
              </div>
            ))}
          </div>
          
          {selectedMarket && (
            <MarketDetailsModal
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
