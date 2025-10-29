import { Trophy, TrendingUp, Award, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface LeaderboardEntry {
  rank: number;
  address: string;
  winRate: number;
  totalProfit: number;
  betsPlaced: number;
}

const topPlayers: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0x742d...9f3a",
    winRate: 87.5,
    totalProfit: 1245.8,
    betsPlaced: 342
  },
  {
    rank: 2,
    address: "0x8b3e...2c4d",
    winRate: 82.3,
    totalProfit: 986.4,
    betsPlaced: 278
  },
  {
    rank: 3,
    address: "0x5a1c...7e9b",
    winRate: 79.6,
    totalProfit: 742.9,
    betsPlaced: 195
  }
];

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "from-yellow-500 to-yellow-600";
    case 2:
      return "from-gray-400 to-gray-500";
    case 3:
      return "from-orange-600 to-orange-700";
    default:
      return "from-primary/50 to-primary/30";
  }
};

const getRankIcon = (rank: number) => {
  if (rank <= 3) return Trophy;
  return Award;
};

export function LeaderboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="py-24 bg-background relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Top Predictors
          </h2>
          <p className="text-muted-foreground text-lg">
            Join the elite predictors earning real BNB with winning strategies
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Podium Display for Top 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {topPlayers.map((player, index) => {
              const RankIcon = getRankIcon(player.rank);
              return (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={player.rank === 1 ? "md:order-2" : player.rank === 2 ? "md:order-1" : "md:order-3"}
                >
                  <Card 
                    className={`p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all duration-300 ${
                      player.rank === 1 ? 'bg-gradient-to-br from-primary/10 to-transparent border-primary/30' : 'bg-card/50 border-border/30'
                    }`}
                    data-testid={`leaderboard-rank-${player.rank}`}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br ${getRankBadgeColor(player.rank)} flex items-center justify-center shadow-lg`}>
                      <RankIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Player Info */}
                    <div className="mt-2">
                      <div className="text-sm text-muted-foreground mb-2">#{player.rank}</div>
                      <div className="text-xl font-mono font-bold mb-4" data-testid={`player-address-${player.rank}`}>{player.address}</div>

                      {/* Stats */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Win Rate</span>
                          <span className="text-lg font-bold text-secondary" data-testid={`winrate-${player.rank}`}>{player.winRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Profit</span>
                          <span className="text-lg font-bold text-primary" data-testid={`profit-${player.rank}`}>{player.totalProfit.toFixed(1)} BNB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Bets Placed</span>
                          <span className="text-lg font-bold" data-testid={`bets-${player.rank}`}>{player.betsPlaced}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20" data-testid="stat-avg-winrate">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-secondary" />
                <span className="text-sm text-muted-foreground">Average Win Rate</span>
              </div>
              <div className="text-3xl font-bold text-secondary">83.1%</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20" data-testid="stat-total-paidout">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-primary" />
                <span className="text-sm text-muted-foreground">Total Paid Out</span>
              </div>
              <div className="text-3xl font-bold text-primary">2,845 BNB</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/10 to-transparent border-accent/20" data-testid="stat-active-predictors">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-accent" />
                <span className="text-sm text-muted-foreground">Active Predictors</span>
              </div>
              <div className="text-3xl font-bold text-accent">12.4K</div>
            </Card>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <Link href="/markets">
              <Button
                size="lg"
                className="px-10 h-12 bg-primary hover:bg-primary/90 font-bold shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                data-testid="button-start-earning"
              >
                Start Earning
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
