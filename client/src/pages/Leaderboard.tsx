import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";

const mockLeaderboard = [
  {
    rank: 1,
    address: "0x742d...8f3b",
    username: "CryptoKing",
    totalBets: 247,
    winRate: 68.4,
    totalProfit: "142.5 BNB",
    accuracy: 89,
  },
  {
    rank: 2,
    address: "0x9a3f...2c1d",
    username: "SportOracle",
    totalBets: 189,
    winRate: 65.1,
    totalProfit: "98.3 BNB",
    accuracy: 85,
  },
  {
    rank: 3,
    address: "0x1e7b...4d9a",
    username: "BetMaster",
    totalBets: 312,
    winRate: 62.8,
    totalProfit: "87.2 BNB",
    accuracy: 82,
  },
  {
    rank: 4,
    address: "0x5c2a...7f8e",
    username: "NBAProphet",
    totalBets: 156,
    winRate: 71.2,
    totalProfit: "76.9 BNB",
    accuracy: 91,
  },
  {
    rank: 5,
    address: "0x8d4f...3a2b",
    username: "ESportsGuru",
    totalBets: 203,
    winRate: 59.3,
    totalProfit: "64.1 BNB",
    accuracy: 78,
  },
  {
    rank: 6,
    address: "0x2f9c...6e1d",
    username: "FIFAFanatic",
    totalBets: 178,
    winRate: 58.7,
    totalProfit: "52.4 BNB",
    accuracy: 76,
  },
  {
    rank: 7,
    address: "0x6a1e...9b4c",
    username: "BoxingBull",
    totalBets: 134,
    winRate: 64.9,
    totalProfit: "48.7 BNB",
    accuracy: 84,
  },
  {
    rank: 8,
    address: "0x3b8d...5f2a",
    username: "NFLNinja",
    totalBets: 201,
    winRate: 55.2,
    totalProfit: "42.3 BNB",
    accuracy: 73,
  },
  {
    rank: 9,
    address: "0x9e2c...1a7d",
    username: "ChainBetter",
    totalBets: 167,
    winRate: 57.5,
    totalProfit: "38.9 BNB",
    accuracy: 75,
  },
  {
    rank: 10,
    address: "0x4d7a...8c3f",
    username: "PredictorPro",
    totalBets: 145,
    winRate: 60.7,
    totalProfit: "35.2 BNB",
    accuracy: 79,
  },
];

export default function Leaderboard() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Top Predictors
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rankings based on total profits, win rate, and prediction accuracy (demo data)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Highest Win Rate</div>
                  <div className="text-2xl font-bold font-mono">71.2%</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">NBAProphet leads in win percentage</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Best Accuracy</div>
                  <div className="text-2xl font-bold font-mono">91%</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">NBAProphet has the most precise predictions</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Most Active</div>
                  <div className="text-2xl font-bold font-mono">312</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">BetMaster leads in total bets placed</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Bets
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Win Rate
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockLeaderboard.map((user) => (
                    <tr
                      key={user.rank}
                      className="hover-elevate transition-colors"
                      data-testid={`row-rank-${user.rank}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.rank <= 3 ? (
                            <Trophy
                              className={`w-5 h-5 ${
                                user.rank === 1
                                  ? "text-yellow-500"
                                  : user.rank === 2
                                  ? "text-gray-400"
                                  : "text-amber-600"
                              }`}
                            />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground w-5 text-center">
                              {user.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold" data-testid={`text-username-${user.rank}`}>
                              {user.username}
                            </div>
                            <code className="text-xs text-muted-foreground font-mono">
                              {user.address}
                            </code>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-mono" data-testid={`text-total-bets-${user.rank}`}>
                          {user.totalBets}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Badge
                          variant={user.winRate >= 65 ? "default" : "outline"}
                          data-testid={`badge-win-rate-${user.rank}`}
                        >
                          {user.winRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-mono text-sm" data-testid={`text-accuracy-${user.rank}`}>
                          {user.accuracy}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-mono font-semibold text-green-500" data-testid={`text-profit-${user.rank}`}>
                          +{user.totalProfit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-lg font-semibold mb-3">How Rankings Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">Total Profit:</strong> Net earnings from all resolved markets
              </div>
              <div>
                <strong className="text-foreground">Win Rate:</strong> Percentage of profitable bets
              </div>
              <div>
                <strong className="text-foreground">Accuracy:</strong> Prediction precision based on market outcomes
              </div>
              <div>
                <strong className="text-foreground">Updated:</strong> Rankings refresh every hour on-chain
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
